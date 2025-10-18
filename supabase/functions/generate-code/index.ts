import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, projectId } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile and check tokens
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('token_balance, plan, selected_character')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Estimate token cost (simplified)
    const estimatedCost = Math.ceil(prompt.length / 4) * 2; // rough estimate

    if (profile.token_balance < estimatedCost) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient tokens',
          required: estimatedCost,
          available: profile.token_balance
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Venice AI API
    const veniceApiKey = Deno.env.get('VENICE_AI_API_KEY');
    if (!veniceApiKey) {
      return new Response(
        JSON.stringify({ error: 'Venice AI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calling Venice AI with prompt:', prompt);

    const veniceResponse = await fetch('https://api.venice.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${veniceApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b',
        messages: [
          {
            role: 'system',
            content: profile.selected_character
              ? `You are ${profile.selected_character}. Respond to code generation requests in character while providing high-quality, production-ready code.`
              : 'You are an expert full-stack developer. Generate clean, production-ready code based on user requirements.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!veniceResponse.ok) {
      const errorText = await veniceResponse.text();
      console.error('Venice AI error:', veniceResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Venice AI request failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const veniceData = await veniceResponse.json();
    const generatedCode = veniceData.choices?.[0]?.message?.content || '';
    
    // Calculate actual token usage
    const tokensUsed = veniceData.usage?.total_tokens || estimatedCost;

    // Update user tokens - fetch current value first to increment properly
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('token_consumed')
      .eq('id', user.id)
      .single();

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        token_balance: profile.token_balance - tokensUsed,
        token_consumed: (currentProfile?.token_consumed || 0) + tokensUsed
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating tokens:', updateError);
    }

    // If projectId provided, update project
    if (projectId) {
      await supabase
        .from('projects')
        .update({
          updated_at: new Date().toISOString(),
          deploy_status: 'live'
        })
        .eq('id', projectId)
        .eq('user_id', user.id);
    }

    console.log('Code generation successful. Tokens used:', tokensUsed);

    return new Response(
      JSON.stringify({
        code: generatedCode,
        tokensUsed,
        remainingTokens: profile.token_balance - tokensUsed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-code function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

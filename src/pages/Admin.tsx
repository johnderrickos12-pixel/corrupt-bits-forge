import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Key, Users, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  email: string;
  is_admin: boolean;
  is_owner: boolean;
}

const Admin = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedKey, setGeneratedKey] = useState("");
  const [assignEmail, setAssignEmail] = useState("");
  const [assignKey, setAssignKey] = useState("");
  const [grantEmail, setGrantEmail] = useState("");
  const [stats, setStats] = useState({ users: 0, projects: 0, premiumUsers: 0 });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      if (rolesError) throw rolesError;

      const hasAdminRole = rolesData?.some(r => r.role === 'admin');
      
      if (!hasAdminRole) {
        toast.error("Access denied: Admin privileges required");
        navigate("/dashboard");
        return;
      }

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load stats
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: projectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      const { count: premiumCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('plan', 'free');

      setStats({
        users: usersCount || 0,
        projects: projectsCount || 0,
        premiumUsers: premiumCount || 0,
      });

    } catch (error: any) {
      toast.error(error.message);
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateKey = async (plan: 'premium' | 'ultra') => {
    if (!profile) return;

    const keyCode = `CW-${plan.toUpperCase()}-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;

    try {
      const { error } = await supabase
        .from('premium_keys')
        .insert({
          key_code: keyCode,
          plan: plan,
          created_by: profile.id
        });

      if (error) throw error;

      setGeneratedKey(keyCode);
      toast.success(`Generated ${plan} key: ${keyCode}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAssignKey = async () => {
    if (!assignEmail || !assignKey) {
      toast.error("Email and key are required");
      return;
    }

    try {
      // Find user by email
      const { data: targetProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, plan')
        .eq('email', assignEmail)
        .single();

      if (profileError) throw new Error("User not found");

      // Verify key exists and is unused
      const { data: key, error: keyError } = await supabase
        .from('premium_keys')
        .select('*')
        .eq('key_code', assignKey)
        .eq('is_used', false)
        .single();

      if (keyError || !key) throw new Error("Invalid or used key");

      // Update user plan
      const { error: updateUserError } = await supabase
        .from('profiles')
        .update({ plan: key.plan })
        .eq('id', targetProfile.id);

      if (updateUserError) throw updateUserError;

      // Mark key as used
      const { error: updateKeyError } = await supabase
        .from('premium_keys')
        .update({
          is_used: true,
          used_by: targetProfile.id,
          used_at: new Date().toISOString()
        })
        .eq('key_code', assignKey);

      if (updateKeyError) throw updateKeyError;

      toast.success(`Successfully assigned ${key.plan} plan to ${assignEmail}`);
      setAssignEmail("");
      setAssignKey("");
      await loadAdminData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleGrantAdmin = async () => {
    if (!profile?.is_owner) {
      toast.error("Only owners can grant admin privileges");
      return;
    }

    if (!grantEmail) {
      toast.error("Email is required");
      return;
    }

    try {
      // Find user by email
      const { data: userData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', grantEmail)
        .single();

      if (!userData) {
        toast.error("User not found");
        return;
      }

      // Grant admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userData.id,
          role: 'admin'
        });

      if (error) {
        // Handle duplicate key error gracefully
        if (error.code === '23505') {
          toast.info("User already has admin role");
        } else {
          throw error;
        }
      } else {
        toast.success(`Admin privileges granted to ${grantEmail}`);
      }

      setGrantEmail("");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold font-sans mb-2">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center">
                <Crown className="w-10 h-10 mr-3 text-primary" />
                Admin Panel
              </span>
            </h1>
            <p className="text-muted-foreground">
              {profile.is_owner ? "Owner" : "Admin"}: {profile.email}
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="border-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Generate Keys */}
          <Card className="p-6 border-2 border-primary/30">
            <h2 className="text-2xl font-bold font-sans mb-4 flex items-center">
              <Key className="w-6 h-6 mr-2 text-primary" />
              Generate Keys
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label>Premium Key (1B tokens, $6)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={generatedKey}
                    placeholder="Generated key will appear here"
                    readOnly
                    className="bg-muted"
                  />
                  <Button
                    onClick={() => handleGenerateKey("premium")}
                    className="bg-accent hover:bg-accent/90 whitespace-nowrap"
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div>
                <Label>Ultra Key (1B+ tokens, $7)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={generatedKey}
                    placeholder="Generated key will appear here"
                    readOnly
                    className="bg-muted"
                  />
                  <Button
                    onClick={() => handleGenerateKey("ultra")}
                    className="bg-primary hover:bg-primary/90 whitespace-nowrap"
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Assign Keys */}
          <Card className="p-6 border-2 border-secondary/30">
            <h2 className="text-2xl font-bold font-sans mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2 text-secondary" />
              Assign Keys
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label>User Email</Label>
                <Input
                  value={assignEmail}
                  onChange={(e) => setAssignEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Key to Assign</Label>
                <Input
                  value={assignKey}
                  onChange={(e) => setAssignKey(e.target.value)}
                  placeholder="CW-PREMIUM-xxxxxx"
                  className="mt-2"
                />
              </div>

              <Button
                onClick={handleAssignKey}
                className="w-full bg-secondary hover:bg-secondary/90"
              >
                Assign Key
              </Button>
            </div>
          </Card>

          {/* Grant Admin */}
          {profile.is_owner && (
            <Card className="p-6 border-2 border-accent/30">
              <h2 className="text-2xl font-bold font-sans mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-accent" />
                Grant Admin Privileges
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label>User Email</Label>
                  <Input
                    value={grantEmail}
                    onChange={(e) => setGrantEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={handleGrantAdmin}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  Grant Admin Access
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  ⚠️ Only owners can grant admin privileges
                </p>
              </div>
            </Card>
          )}

          {/* Analytics */}
          <Card className="p-6 border-2 border-border">
            <h2 className="text-2xl font-bold font-sans mb-4">Analytics</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Total Users</span>
                <span className="text-lg font-bold text-primary">{stats.users}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Active Projects</span>
                <span className="text-lg font-bold text-secondary">{stats.projects}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Premium Users</span>
                <span className="text-lg font-bold">{stats.premiumUsers}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;

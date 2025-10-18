import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Code2, Zap, Shield, Cpu } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="inline-block mb-6 animate-float">
            <Sparkles className="w-16 h-16 text-primary animate-sparkle" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 font-sans">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Corrupt-Ware
            </span>
          </h1>
          
          <p className="text-2xl md:text-3xl mb-4 text-muted-foreground font-sans">
            AI Full-Stack Builder with <span className="text-primary">Chaos</span>
          </p>
          
          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-muted-foreground">
            Sandboxed creativity meets cute-glitch aesthetics. Build full-stack apps with rogue AI capabilities.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 bg-primary hover:bg-primary/90 neon-border font-sans">
                Start Building
                <Code2 className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <Link to="/docs">
              <Button size="lg" variant="outline" className="text-lg px-8 border-2 border-accent hover:bg-accent/10 font-sans">
                View Docs
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
          
          <div className="mt-16 text-sm text-muted-foreground">
            <p className="mb-2">🎁 1M Free Tokens on Signup</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-card/50 backdrop-blur-sm" />
        
        <div className="relative z-10 container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 font-sans">
            <span className="bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">
              Core Features
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Code2 className="w-8 h-8 text-primary" />}
              title="Full-Stack Generation"
              description="Natural language prompts scaffold complete front-end, back-end, and database code."
            />
            
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-secondary" />}
              title="Live Preview"
              description="See your app come to life instantly in a sandboxed environment with real-time updates."
            />
            
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-accent" />}
              title="Security Scan"
              description="Automated security checks ensure your code is safe before deployment."
            />
            
            <FeatureCard
              icon={<Cpu className="w-8 h-8 text-primary" />}
              title="Chat & Agent Modes"
              description="Plan with Chat mode or let Agent mode autonomously edit your codebase."
            />
            
            <FeatureCard
              icon={<Sparkles className="w-8 h-8 text-accent" />}
              title="GitHub Integration"
              description="Seamlessly push generated code to your GitHub repositories."
            />
            
            <FeatureCard
              icon={<Code2 className="w-8 h-8 text-secondary" />}
              title="Token System"
              description="Start with 1M free tokens. Premium plans offer character-based AI responses."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 font-sans">
            Ready to <span className="text-primary glitch-text">Corrupt</span> Your Build?
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join the chaos and start building with AI-powered full-stack generation today.
          </p>
          
          <Link to="/auth">
            <Button size="lg" className="text-lg px-12 bg-primary hover:bg-primary/90 neon-border font-sans">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-card border-2 border-border rounded-lg p-6 hover:border-primary transition-all duration-300 hover:shadow-[0_0_20px_hsl(340,100%,70%,0.3)]">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-3 font-sans">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Home;

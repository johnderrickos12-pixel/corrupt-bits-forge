import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Code2, Zap, Settings, LogOut, Crown } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<string | null>(null);
  const [tokens, setTokens] = useState<number>(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("corrupt_user");
    const storedTokens = localStorage.getItem("corrupt_tokens");
    
    if (!storedUser) {
      navigate("/auth");
      return;
    }
    
    setUser(storedUser);
    setTokens(parseInt(storedTokens || "1000000"));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("corrupt_user");
    localStorage.removeItem("corrupt_tokens");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const isAdmin = user === "von357336@gmail.com" || user === "diddy@gmail.com";

  return (
    <div className="min-h-screen p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-sans mb-2">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-muted-foreground">Welcome back, {user}</p>
          </div>
          
          <div className="flex gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => navigate("/admin")}
                className="border-accent hover:bg-accent/10"
              >
                <Crown className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/docs")}>
              <Sparkles className="w-4 h-4 mr-2" />
              Docs
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-2 border-primary/30 hover:border-primary transition-colors">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-primary">{tokens.toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-sans font-semibold mb-1">Tokens Remaining</h3>
            <p className="text-sm text-muted-foreground">Your AI generation budget</p>
          </Card>

          <Card className="p-6 border-2 border-secondary/30 hover:border-secondary transition-colors">
            <div className="flex items-center justify-between mb-4">
              <Code2 className="w-8 h-8 text-secondary" />
              <span className="text-2xl font-bold text-secondary">0</span>
            </div>
            <h3 className="text-lg font-sans font-semibold mb-1">Projects</h3>
            <p className="text-sm text-muted-foreground">Active sandboxed builds</p>
          </Card>

          <Card className="p-6 border-2 border-accent/30 hover:border-accent transition-colors">
            <div className="flex items-center justify-between mb-4">
              <Crown className="w-8 h-8 text-accent" />
              <span className="text-sm font-bold text-accent uppercase">Free</span>
            </div>
            <h3 className="text-lg font-sans font-semibold mb-1">Plan Status</h3>
            <p className="text-sm text-muted-foreground">Upgrade for more features</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-8 border-2 border-border neon-border">
          <h2 className="text-2xl font-bold font-sans mb-6">Quick Actions</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              size="lg"
              className="w-full h-24 text-lg bg-primary hover:bg-primary/90 font-sans"
              onClick={() => toast.info("Project creation coming soon!")}
            >
              <Code2 className="w-6 h-6 mr-3" />
              Create New Project
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full h-24 text-lg border-2 border-secondary hover:bg-secondary/10 font-sans"
              onClick={() => navigate("/premium")}
            >
              <Crown className="w-6 h-6 mr-3" />
              Upgrade to Premium
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full h-24 text-lg border-2 border-accent hover:bg-accent/10 font-sans"
              onClick={() => navigate("/docs")}
            >
              <Sparkles className="w-6 h-6 mr-3" />
              Browse Documentation
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full h-24 text-lg border-2 border-border hover:bg-muted font-sans"
              onClick={() => toast.info("Settings coming soon!")}
            >
              <Settings className="w-6 h-6 mr-3" />
              Account Settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

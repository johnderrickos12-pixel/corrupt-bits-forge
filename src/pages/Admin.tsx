import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Key, Users, Shield, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("corrupt_user");
    
    if (!storedUser) {
      navigate("/auth");
      return;
    }
    
    // Check if user is owner
    const isOwner = storedUser === "von357336@gmail.com" || storedUser === "diddy@gmail.com";
    
    if (!isOwner) {
      toast.error("Access denied: Admin privileges required");
      navigate("/dashboard");
      return;
    }
    
    setUser(storedUser);
  }, [navigate]);

  const handleGenerateKey = (plan: string) => {
    const key = `CW-${plan.toUpperCase()}-${Math.random().toString(36).substring(2, 15)}`;
    toast.success(`Generated ${plan} key: ${key}`);
  };

  if (!user) return null;

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
            <p className="text-muted-foreground">Owner: {user}</p>
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
                  <Input placeholder="Generated key will appear here" disabled className="bg-muted" />
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
                  <Input placeholder="Generated key will appear here" disabled className="bg-muted" />
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
                <Input placeholder="user@example.com" className="mt-2" />
              </div>

              <div>
                <Label>Key to Assign</Label>
                <Input placeholder="CW-PREMIUM-xxxxxx" className="mt-2" />
              </div>

              <Button
                onClick={() => toast.success("Key assigned successfully!")}
                className="w-full bg-secondary hover:bg-secondary/90"
              >
                Assign Key
              </Button>
            </div>
          </Card>

          {/* Grant Admin */}
          <Card className="p-6 border-2 border-accent/30">
            <h2 className="text-2xl font-bold font-sans mb-4 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-accent" />
              Grant Admin Privileges
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label>User Email</Label>
                <Input placeholder="user@example.com" className="mt-2" />
              </div>

              <Button
                onClick={() => toast.success("Admin privileges granted!")}
                className="w-full bg-accent hover:bg-accent/90"
              >
                Grant Admin Access
              </Button>
              
              <p className="text-xs text-muted-foreground">
                ⚠️ Only owners can grant admin privileges
              </p>
            </div>
          </Card>

          {/* Analytics */}
          <Card className="p-6 border-2 border-border">
            <h2 className="text-2xl font-bold font-sans mb-4">Analytics</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Total Users</span>
                <span className="text-lg font-bold text-primary">142</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Active Projects</span>
                <span className="text-lg font-bold text-secondary">89</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Tokens Consumed (24h)</span>
                <span className="text-lg font-bold text-accent">2.4M</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Premium Users</span>
                <span className="text-lg font-bold">23</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;

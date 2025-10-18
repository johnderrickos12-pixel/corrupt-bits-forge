import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Code2, Zap, Settings, LogOut, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  email: string;
  token_balance: number;
  token_consumed: number;
  plan: string;
  is_admin: boolean;
  is_owner: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  deploy_status: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
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

      // Load projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

    } catch (error: any) {
      toast.error(error.message);
      navigate("/auth");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('projects')
        .insert({
          user_id: session.user.id,
          name,
          description,
          deploy_status: 'pending'
        });

      if (error) throw error;

      toast.success("Project created! Starting code generation...");
      await loadUserData();
      
      // Close dialog
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        const closeButton = dialog.querySelector('[aria-label="Close"]') as HTMLButtonElement;
        closeButton?.click();
      }

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCreating(false);
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
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-sans mb-2">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-muted-foreground">Welcome back, {profile.email}</p>
          </div>
          
          <div className="flex gap-2">
            {(profile.is_admin || profile.is_owner) && (
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
              <span className="text-2xl font-bold text-primary">{profile.token_balance.toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-sans font-semibold mb-1">Tokens Remaining</h3>
            <p className="text-sm text-muted-foreground">Your AI generation budget</p>
          </Card>

          <Card className="p-6 border-2 border-secondary/30 hover:border-secondary transition-colors">
            <div className="flex items-center justify-between mb-4">
              <Code2 className="w-8 h-8 text-secondary" />
              <span className="text-2xl font-bold text-secondary">{projects.length}</span>
            </div>
            <h3 className="text-lg font-sans font-semibold mb-1">Projects</h3>
            <p className="text-sm text-muted-foreground">Active sandboxed builds</p>
          </Card>

          <Card className="p-6 border-2 border-accent/30 hover:border-accent transition-colors">
            <div className="flex items-center justify-between mb-4">
              <Crown className="w-8 h-8 text-accent" />
              <span className="text-sm font-bold text-accent uppercase">{profile.plan}</span>
            </div>
            <h3 className="text-lg font-sans font-semibold mb-1">Plan Status</h3>
            <p className="text-sm text-muted-foreground">
              {profile.plan === 'free' ? 'Upgrade for more features' : 'Premium active'}
            </p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-8 border-2 border-border neon-border mb-8">
          <h2 className="text-2xl font-bold font-sans mb-6">Quick Actions</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="w-full h-24 text-lg bg-primary hover:bg-primary/90 font-sans"
                >
                  <Code2 className="w-6 h-6 mr-3" />
                  Create New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-2 border-primary/30">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-sans">Create New Project</DialogTitle>
                  <DialogDescription>
                    Describe what you want to build and AI will generate the code
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="My Awesome App"
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description / Prompt</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="A todo app with user authentication and real-time updates..."
                      required
                      className="mt-2 min-h-[120px]"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Project"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

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

        {/* Projects List */}
        {projects.length > 0 && (
          <Card className="p-6 border-2 border-border">
            <h2 className="text-2xl font-bold font-sans mb-4">Your Projects</h2>
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 bg-card/50 rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{project.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      project.deploy_status === 'live' ? 'bg-secondary/20 text-secondary' :
                      project.deploy_status === 'error' ? 'bg-destructive/20 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {project.deploy_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

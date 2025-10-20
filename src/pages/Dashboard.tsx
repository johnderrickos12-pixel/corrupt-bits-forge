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
  has_admin_role?: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  deploy_status: string;
  created_at: string;
  generated_code?: string;
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

      // Check if user has admin role
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      const hasAdminRole = rolesData?.some(r => r.role === 'admin') || false;
      
      setProfile({ ...profileData, has_admin_role: hasAdminRole });

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

      // Create project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: session.user.id,
          name,
          description,
          deploy_status: 'pending'
        })
        .select()
        .single();

      if (projectError) throw projectError;

      toast.success("Project created! Generating code...");

      // Trigger code generation
      const { data: codeGenData, error: codeGenError } = await supabase.functions.invoke('generate-code', {
        body: { 
          project_id: projectData.id,
          prompt: description 
        }
      });

      if (codeGenError) {
        toast.error("Code generation failed: " + codeGenError.message);
      } else if (codeGenData?.error) {
        toast.error(codeGenData.error);
      } else {
        toast.success("Code generated successfully! 🎉");
      }

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

  const handleRedeemKey = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const keyCode = formData.get("key_code") as string;

    try {
      const { data, error } = await supabase.rpc('redeem_premium_key', {
        _key_code: keyCode
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string; plan?: string };

      if (result?.success) {
        toast.success(result.message);
        await loadUserData();
        
        // Close dialog
        const dialog = document.querySelector('[role="dialog"]');
        if (dialog) {
          const closeButton = dialog.querySelector('[aria-label="Close"]') as HTMLButtonElement;
          closeButton?.click();
        }
      } else {
        toast.error(result?.message || "Failed to redeem key");
      }
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
    <div className="min-h-screen p-6 overflow-hidden">
      {/* Animated Background Layers */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background/90 to-background z-0" />
      <div className="fixed inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 animate-float z-0" />
      
      {/* Floating Particles */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-5xl font-bold font-sans mb-2 hover:animate-glitch">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-neon-pulse">
                Dashboard
              </span>
            </h1>
            <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Welcome back, <span className="text-primary">{profile.email}</span>
            </p>
          </div>
          
          <div className="flex gap-2">
            {profile.has_admin_role && (
              <Button
                variant="outline"
                onClick={() => navigate("/admin")}
                className="border-accent hover:bg-accent/20 hover:border-accent/50 transition-all hover:scale-105 hover:shadow-glow"
              >
                <Crown className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate("/docs")}
              className="hover:scale-105 transition-all hover:shadow-neon"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Docs
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="hover:scale-105 transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-2 border-primary/30 hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-neon backdrop-blur-xl bg-card/80 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-10 h-10 text-primary animate-sparkle" />
              <span className="text-3xl font-bold text-primary">{profile.token_balance.toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-sans font-semibold mb-1 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Tokens Remaining
            </h3>
            <p className="text-sm text-muted-foreground">Your AI generation budget</p>
          </Card>

          <Card className="p-6 border-2 border-secondary/30 hover:border-secondary transition-all duration-300 hover:scale-105 hover:shadow-glow backdrop-blur-xl bg-card/80 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <Code2 className="w-10 h-10 text-secondary animate-float" />
              <span className="text-3xl font-bold text-secondary">{projects.length}</span>
            </div>
            <h3 className="text-lg font-sans font-semibold mb-1 bg-gradient-to-r from-secondary to-secondary/70 bg-clip-text text-transparent">
              Projects
            </h3>
            <p className="text-sm text-muted-foreground">Active sandboxed builds</p>
          </Card>

          <Card className="p-6 border-2 border-accent/30 hover:border-accent transition-all duration-300 hover:scale-105 hover:shadow-corrupt backdrop-blur-xl bg-card/80 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-4">
              <Crown className="w-10 h-10 text-accent animate-sparkle" style={{ animationDelay: '0.5s' }} />
              <span className="text-sm font-bold text-accent uppercase tracking-wider">{profile.plan}</span>
            </div>
            <h3 className="text-lg font-sans font-semibold mb-1 bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
              Plan Status
            </h3>
            <p className="text-sm text-muted-foreground">
              {profile.plan === 'free' ? 'Upgrade for more features' : 'Premium active'}
            </p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-8 border-2 border-border neon-border mb-8 backdrop-blur-xl bg-card/80 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-3xl font-bold font-sans mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Quick Actions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="w-full h-24 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-sans transition-all hover:scale-105 hover:shadow-neon"
                >
                  <Code2 className="w-6 h-6 mr-3 animate-float" />
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

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-24 text-lg border-2 border-secondary hover:bg-secondary/20 hover:border-secondary font-sans transition-all hover:scale-105 hover:shadow-glow"
                >
                  <Crown className="w-6 h-6 mr-3 animate-sparkle" />
                  Redeem Premium Key
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-2 border-secondary/30">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-sans">Redeem Premium Key</DialogTitle>
                  <DialogDescription>
                    Enter your premium or ultra key code to upgrade your account
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRedeemKey} className="space-y-4">
                  <div>
                    <Label htmlFor="key_code">Key Code</Label>
                    <Input
                      id="key_code"
                      name="key_code"
                      placeholder="PREMIUM-XXXX-XXXX-XXXX"
                      required
                      className="mt-2 font-mono"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-secondary hover:bg-secondary/90"
                  >
                    Redeem Key
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              size="lg"
              variant="outline"
              className="w-full h-24 text-lg border-2 border-accent hover:bg-accent/20 hover:border-accent font-sans transition-all hover:scale-105 hover:shadow-corrupt"
              onClick={() => navigate("/docs")}
            >
              <Sparkles className="w-6 h-6 mr-3 animate-sparkle" style={{ animationDelay: '1s' }} />
              Browse Documentation
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full h-24 text-lg border-2 border-border hover:bg-muted hover:border-muted font-sans transition-all hover:scale-105"
              onClick={() => toast.info("Settings coming soon!")}
            >
              <Settings className="w-6 h-6 mr-3 animate-float" />
              Account Settings
            </Button>
          </div>
        </Card>

        {/* Projects List */}
        {projects.length > 0 && (
          <Card className="p-6 border-2 border-border backdrop-blur-xl bg-card/80 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-3xl font-bold font-sans mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Your Projects
            </h2>
            <div className="space-y-3">
              {projects.map((project, index) => (
                <Dialog key={project.id}>
                  <DialogTrigger asChild>
                    <div
                      className="p-4 bg-card/50 rounded-lg border border-border hover:border-primary transition-all duration-300 hover:scale-102 hover:shadow-neon cursor-pointer backdrop-blur-sm animate-fade-in"
                      style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg hover:text-primary transition-colors">{project.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
                          project.deploy_status === 'live' ? 'bg-secondary/20 text-secondary border border-secondary/30 animate-neon-pulse' :
                          project.deploy_status === 'error' ? 'bg-destructive/20 text-destructive border border-destructive/30' :
                          'bg-muted text-muted-foreground border border-border'
                        }`}>
                          {project.deploy_status}
                        </span>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-2 border-primary/30 max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-sans">{project.name}</DialogTitle>
                      <DialogDescription>
                        Project Details and Generated Code
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 overflow-y-auto">
                      <div>
                        <Label className="text-sm font-semibold">Description</Label>
                        <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">Status</Label>
                        <p className={`text-sm mt-1 ${
                          project.deploy_status === 'live' ? 'text-secondary' :
                          project.deploy_status === 'error' ? 'text-destructive' :
                          'text-muted-foreground'
                        }`}>
                          {project.deploy_status}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">Created</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {project.generated_code && (
                        <div>
                          <Label className="text-sm font-semibold">Generated Code</Label>
                          <div className="mt-2 p-4 bg-background/50 rounded-lg border border-border overflow-x-auto">
                            <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
                              {project.generated_code}
                            </pre>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              navigator.clipboard.writeText(project.generated_code || '');
                              toast.success("Code copied to clipboard!");
                            }}
                          >
                            Copy Code
                          </Button>
                        </div>
                      )}
                      {!project.generated_code && project.deploy_status === 'pending' && (
                        <div className="p-4 bg-muted/50 rounded-lg border border-border">
                          <p className="text-sm text-muted-foreground">
                            Code is still being generated. Please wait...
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2 pt-4">
                        <Button
                          className="flex-1 bg-primary hover:bg-primary/90"
                          onClick={() => toast.info("Sandbox feature coming soon!")}
                        >
                          <Code2 className="w-4 h-4 mr-2" />
                          Open in Sandbox
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

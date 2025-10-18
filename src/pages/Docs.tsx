import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, BookOpen, Code2, Zap, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const Docs = () => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Array<{ user: string; text: string; time: string }>>([]);

  const handleAddComment = () => {
    if (!comment.trim()) return;
    
    const user = localStorage.getItem("corrupt_user") || "Anonymous";
    const newComment = {
      user,
      text: comment,
      time: new Date().toLocaleString(),
    };
    
    setComments([newComment, ...comments]);
    setComment("");
    toast.success("Comment added!");
  };

  return (
    <div className="min-h-screen p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
      
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block mb-4 animate-float">
            <BookOpen className="w-12 h-12 text-primary animate-sparkle" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-sans mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Documentation Hub
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Live docs with auto-updates • Community comments • Always current
          </p>
        </div>

        {/* Table of Contents */}
        <Card className="p-6 mb-8 border-2 border-primary/30">
          <h2 className="text-2xl font-bold font-sans mb-4 flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-primary" />
            Table of Contents
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            <DocLink href="#getting-started" title="Getting Started" />
            <DocLink href="#code-generation" title="Code Generation" />
            <DocLink href="#github-integration" title="GitHub Integration" />
            <DocLink href="#token-system" title="Token System" />
            <DocLink href="#premium-plans" title="Premium Plans" />
            <DocLink href="#admin-panel" title="Admin Panel" />
            <DocLink href="#api-reference" title="API Reference" />
            <DocLink href="#security" title="Security & Compliance" />
          </div>
        </Card>

        {/* Documentation Sections */}
        <div className="space-y-8">
          <DocSection
            id="getting-started"
            icon={<Zap className="w-6 h-6 text-primary" />}
            title="Getting Started"
            content={`
Welcome to Corrupt-Ware! This guide will help you start building full-stack applications with AI-powered chaos.

**Step 1: Create an Account**
Sign up to receive 1M free tokens. Your account gives you access to:
- AI code generation
- Sandboxed preview environments
- GitHub integration
- Security scanning

**Step 2: Create Your First Project**
Navigate to your dashboard and click "Create New Project". Describe what you want to build in natural language, and our AI will scaffold the entire stack.

**Step 3: Iterate and Deploy**
Use Chat mode to plan features or Agent mode for autonomous edits. Preview changes live and deploy when ready.
            `}
          />

          <DocSection
            id="code-generation"
            icon={<Code2 className="w-6 h-6 text-secondary" />}
            title="Code Generation"
            content={`
Corrupt-Ware generates complete full-stack applications from natural language prompts.

**Supported Technologies:**
- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Python, Edge Functions
- Database: PostgreSQL, MongoDB, Redis
- Deployment: GitHub, Vercel, Docker

**Example Prompts:**
- "Create a todo app with user authentication"
- "Build an e-commerce dashboard with inventory management"
- "Make a blog platform with markdown support"

**Token Usage:**
Each generation request consumes tokens based on complexity. Simple components use ~1K tokens, full apps use ~50K-100K tokens.
            `}
          />

          <DocSection
            id="token-system"
            icon={<Sparkles className="w-6 h-6 text-accent" />}
            title="Token System"
            content={`
Tokens power all AI operations in Corrupt-Ware.

**Free Plan:**
- 1M tokens on signup
- Refresh monthly (100K tokens)
- Access to all core features

**Premium Plan ($6):**
- 1B tokens
- Choose anime character for AI responses
- Priority generation

**Ultra Plan ($7):**
- 1B+ tokens
- Faster responses
- Advanced persona handling
- Early access to new features

**Purchase:** Join our Discord to purchase premium plans: https://discord.gg/ECGXYrXy6Z
            `}
          />

          <DocSection
            id="admin-panel"
            icon={<BookOpen className="w-6 h-6 text-primary" />}
            title="Admin Panel"
            content={`
The admin panel provides management tools for authorized users.

**Owner Privileges:**
- von357336@gmail.com
- diddy@gmail.com

**Owner Capabilities:**
- Generate premium/ultra keys
- Assign keys to users
- Grant admin privileges
- View all user data
- Moderate documentation comments

**Admin Capabilities:**
- Generate premium/ultra keys
- Assign keys to users
- View user chats
- Moderate docs/comments
- View analytics

Access the admin panel from your dashboard if you have privileges.
            `}
          />
        </div>

        {/* Comments Section */}
        <Card className="p-6 mt-12 border-2 border-accent/30">
          <h2 className="text-2xl font-bold font-sans mb-4 flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-accent" />
            Community Comments
          </h2>

          <div className="space-y-4 mb-6">
            {comments.map((c, i) => (
              <div key={i} className="p-4 bg-card/50 rounded-lg border border-border">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm text-primary">{c.user}</span>
                  <span className="text-xs text-muted-foreground">{c.time}</span>
                </div>
                <p className="text-sm">{c.text}</p>
              </div>
            ))}
            
            {comments.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Textarea
              placeholder="Add a comment to the docs..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] border-accent/30"
            />
            <Button
              onClick={handleAddComment}
              className="w-full bg-accent hover:bg-accent/90 font-sans"
            >
              Post Comment
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

const DocLink = ({ href, title }: { href: string; title: string }) => (
  <a
    href={href}
    className="block p-3 rounded-lg bg-card/50 hover:bg-card border border-border hover:border-primary transition-all"
  >
    <span className="text-sm font-sans">{title}</span>
  </a>
);

const DocSection = ({
  id,
  icon,
  title,
  content,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  content: string;
}) => (
  <Card id={id} className="p-8 border-2 border-border scroll-mt-6">
    <div className="flex items-center mb-4">
      {icon}
      <h2 className="text-2xl font-bold font-sans ml-3">{title}</h2>
    </div>
    <div className="prose prose-invert max-w-none">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <h3 key={i} className="text-lg font-bold mt-4 mb-2 text-primary">
              {line.slice(2, -2)}
            </h3>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <li key={i} className="ml-6 text-muted-foreground">
              {line.slice(2)}
            </li>
          );
        }
        return line.trim() ? (
          <p key={i} className="text-muted-foreground mb-3">
            {line}
          </p>
        ) : null;
      })}
    </div>
  </Card>
);

export default Docs;

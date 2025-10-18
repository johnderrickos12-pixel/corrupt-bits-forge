import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crown, Sparkles, Zap, Check } from "lucide-react";

const Premium = () => {
  const openDiscord = () => {
    window.open("https://discord.gg/ECGXYrXy6Z", "_blank");
  };

  return (
    <div className="min-h-screen p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block mb-4 animate-float">
            <Crown className="w-16 h-16 text-primary animate-sparkle" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-sans mb-4">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Premium Plans
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock anime-character AI responses, massive token allowances, and priority features
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <Card className="p-8 border-2 border-border relative">
            <div className="text-center mb-6">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-bold font-sans mb-2">Free</h3>
              <div className="text-4xl font-bold mb-2">$0</div>
              <p className="text-muted-foreground">Perfect to get started</p>
            </div>

            <ul className="space-y-3 mb-8">
              <Feature text="1M tokens on signup" />
              <Feature text="100K monthly refresh" />
              <Feature text="Code generation" />
              <Feature text="GitHub integration" />
              <Feature text="Security scanning" />
              <Feature text="Community support" />
            </ul>

            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
          </Card>

          {/* Premium Plan */}
          <Card className="p-8 border-2 border-accent relative neon-border animate-neon-pulse">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-background px-4 py-1 rounded-full text-sm font-bold">
              POPULAR
            </div>

            <div className="text-center mb-6">
              <Crown className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-2xl font-bold font-sans mb-2">Premium</h3>
              <div className="text-4xl font-bold mb-2">
                $6<span className="text-lg text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground">For serious builders</p>
            </div>

            <ul className="space-y-3 mb-8">
              <Feature text="1B tokens monthly" highlighted />
              <Feature text="Choose anime character AI" highlighted />
              <Feature text="Character-consistent responses" highlighted />
              <Feature text="Priority generation" />
              <Feature text="All Free features" />
              <Feature text="Discord access" />
            </ul>

            <Button onClick={openDiscord} className="w-full bg-accent hover:bg-accent/90 font-sans">
              Purchase on Discord
            </Button>
          </Card>

          {/* Ultra Plan */}
          <Card className="p-8 border-2 border-primary relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-background px-4 py-1 rounded-full text-sm font-bold">
              ULTIMATE
            </div>

            <div className="text-center mb-6">
              <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold font-sans mb-2">Ultra</h3>
              <div className="text-4xl font-bold mb-2">
                $7<span className="text-lg text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground">Maximum power</p>
            </div>

            <ul className="space-y-3 mb-8">
              <Feature text="1B+ tokens monthly" highlighted />
              <Feature text="All Premium features" highlighted />
              <Feature text="Faster AI responses" highlighted />
              <Feature text="Advanced persona handling" />
              <Feature text="Early feature access" />
              <Feature text="Premium support" />
            </ul>

            <Button onClick={openDiscord} className="w-full bg-primary hover:bg-primary/90 font-sans">
              Purchase on Discord
            </Button>
          </Card>
        </div>

        {/* Character Selection Preview */}
        <Card className="mt-12 p-8 border-2 border-secondary/30">
          <h2 className="text-3xl font-bold font-sans mb-6 text-center">
            <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Choose Your AI Character
            </span>
          </h2>
          
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Premium and Ultra users can select any anime character (Saitama, Naruto, Goku, etc.) 
            to have the AI respond consistently in that character's unique style and personality.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <CharacterExample
              name="Saitama"
              style="Casual, direct, and powerful"
              example='"Okay, I generated your full-stack app. It was so easy, I barely tried."'
            />
            <CharacterExample
              name="Naruto"
              style="Enthusiastic and never gives up"
              example='"Believe it! Your code is ready to deploy! I will keep working hard for you!"'
            />
            <CharacterExample
              name="Custom Character"
              style="Your choice!"
              example="Pick any anime character you want and get responses in their unique voice"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

const Feature = ({ text, highlighted }: { text: string; highlighted?: boolean }) => (
  <li className="flex items-center gap-2">
    <Check className={`w-5 h-5 flex-shrink-0 ${highlighted ? 'text-primary' : 'text-muted-foreground'}`} />
    <span className={highlighted ? 'font-semibold' : 'text-muted-foreground'}>{text}</span>
  </li>
);

const CharacterExample = ({ name, style, example }: { name: string; style: string; example: string }) => (
  <div className="p-6 bg-card/50 rounded-lg border border-border">
    <h4 className="text-lg font-bold font-sans mb-2">{name}</h4>
    <p className="text-sm text-accent mb-3">{style}</p>
    <p className="text-sm text-muted-foreground italic">{example}</p>
  </div>
);

export default Premium;

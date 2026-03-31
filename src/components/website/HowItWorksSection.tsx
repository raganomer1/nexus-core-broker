import { AnimatedSection } from "./AnimatedSection";
import { UserPlus, ShieldCheck, Wallet, TrendingUp } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Register", desc: "Create your account in just 2 minutes with a simple registration form." },
  { icon: ShieldCheck, title: "Verify", desc: "Complete a quick KYC verification to secure your account and enable full access." },
  { icon: Wallet, title: "Fund", desc: "Deposit funds via bank card, wire transfer, or cryptocurrency — instantly." },
  { icon: TrendingUp, title: "Trade", desc: "Access global markets and start trading on our professional platform." },
];

const HowItWorksSection = () => (
  <section className="py-24 md:py-32 bg-background">
    <div className="container mx-auto px-6">
      <AnimatedSection className="text-center mb-16">
        <span className="text-primary text-sm font-semibold uppercase tracking-wider">Getting Started</span>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-5">
          Start Trading in 4 Steps
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          From registration to your first trade — it only takes a few minutes.
        </p>
      </AnimatedSection>

      <div className="relative max-w-4xl mx-auto">
        {/* Connector line */}
        <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <AnimatedSection key={step.title} delay={i * 0.15} className="text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-5 relative z-10 bg-background">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Step {i + 1}</span>
              <h3 className="text-lg font-bold text-foreground mt-2 mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorksSection;

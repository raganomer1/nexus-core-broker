import { AnimatedSection } from "./AnimatedSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";

const accounts = [
  {
    name: "Demo",
    desc: "Practice risk-free with virtual funds",
    deposit: "Free",
    spread: "from 1.5 pips",
    leverage: "1:100",
    popular: false,
    features: ["Virtual $10,000", "All instruments", "Full platform access", "No time limit", "Real market conditions"],
  },
  {
    name: "Standard",
    desc: "For active traders seeking competitive conditions",
    deposit: "$250",
    spread: "from 1.0 pips",
    leverage: "1:200",
    popular: true,
    features: ["All instruments", "Personal manager", "Priority withdrawals", "Trading signals", "Educational materials"],
  },
  {
    name: "VIP",
    desc: "Premium experience for professional traders",
    deposit: "$10,000",
    spread: "from 0.3 pips",
    leverage: "1:500",
    popular: false,
    features: ["Raw spreads", "Dedicated manager", "Instant withdrawals", "Premium analytics", "Private events"],
  },
];

const AccountTypesSection = () => (
  <section className="py-24 md:py-32 bg-muted/30">
    <div className="container mx-auto px-6">
      <AnimatedSection className="text-center mb-16">
        <span className="text-primary text-sm font-semibold uppercase tracking-wider">Account Types</span>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-5">
          Choose Your Trading Level
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Select an account that matches your trading style and experience level.
        </p>
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {accounts.map((acc, i) => (
          <AnimatedSection key={acc.name} delay={i * 0.15}>
            <div
              className={`relative p-8 rounded-2xl border h-full flex flex-col ${
                acc.popular
                  ? "border-primary bg-card shadow-2xl shadow-primary/10 scale-[1.02]"
                  : "border-border bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300"
              }`}
            >
              {acc.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/30">
                  <Star className="w-3 h-3" /> Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold text-foreground mb-2">{acc.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{acc.desc}</p>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Min. Deposit</span>
                  <span className="font-semibold text-foreground">{acc.deposit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spread</span>
                  <span className="font-semibold text-foreground">{acc.spread}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Leverage</span>
                  <span className="font-semibold text-foreground">{acc.leverage}</span>
                </div>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                {acc.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <Link to="/register">
                <Button
                  className="w-full"
                  variant={acc.popular ? "default" : "outline"}
                  size="lg"
                >
                  Open {acc.name} Account
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default AccountTypesSection;

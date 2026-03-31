import { AnimatedSection } from "./AnimatedSection";
import {
  Zap, Globe, Shield, Headphones,
  TrendingUp, CreditCard, Rocket, Server,
} from "lucide-react";

const advantages = [
  { icon: Zap, title: "Lightning Execution", desc: "Sub-millisecond order execution with minimal slippage on all major instruments." },
  { icon: Globe, title: "1,200+ Instruments", desc: "Trade Forex, crypto, stocks, commodities, and indices from a single account." },
  { icon: Shield, title: "Advanced Security", desc: "Bank-grade encryption, 2FA, and segregated client funds for total protection." },
  { icon: Headphones, title: "24/7 Support", desc: "Personal account manager and live chat support available around the clock." },
  { icon: TrendingUp, title: "Smart Analytics", desc: "Real-time charts, market insights, and advanced technical analysis tools." },
  { icon: CreditCard, title: "Flexible Payments", desc: "Fast deposits and withdrawals via cards, bank wire, and cryptocurrency." },
  { icon: Rocket, title: "Quick Onboarding", desc: "Start trading in minutes with a streamlined registration and verification process." },
  { icon: Server, title: "Robust Infrastructure", desc: "Enterprise-grade servers with 99.9% uptime and global low-latency connectivity." },
];

const AdvantagesSection = () => (
  <section className="py-24 md:py-32 bg-background">
    <div className="container mx-auto px-6">
      <AnimatedSection className="text-center mb-16">
        <span className="text-primary text-sm font-semibold uppercase tracking-wider">Why Nexus</span>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-5">
          Built for Serious Traders
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Everything you need to trade the global markets with confidence, speed, and security.
        </p>
      </AnimatedSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {advantages.map((item, i) => (
          <AnimatedSection key={item.title} delay={i * 0.08}>
            <div className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default AdvantagesSection;

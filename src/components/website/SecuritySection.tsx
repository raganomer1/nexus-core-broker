import { AnimatedSection } from "./AnimatedSection";
import { Shield, Lock, Eye, Server, Fingerprint, AlertTriangle } from "lucide-react";

const features = [
  { icon: Lock, title: "SSL Encryption", desc: "256-bit SSL encryption protects all data transmission between you and our servers." },
  { icon: Fingerprint, title: "2FA Authentication", desc: "Multi-factor authentication adds an extra layer of security to your account." },
  { icon: Shield, title: "KYC/AML Compliance", desc: "Rigorous identity verification procedures to prevent fraud and ensure regulatory compliance." },
  { icon: Server, title: "Segregated Accounts", desc: "Client funds are held in segregated accounts, completely separate from company operational funds." },
  { icon: AlertTriangle, title: "DDoS Protection", desc: "Enterprise-grade DDoS mitigation ensures the platform stays available at all times." },
  { icon: Eye, title: "24/7 Monitoring", desc: "Continuous system monitoring and anomaly detection to identify and prevent threats instantly." },
];

const SecuritySection = () => (
  <section className="py-24 md:py-32 bg-muted/30">
    <div className="container mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <AnimatedSection direction="left">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Security & Trust</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-5">
            Your Security Is Our Priority
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            We employ institutional-grade security measures to protect your funds and personal data.
            Trade with peace of mind knowing your assets are safe.
          </p>
          <div className="flex items-center gap-6 flex-wrap">
            {["PCI DSS", "ISO 27001", "GDPR"].map((badge) => (
              <div key={badge} className="px-4 py-2 rounded-lg border border-primary/20 bg-primary/5 text-primary text-sm font-semibold">
                {badge}
              </div>
            ))}
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <AnimatedSection key={f.title} delay={i * 0.1} direction="right">
              <div className="group p-5 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                <f.icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default SecuritySection;

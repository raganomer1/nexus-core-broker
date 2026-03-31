import { AnimatedSection } from "./AnimatedSection";
import { Shield, Lock, Eye, Server, Fingerprint, AlertTriangle } from "lucide-react";
import { useWT } from "@/hooks/useWebsiteTranslation";
import type { WebsiteTranslationKey } from "@/i18n/websiteTranslations";

const featureKeys: { icon: typeof Lock; titleKey: WebsiteTranslationKey; descKey: WebsiteTranslationKey }[] = [
  { icon: Lock, titleKey: "secSSL", descKey: "secSSLDesc" },
  { icon: Fingerprint, titleKey: "sec2FA", descKey: "sec2FADesc" },
  { icon: Shield, titleKey: "secKYC", descKey: "secKYCDesc" },
  { icon: Server, titleKey: "secSeg", descKey: "secSegDesc" },
  { icon: AlertTriangle, titleKey: "secDDoS", descKey: "secDDoSDesc" },
  { icon: Eye, titleKey: "secMon", descKey: "secMonDesc" },
];

const SecuritySection = () => {
  const w = useWT();

  return (
    <section className="py-28 md:py-36 bg-muted/30 website-section">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <AnimatedSection direction="left">
            <span className="text-primary text-xs font-semibold uppercase tracking-[0.2em] block mb-4">{w("secTag")}</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground website-section-title mb-6">{w("secTitle")}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">{w("secDesc")}</p>
            <div className="flex items-center gap-4 flex-wrap">
              {["PCI DSS", "ISO 27001", "GDPR"].map((badge) => (
                <div key={badge} className="px-5 py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-primary text-sm font-bold tracking-wide">
                  {badge}
                </div>
              ))}
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {featureKeys.map((f, i) => (
              <AnimatedSection key={f.titleKey} delay={i * 0.1} direction="right">
                <div className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/20 hover:shadow-xl transition-all duration-500 premium-card">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-500">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{w(f.titleKey)}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{w(f.descKey)}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;

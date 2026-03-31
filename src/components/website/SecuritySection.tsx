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
    <section className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection direction="left">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">{w("secTag")}</span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-5">{w("secTitle")}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">{w("secDesc")}</p>
            <div className="flex items-center gap-6 flex-wrap">
              {["PCI DSS", "ISO 27001", "GDPR"].map((badge) => (
                <div key={badge} className="px-4 py-2 rounded-lg border border-primary/20 bg-primary/5 text-primary text-sm font-semibold">
                  {badge}
                </div>
              ))}
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featureKeys.map((f, i) => (
              <AnimatedSection key={f.titleKey} delay={i * 0.1} direction="right">
                <div className="group p-5 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                  <f.icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-foreground mb-1">{w(f.titleKey)}</h3>
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

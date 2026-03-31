import { AnimatedSection } from "./AnimatedSection";
import {
  Zap, Globe, Shield, Headphones,
  TrendingUp, CreditCard, Rocket, Server,
} from "lucide-react";
import { useWT } from "@/hooks/useWebsiteTranslation";
import type { WebsiteTranslationKey } from "@/i18n/websiteTranslations";

const advantageKeys: { icon: typeof Zap; titleKey: WebsiteTranslationKey; descKey: WebsiteTranslationKey }[] = [
  { icon: Zap, titleKey: "advExec", descKey: "advExecDesc" },
  { icon: Globe, titleKey: "advInstr", descKey: "advInstrDesc" },
  { icon: Shield, titleKey: "advSec", descKey: "advSecDesc" },
  { icon: Headphones, titleKey: "adv247", descKey: "adv247Desc" },
  { icon: TrendingUp, titleKey: "advAnalytics", descKey: "advAnalyticsDesc" },
  { icon: CreditCard, titleKey: "advPayments", descKey: "advPaymentsDesc" },
  { icon: Rocket, titleKey: "advOnboard", descKey: "advOnboardDesc" },
  { icon: Server, titleKey: "advInfra", descKey: "advInfraDesc" },
];

const AdvantagesSection = () => {
  const w = useWT();

  return (
    <section className="py-28 md:py-36 bg-background website-section">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-20">
          <span className="text-primary text-xs font-semibold uppercase tracking-[0.2em] block mb-4">{w("advTag")}</span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground website-section-title mb-6">{w("advTitle")}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">{w("advDesc")}</p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantageKeys.map((item, i) => (
            <AnimatedSection key={item.titleKey} delay={i * 0.08}>
              <div className="group p-7 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 h-full premium-card">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-6 group-hover:from-primary/25 group-hover:to-primary/10 group-hover:scale-105 transition-all duration-500">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3 website-section-title">{w(item.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{w(item.descKey)}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;

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
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">{w("advTag")}</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-5">{w("advTitle")}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{w("advDesc")}</p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantageKeys.map((item, i) => (
            <AnimatedSection key={item.titleKey} delay={i * 0.08}>
              <div className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{w(item.titleKey)}</h3>
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

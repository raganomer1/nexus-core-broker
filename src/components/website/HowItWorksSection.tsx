import { AnimatedSection } from "./AnimatedSection";
import { UserPlus, ShieldCheck, Wallet, TrendingUp } from "lucide-react";
import { useWT } from "@/hooks/useWebsiteTranslation";
import type { WebsiteTranslationKey } from "@/i18n/websiteTranslations";

const stepKeys: { icon: typeof UserPlus; titleKey: WebsiteTranslationKey; descKey: WebsiteTranslationKey }[] = [
  { icon: UserPlus, titleKey: "howRegister", descKey: "howRegisterDesc" },
  { icon: ShieldCheck, titleKey: "howVerify", descKey: "howVerifyDesc" },
  { icon: Wallet, titleKey: "howFund", descKey: "howFundDesc" },
  { icon: TrendingUp, titleKey: "howTrade", descKey: "howTradeDesc" },
];

const HowItWorksSection = () => {
  const w = useWT();

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">{w("howTag")}</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-5">{w("howTitle")}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{w("howDesc")}</p>
        </AnimatedSection>

        <div className="relative max-w-4xl mx-auto">
          <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stepKeys.map((step, i) => (
              <AnimatedSection key={step.titleKey} delay={i * 0.15} className="text-center relative">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-5 relative z-10 bg-background">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">{w("howStep")} {i + 1}</span>
                <h3 className="text-lg font-bold text-foreground mt-2 mb-2">{w(step.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{w(step.descKey)}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

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
    <section className="py-28 md:py-36 bg-background website-section">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-20">
          <span className="text-primary text-xs font-semibold uppercase tracking-[0.2em] block mb-4">{w("howTag")}</span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground website-section-title mb-6">{w("howTitle")}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{w("howDesc")}</p>
        </AnimatedSection>

        <div className="relative max-w-5xl mx-auto">
          <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {stepKeys.map((step, i) => (
              <AnimatedSection key={step.titleKey} delay={i * 0.15} className="text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15 flex items-center justify-center mx-auto mb-6 relative z-10 bg-background">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{w("howStep")} {i + 1}</span>
                <h3 className="text-lg font-bold text-foreground mt-2 mb-3 website-section-title">{w(step.titleKey)}</h3>
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

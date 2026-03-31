import { AnimatedSection } from "@/components/website/AnimatedSection";
import { LayoutDashboard, BarChart3, CreditCard, FileText, Shield, Headphones } from "lucide-react";
import CTASection from "@/components/website/CTASection";
import { useWT } from "@/hooks/useWebsiteTranslation";
import type { WebsiteTranslationKey } from "@/i18n/websiteTranslations";
import platformDashboard from "@/assets/platform-dashboard.jpg";
import platformTerminal from "@/assets/platform-terminal.jpg";
import platformPayments from "@/assets/platform-payments.jpg";
import platformAnalytics from "@/assets/platform-analytics.jpg";

const featureKeys: { icon: typeof LayoutDashboard; titleKey: WebsiteTranslationKey; descKey: WebsiteTranslationKey; itemKeys: WebsiteTranslationKey[]; image?: string }[] = [
  { icon: LayoutDashboard, titleKey: "platPageDashTitle", descKey: "platPageDashDesc", itemKeys: ["platPageDashF1", "platPageDashF2", "platPageDashF3", "platPageDashF4"], image: platformDashboard },
  { icon: BarChart3, titleKey: "platPageTermTitle", descKey: "platPageTermDesc", itemKeys: ["platPageTermF1", "platPageTermF2", "platPageTermF3", "platPageTermF4"], image: platformTerminal },
  { icon: CreditCard, titleKey: "platPagePayTitle", descKey: "platPagePayDesc", itemKeys: ["platPagePayF1", "platPagePayF2", "platPagePayF3", "platPagePayF4"], image: platformPayments },
  { icon: FileText, titleKey: "platPageRepTitle", descKey: "platPageRepDesc", itemKeys: ["platPageRepF1", "platPageRepF2", "platPageRepF3", "platPageRepF4"], image: platformAnalytics },
  { icon: Shield, titleKey: "platPageKYCTitle", descKey: "platPageKYCDesc", itemKeys: ["platPageKYCF1", "platPageKYCF2", "platPageKYCF3", "platPageKYCF4"] },
  { icon: Headphones, titleKey: "platPageSupportTitle", descKey: "platPageSupportDesc", itemKeys: ["platPageSupportF1", "platPageSupportF2", "platPageSupportF3", "platPageSupportF4"] },
];

const PlatformPage = () => {
  const w = useWT();

  return (
    <>
      <section className="pt-32 pb-20 bg-website-dark relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-20" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="container mx-auto px-6 relative z-10">
          <AnimatedSection className="max-w-3xl">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">{w("platPageTag")}</span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mt-4 mb-6">
              {w("platPageTitle1")}<span className="gradient-text">{w("platPageTitleAccent")}</span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">{w("platPageDesc")}</p>
          </AnimatedSection>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 space-y-20">
          {featureKeys.map((f, i) => (
            <AnimatedSection key={f.titleKey} className="grid lg:grid-cols-2 gap-12 items-center">
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <f.icon className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{w(f.titleKey)}</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{w(f.descKey)}</p>
                <ul className="space-y-3">
                  {f.itemKeys.map((ik) => (
                    <li key={ik} className="flex items-center gap-3 text-sm text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {w(ik)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                <div className="rounded-2xl border border-border bg-card p-3 shadow-xl">
                  <div className="rounded-xl bg-muted/50 aspect-video flex items-center justify-center">
                    <f.icon className="w-16 h-16 text-primary/20" />
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <CTASection />
    </>
  );
};

export default PlatformPage;

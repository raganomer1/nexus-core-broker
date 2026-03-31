import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";
import { LayoutDashboard, BarChart3, CreditCard, FileText, Check } from "lucide-react";
import { useWT } from "@/hooks/useWebsiteTranslation";
import type { WebsiteTranslationKey } from "@/i18n/websiteTranslations";
import platformDashboard from "@/assets/platform-dashboard.jpg";
import platformTerminal from "@/assets/platform-terminal.jpg";
import platformPayments from "@/assets/platform-payments.jpg";
import platformAnalytics from "@/assets/platform-analytics.jpg";

const tabKeys: { id: string; icon: typeof LayoutDashboard; titleKey: WebsiteTranslationKey; descKey: WebsiteTranslationKey; featureKeys: WebsiteTranslationKey[] }[] = [
  { id: "dashboard", icon: LayoutDashboard, titleKey: "platDashTitle", descKey: "platDashDesc", featureKeys: ["platDashF1", "platDashF2", "platDashF3", "platDashF4"] },
  { id: "terminal", icon: BarChart3, titleKey: "platTermTitle", descKey: "platTermDesc", featureKeys: ["platTermF1", "platTermF2", "platTermF3", "platTermF4"] },
  { id: "payments", icon: CreditCard, titleKey: "platPayTitle", descKey: "platPayDesc", featureKeys: ["platPayF1", "platPayF2", "platPayF3", "platPayF4"] },
  { id: "analytics", icon: FileText, titleKey: "platRepTitle", descKey: "platRepDesc", featureKeys: ["platRepF1", "platRepF2", "platRepF3", "platRepF4"] },
];

const PlatformSection = () => {
  const [active, setActive] = useState("dashboard");
  const w = useWT();
  const current = tabKeys.find((t) => t.id === active)!;

  return (
    <section className="py-28 md:py-36 bg-muted/30 website-section">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-20">
          <span className="text-primary text-xs font-semibold uppercase tracking-[0.2em] block mb-4">{w("platTag")}</span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground website-section-title mb-6">{w("platTitle")}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{w("platDesc")}</p>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {tabKeys.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  active === tab.id
                    ? "bg-primary text-primary-foreground shadow-xl shadow-primary/25"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {w(tab.titleKey)}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid lg:grid-cols-2 gap-16 items-center"
            >
              <div>
                <h3 className="text-2xl md:text-4xl font-bold text-foreground mb-5 website-section-title">{w(current.titleKey)}</h3>
                <p className="text-muted-foreground leading-relaxed mb-10 text-lg">{w(current.descKey)}</p>
                <div className="space-y-4">
                  {current.featureKeys.map((fk) => (
                    <div key={fk} className="flex items-center gap-3 text-sm text-foreground">
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="font-medium">{w(fk)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="rounded-3xl border border-border bg-card p-3 shadow-2xl premium-border">
                  <div className="rounded-2xl bg-gradient-to-br from-muted/80 to-muted aspect-video flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-primary/10 flex items-center justify-center">
                      <current.icon className="w-20 h-20 text-primary/20" />
                    </div>
                  </div>
                </div>
                <div className="absolute -inset-6 bg-primary/5 rounded-[2rem] blur-3xl -z-10" />
              </div>
            </motion.div>
          </AnimatePresence>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default PlatformSection;

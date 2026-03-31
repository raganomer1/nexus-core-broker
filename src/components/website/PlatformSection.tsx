import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";
import { LayoutDashboard, BarChart3, CreditCard, FileText } from "lucide-react";
import { useWT } from "@/hooks/useWebsiteTranslation";
import type { WebsiteTranslationKey } from "@/i18n/websiteTranslations";

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
    <section className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">{w("platTag")}</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-5">{w("platTitle")}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{w("platDesc")}</p>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {tabKeys.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  active === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
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
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{w(current.titleKey)}</h3>
                <p className="text-muted-foreground leading-relaxed mb-8">{w(current.descKey)}</p>
                <div className="grid grid-cols-2 gap-3">
                  {current.featureKeys.map((fk) => (
                    <div key={fk} className="flex items-center gap-2 text-sm text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {w(fk)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl border border-border bg-card p-2 shadow-2xl">
                  <div className="rounded-xl bg-muted/50 aspect-video flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                      <current.icon className="w-16 h-16 text-primary/30" />
                    </div>
                  </div>
                </div>
                <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl -z-10" />
              </div>
            </motion.div>
          </AnimatePresence>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default PlatformSection;

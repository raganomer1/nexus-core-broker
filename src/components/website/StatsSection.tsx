import { AnimatedSection } from "./AnimatedSection";
import { AnimatedCounter } from "./AnimatedCounter";
import { useWT } from "@/hooks/useWebsiteTranslation";
import type { WebsiteTranslationKey } from "@/i18n/websiteTranslations";

const statKeys: { value: number; suffix: string; labelKey: WebsiteTranslationKey }[] = [
  { value: 50000, suffix: "+", labelKey: "statsTraders" },
  { value: 1200, suffix: "+", labelKey: "statsInstruments" },
  { value: 150, suffix: "+", labelKey: "statsCountries" },
  { value: 99.9, suffix: "%", labelKey: "statsUptime" },
];

const StatsSection = () => {
  const w = useWT();

  return (
    <section className="py-28 md:py-36 bg-website-dark relative overflow-hidden website-section">
      <div className="absolute inset-0 hero-grid opacity-15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-[200px]"
        style={{ background: 'radial-gradient(circle, hsl(217 91% 50% / 0.06), transparent 70%)' }} />

      <div className="container mx-auto px-6 relative z-10">
        <AnimatedSection className="text-center mb-20">
          <span className="text-primary text-xs font-semibold uppercase tracking-[0.2em] block mb-4">{w("statsTag")}</span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white website-section-title">{w("statsTitle")}</h2>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-5xl mx-auto">
          {statKeys.map((stat, i) => (
            <AnimatedSection key={stat.labelKey} delay={i * 0.1} className="text-center">
              <div className="text-4xl md:text-6xl font-extrabold text-white mb-3 website-section-title">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="w-8 h-0.5 bg-primary/40 mx-auto mb-3 rounded-full" />
              <p className="text-sm text-white/40 font-medium">{w(stat.labelKey)}</p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

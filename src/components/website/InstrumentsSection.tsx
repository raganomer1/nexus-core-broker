import { AnimatedSection } from "./AnimatedSection";
import { TrendingUp, Bitcoin, BarChart2, Landmark, Gem } from "lucide-react";
import { useWT } from "@/hooks/useWebsiteTranslation";
import type { WebsiteTranslationKey } from "@/i18n/websiteTranslations";

const instrumentKeys: { icon: typeof TrendingUp; nameKey: WebsiteTranslationKey; countKey: WebsiteTranslationKey; descKey: WebsiteTranslationKey; color: string }[] = [
  { icon: TrendingUp, nameKey: "instrForex", countKey: "instrForexCount", descKey: "instrForexDesc", color: "from-blue-500 to-cyan-400" },
  { icon: Bitcoin, nameKey: "instrCrypto", countKey: "instrCryptoCount", descKey: "instrCryptoDesc", color: "from-orange-500 to-amber-400" },
  { icon: Landmark, nameKey: "instrStocks", countKey: "instrStocksCount", descKey: "instrStocksDesc", color: "from-green-500 to-emerald-400" },
  { icon: Gem, nameKey: "instrComm", countKey: "instrCommCount", descKey: "instrCommDesc", color: "from-yellow-500 to-orange-400" },
  { icon: BarChart2, nameKey: "instrIdx", countKey: "instrIdxCount", descKey: "instrIdxDesc", color: "from-purple-500 to-pink-400" },
];

const InstrumentsSection = () => {
  const w = useWT();

  return (
    <section className="py-28 md:py-36 bg-background website-section">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-20">
          <span className="text-primary text-xs font-semibold uppercase tracking-[0.2em] block mb-4">{w("instrTag")}</span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground website-section-title mb-6">{w("instrTitle")}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{w("instrDesc")}</p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {instrumentKeys.map((item, i) => (
            <AnimatedSection key={item.nameKey} delay={i * 0.1}>
              <div className="group relative p-7 rounded-2xl border border-border bg-card hover:border-transparent hover:shadow-2xl transition-all duration-500 overflow-hidden h-full premium-card">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1 website-section-title">{w(item.nameKey)}</h3>
                  <p className="text-primary text-sm font-bold mb-3">{w(item.countKey)}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{w(item.descKey)}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstrumentsSection;

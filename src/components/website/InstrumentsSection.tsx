import { AnimatedSection } from "./AnimatedSection";
import { TrendingUp, Bitcoin, BarChart2, Landmark, Gem } from "lucide-react";

const instruments = [
  { icon: TrendingUp, name: "Forex", count: "70+ Pairs", desc: "Major, minor, and exotic currency pairs with tight spreads.", color: "from-blue-500 to-cyan-400" },
  { icon: Bitcoin, name: "Crypto", count: "50+ Coins", desc: "Bitcoin, Ethereum, and top altcoins with 24/7 availability.", color: "from-orange-500 to-amber-400" },
  { icon: Landmark, name: "Stocks", count: "500+ Companies", desc: "Trade shares of leading global companies and IPOs.", color: "from-green-500 to-emerald-400" },
  { icon: Gem, name: "Commodities", count: "20+ Assets", desc: "Gold, silver, oil, natural gas, and agricultural products.", color: "from-yellow-500 to-orange-400" },
  { icon: BarChart2, name: "Indices", count: "15+ Indices", desc: "S&P 500, NASDAQ, FTSE, DAX, and other major indices.", color: "from-purple-500 to-pink-400" },
];

const InstrumentsSection = () => (
  <section className="py-24 md:py-32 bg-background">
    <div className="container mx-auto px-6">
      <AnimatedSection className="text-center mb-16">
        <span className="text-primary text-sm font-semibold uppercase tracking-wider">Markets</span>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-5">
          Trade What You Know
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Access a wide range of global financial instruments from one unified platform.
        </p>
      </AnimatedSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {instruments.map((item, i) => (
          <AnimatedSection key={item.name} delay={i * 0.1}>
            <div className="group relative p-6 rounded-2xl border border-border bg-card hover:border-transparent hover:shadow-2xl transition-all duration-500 overflow-hidden h-full">
              {/* Hover gradient bg */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{item.name}</h3>
                <p className="text-primary text-sm font-semibold mb-3">{item.count}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default InstrumentsSection;

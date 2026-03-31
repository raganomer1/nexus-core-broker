import { AnimatedSection } from "./AnimatedSection";
import { AnimatedCounter } from "./AnimatedCounter";

const stats = [
  { value: 50000, suffix: "+", label: "Active Traders" },
  { value: 1200, suffix: "+", label: "Trading Instruments" },
  { value: 150, suffix: "+", label: "Countries Served" },
  { value: 99.9, suffix: "%", label: "Platform Uptime" },
];

const StatsSection = () => (
  <section className="py-24 md:py-32 bg-website-dark relative overflow-hidden">
    <div className="absolute inset-0 hero-grid opacity-20" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px]" />

    <div className="container mx-auto px-6 relative z-10">
      <AnimatedSection className="text-center mb-16">
        <span className="text-primary text-sm font-semibold uppercase tracking-wider">In Numbers</span>
        <h2 className="text-3xl md:text-5xl font-bold text-white mt-3">
          Trusted by Traders Worldwide
        </h2>
      </AnimatedSection>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        {stats.map((stat, i) => (
          <AnimatedSection key={stat.label} delay={i * 0.1} className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </div>
            <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;

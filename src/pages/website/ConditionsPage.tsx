import { AnimatedSection } from "@/components/website/AnimatedSection";
import AccountTypesSection from "@/components/website/AccountTypesSection";
import InstrumentsSection from "@/components/website/InstrumentsSection";
import CTASection from "@/components/website/CTASection";

const conditions = [
  { label: "Spreads", value: "From 0.3 pips" },
  { label: "Commission", value: "From $0" },
  { label: "Leverage", value: "Up to 1:500" },
  { label: "Execution", value: "Market / Instant" },
  { label: "Min. Deposit", value: "From $250" },
  { label: "Processing Speed", value: "<50ms" },
  { label: "Stop Out Level", value: "20%" },
  { label: "Margin Call", value: "50%" },
];

const ConditionsPage = () => (
  <>
    <section className="pt-32 pb-20 bg-website-dark relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-20" />
      <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="container mx-auto px-6 relative z-10">
        <AnimatedSection className="max-w-3xl">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Trading Conditions</span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mt-4 mb-6">
            Competitive <span className="gradient-text">Trading Conditions</span>
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Transparent pricing, tight spreads, and fast execution — we provide the conditions
            professional traders expect and deserve.
          </p>
        </AnimatedSection>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>

    {/* Conditions grid */}
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5">Overview</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Key trading parameters across all account types.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {conditions.map((c, i) => (
            <AnimatedSection key={c.label} delay={i * 0.05}>
              <div className="p-6 rounded-2xl border border-border bg-card text-center hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <p className="text-2xl font-bold text-foreground mb-1">{c.value}</p>
                <p className="text-sm text-muted-foreground">{c.label}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    <AccountTypesSection />
    <InstrumentsSection />
    <CTASection />
  </>
);

export default ConditionsPage;

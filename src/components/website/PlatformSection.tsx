import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";
import { LayoutDashboard, BarChart3, CreditCard, FileText } from "lucide-react";

const tabs = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Client Dashboard",
    desc: "A comprehensive personal cabinet with portfolio overview, account management, real-time balances, and instant access to all platform features.",
    features: ["Portfolio Overview", "Account Management", "Quick Deposits", "Activity History"],
  },
  {
    id: "terminal",
    icon: BarChart3,
    title: "Trading Terminal",
    desc: "Professional-grade terminal with advanced charting, one-click execution, multiple order types, and real-time market data across all asset classes.",
    features: ["Advanced Charts", "One-Click Trading", "Market Depth", "Multiple Timeframes"],
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "Payment System",
    desc: "Seamless deposits and withdrawals with multiple payment methods, instant processing, and full transaction history with detailed reporting.",
    features: ["Instant Deposits", "Fast Withdrawals", "Multiple Methods", "Transaction History"],
  },
  {
    id: "analytics",
    icon: FileText,
    title: "Analytics & Reports",
    desc: "Detailed trading reports, performance analytics, and exportable data to help you track and optimize your trading strategy.",
    features: ["Trade Reports", "P&L Analytics", "Export to Excel", "Custom Filters"],
  },
];

const PlatformSection = () => {
  const [active, setActive] = useState("dashboard");
  const current = tabs.find((t) => t.id === active)!;

  return (
    <section className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Platform</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-5">
            One Platform, Endless Possibilities
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From portfolio management to professional trading — everything in one seamless ecosystem.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          {/* Tab buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {tabs.map((tab) => (
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
                {tab.title}
              </button>
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{current.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-8">{current.desc}</p>
                <div className="grid grid-cols-2 gap-3">
                  {current.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mockup preview */}
              <div className="relative">
                <div className="rounded-2xl border border-border bg-card p-2 shadow-2xl">
                  <div className="rounded-xl bg-muted/50 aspect-video flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                      <current.icon className="w-16 h-16 text-primary/30" />
                    </div>
                  </div>
                </div>
                {/* Glow effect */}
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

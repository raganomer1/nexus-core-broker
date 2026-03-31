import { AnimatedSection } from "@/components/website/AnimatedSection";
import { LayoutDashboard, BarChart3, CreditCard, FileText, Shield, Headphones } from "lucide-react";
import CTASection from "@/components/website/CTASection";

const features = [
  {
    icon: LayoutDashboard,
    title: "Client Dashboard",
    desc: "A comprehensive personal cabinet where you manage your accounts, view balances, track activity, and access all platform features from one place.",
    items: ["Portfolio overview", "Account management", "Quick deposits & withdrawals", "Activity history & notifications"],
  },
  {
    icon: BarChart3,
    title: "Trading Terminal",
    desc: "Professional-grade web terminal with advanced charting, multiple order types, real-time data feeds, and one-click execution across all asset classes.",
    items: ["Advanced TradingView charts", "One-click execution", "Multiple order types", "Real-time market depth"],
  },
  {
    icon: CreditCard,
    title: "Payment System",
    desc: "Seamless deposits and withdrawals with multiple payment methods. Instant processing for most methods with complete transaction transparency.",
    items: ["Card payments (Visa/MC)", "Bank wire transfers", "Cryptocurrency deposits", "Instant processing"],
  },
  {
    icon: FileText,
    title: "Reports & Analytics",
    desc: "Detailed trading reports, performance analytics, and exportable data to help track and optimize your strategy over time.",
    items: ["Trade history & P&L", "Downloadable reports", "Custom date filters", "Excel export"],
  },
  {
    icon: Shield,
    title: "KYC & Verification",
    desc: "Streamlined identity verification process that's quick, secure, and compliant with international regulatory standards.",
    items: ["Fast document upload", "Automated verification", "Secure data handling", "Regulatory compliance"],
  },
  {
    icon: Headphones,
    title: "Support Center",
    desc: "24/7 support via live chat, email, and phone. VIP clients enjoy dedicated personal managers and priority assistance.",
    items: ["24/7 live chat", "Email support", "Phone support", "Personal manager (VIP)"],
  },
];

const PlatformPage = () => (
  <>
    <section className="pt-32 pb-20 bg-website-dark relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-20" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="container mx-auto px-6 relative z-10">
        <AnimatedSection className="max-w-3xl">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Platform</span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mt-4 mb-6">
            All-in-One <span className="gradient-text">Trading Ecosystem</span>
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            From portfolio management to professional trading, analytics and payments —
            everything you need in one seamless, modern platform.
          </p>
        </AnimatedSection>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>

    <section className="py-24 bg-background">
      <div className="container mx-auto px-6 space-y-20">
        {features.map((f, i) => (
          <AnimatedSection key={f.title} className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={i % 2 === 1 ? "lg:order-2" : ""}>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <f.icon className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{f.title}</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">{f.desc}</p>
              <ul className="space-y-3">
                {f.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {item}
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

export default PlatformPage;

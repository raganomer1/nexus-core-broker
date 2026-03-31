import { AnimatedSection } from "@/components/website/AnimatedSection";
import { AnimatedCounter } from "@/components/website/AnimatedCounter";
import { Target, Eye, Cpu, Globe, Users, Award } from "lucide-react";

const values = [
  { icon: Target, title: "Mission-Driven", desc: "Empowering individuals to participate in global financial markets with professional-grade tools." },
  { icon: Eye, title: "Transparency", desc: "Clear pricing, honest communication, and no hidden fees. What you see is what you get." },
  { icon: Cpu, title: "Technology First", desc: "We invest heavily in technology to deliver the fastest, most reliable trading experience." },
  { icon: Globe, title: "Global Reach", desc: "Serving traders in 150+ countries with localized support and multi-currency accounts." },
  { icon: Users, title: "Client Focused", desc: "Every product decision we make is driven by the needs and feedback of our trading community." },
  { icon: Award, title: "Excellence", desc: "We pursue excellence in execution, support, and platform quality — every single day." },
];

const AboutPage = () => (
  <>
    {/* Hero */}
    <section className="pt-32 pb-20 bg-website-dark relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-20" />
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="container mx-auto px-6 relative z-10">
        <AnimatedSection className="max-w-3xl">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">About SPI Trade</span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mt-4 mb-6">
            Building the Future of <span className="gradient-text">Online Trading</span>
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            SPI Trade is a technology-driven brokerage platform built for the modern trader.
            We combine institutional-grade infrastructure with an intuitive user experience
            to make professional trading accessible to everyone.
          </p>
        </AnimatedSection>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>

    {/* Mission & Vision */}
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          <AnimatedSection direction="left">
            <h2 className="text-3xl font-bold text-foreground mb-5">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              To democratize access to global financial markets by providing cutting-edge technology,
              transparent conditions, and exceptional support. We believe every trader deserves
              professional-grade tools, regardless of their account size or experience level.
            </p>
          </AnimatedSection>
          <AnimatedSection direction="right">
            <h2 className="text-3xl font-bold text-foreground mb-5">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              To become the most trusted and technologically advanced brokerage platform in the world.
              We're building an ecosystem where innovation meets reliability, and where every client
              can achieve their financial goals with confidence.
            </p>
          </AnimatedSection>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 50000, suffix: "+", label: "Active Traders" },
            { value: 150, suffix: "+", label: "Countries" },
            { value: 2014, suffix: "", label: "Founded", prefix: "" },
            { value: 99.9, suffix: "%", label: "Uptime" },
          ].map((stat, i) => (
            <AnimatedSection key={stat.label} delay={i * 0.1} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-5">Our Values</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            The principles that guide everything we do at SPI Trade.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <AnimatedSection key={v.title} delay={i * 0.1}>
              <div className="group p-7 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300 h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <v.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Technology */}
    <section className="py-24 bg-website-dark relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-15" />
      <div className="container mx-auto px-6 relative z-10">
        <AnimatedSection className="text-center max-w-3xl mx-auto">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Technology</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-6">
            Built on Modern Infrastructure
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            Our platform is built on enterprise-grade infrastructure with global low-latency connectivity,
            real-time data processing, and redundant systems ensuring maximum uptime and reliability.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {["Sub-50ms Execution", "99.9% Uptime", "Global CDN", "Auto-Scaling", "Real-Time Data", "Bank-Grade Security"].map((t) => (
              <div key={t} className="glass-card px-4 py-3 text-sm text-gray-300 font-medium">
                {t}
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  </>
);

export default AboutPage;

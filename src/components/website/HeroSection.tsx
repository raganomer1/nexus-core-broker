import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, BarChart3, Headphones, TrendingUp, Globe } from "lucide-react";
import { useWT } from "@/hooks/useWebsiteTranslation";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const w = useWT();

  const trustItems = [
    { icon: Zap, label: w("trustFastExec"), desc: w("trustFastExecDesc") },
    { icon: BarChart3, label: w("trustAssets"), desc: w("trustAssetsDesc") },
    { icon: Shield, label: w("trustSecure"), desc: w("trustSecureDesc") },
    { icon: Headphones, label: w("trustSupport"), desc: w("trustSupportDesc") },
  ];

  const floatingStats = [
    { value: "50K+", label: w("trustFastExec") },
    { value: "250+", label: w("trustAssets") },
    { value: "0.01s", label: w("trustFastExecDesc") },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-hsl(222,47%,5%)" />
      </div>

      {/* Animated orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px]"
        style={{ background: 'radial-gradient(circle, hsl(217 91% 50% / 0.12), transparent 70%)' }}
        animate={{ x: [0, 50, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/6 w-[500px] h-[500px] rounded-full blur-[130px]"
        style={{ background: 'radial-gradient(circle, hsl(199 89% 48% / 0.08), transparent 70%)' }}
        animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-6 relative z-10 pt-32 pb-24">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white/80 text-sm font-medium mb-10">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              {w("heroTag")}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.05] mb-8 website-section-title"
          >
            {w("heroTitle1")}
            <br />
            <span className="gradient-text">{w("heroTitleAccent")}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          >
            {w("heroDesc")}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            <Link to="/register">
              <Button size="lg" className="text-base px-10 py-6 gap-2 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 rounded-xl font-semibold">
                {w("wOpenAccount")} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/platform">
              <Button size="lg" variant="outline" className="text-base px-10 py-6 border-white/15 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl font-medium">
                {w("heroExplore")}
              </Button>
            </Link>
          </motion.div>

          {/* Trust cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {trustItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                className="glass-card premium-card p-5 flex flex-col items-center gap-3 cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-white">{item.label}</span>
                <span className="text-xs text-white/40 leading-relaxed">{item.desc}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;

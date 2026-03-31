import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, BarChart3, Headphones } from "lucide-react";

const trustItems = [
  { icon: Zap, label: "Fast Execution", desc: "<50ms average" },
  { icon: BarChart3, label: "1,200+ Assets", desc: "Global markets" },
  { icon: Shield, label: "Secure", desc: "Bank-grade protection" },
  { icon: Headphones, label: "24/7 Support", desc: "Always available" },
];

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center overflow-hidden bg-website-dark">
    <div className="absolute inset-0 hero-grid opacity-40" />

    {/* Floating glow orbs */}
    <motion.div
      className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]"
      animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-1/3 right-1/5 w-[400px] h-[400px] rounded-full bg-blue-400/8 blur-[100px]"
      animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />

    <div className="container mx-auto px-6 relative z-10 pt-28 pb-20">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
            <Zap className="w-3.5 h-3.5" />
            Next-Generation Trading Platform
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6"
        >
          Your Gateway to{" "}
          <span className="gradient-text">Global Markets</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Trade with confidence on a cutting-edge platform built for modern investors.
          Access 1,000+ instruments with institutional-grade execution.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
        >
          <Link to="/register">
            <Button size="lg" className="text-base px-8 gap-2 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-shadow">
              Open Account <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/platform">
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 border-white/20 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm"
            >
              Explore Platform
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {trustItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              className="glass-card p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors"
            >
              <item.icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-white">{item.label}</span>
              <span className="text-xs text-gray-500">{item.desc}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>

    {/* Bottom gradient fade */}
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
  </section>
);

export default HeroSection;

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { useWT } from "@/hooks/useWebsiteTranslation";

const CTASection = () => {
  const w = useWT();

  return (
    <section className="py-32 md:py-40 bg-website-dark relative overflow-hidden website-section">
      <div className="absolute inset-0 hero-grid opacity-10" />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] rounded-full blur-[200px]"
        style={{ background: 'radial-gradient(ellipse, hsl(217 91% 50% / 0.12), transparent 70%)' }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <AnimatedSection className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 website-section-title leading-tight">{w("ctaTitle")}</h2>
          <p className="text-lg md:text-xl text-white/40 mb-12 leading-relaxed max-w-2xl mx-auto font-light">{w("ctaDesc")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="text-base px-10 py-6 gap-2 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 rounded-xl font-semibold">
                {w("wOpenAccount")} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/contacts">
              <Button size="lg" variant="outline" className="text-base px-10 py-6 border-white/15 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl font-medium">
                {w("ctaContact")}
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default CTASection;

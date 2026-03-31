import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";

const CTASection = () => (
  <section className="py-24 md:py-32 bg-website-dark relative overflow-hidden">
    <div className="absolute inset-0 hero-grid opacity-15" />
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary/10 blur-[150px]"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />

    <div className="container mx-auto px-6 relative z-10">
      <AnimatedSection className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Ready to Start Trading?
        </h2>
        <p className="text-lg text-gray-400 mb-10 leading-relaxed">
          Join thousands of traders who already trust SPI Trade for their trading needs.
          Open your account today and get access to global markets.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" className="text-base px-8 gap-2 shadow-xl shadow-primary/30">
              Open Account <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/contacts">
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 border-white/20 text-white bg-white/5 hover:bg-white/10"
            >
              Contact Us
            </Button>
          </Link>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

export default CTASection;

import FAQSection from "@/components/website/FAQSection";
import CTASection from "@/components/website/CTASection";
import { AnimatedSection } from "@/components/website/AnimatedSection";
import { useWT } from "@/hooks/useWebsiteTranslation";

const FAQPage = () => {
  const w = useWT();

  return (
    <>
      <section className="pt-32 pb-20 bg-website-dark relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="container mx-auto px-6 relative z-10">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">{w("faqPageTag")}</span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mt-4 mb-6">
              {w("faqPageTitle1")}<span className="gradient-text">{w("faqPageTitleAccent")}</span>
            </h1>
            <p className="text-lg text-gray-400">{w("faqPageDesc")}</p>
          </AnimatedSection>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      <FAQSection showAll />
      <CTASection />
    </>
  );
};

export default FAQPage;

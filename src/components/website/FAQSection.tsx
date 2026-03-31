import { AnimatedSection } from "./AnimatedSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useWT } from "@/hooks/useWebsiteTranslation";
import type { WebsiteTranslationKey } from "@/i18n/websiteTranslations";

const faqKeys: { qKey: WebsiteTranslationKey; aKey: WebsiteTranslationKey }[] = [
  { qKey: "faq1Q", aKey: "faq1A" },
  { qKey: "faq2Q", aKey: "faq2A" },
  { qKey: "faq3Q", aKey: "faq3A" },
  { qKey: "faq4Q", aKey: "faq4A" },
  { qKey: "faq5Q", aKey: "faq5A" },
  { qKey: "faq6Q", aKey: "faq6A" },
  { qKey: "faq7Q", aKey: "faq7A" },
  { qKey: "faq8Q", aKey: "faq8A" },
];

interface FAQSectionProps {
  showAll?: boolean;
}

const FAQSection = ({ showAll = false }: FAQSectionProps) => {
  const w = useWT();
  const displayFaqs = showAll ? faqKeys : faqKeys.slice(0, 6);

  return (
    <section className="py-28 md:py-36 bg-background website-section">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-20">
          <span className="text-primary text-xs font-semibold uppercase tracking-[0.2em] block mb-4">{w("faqTag")}</span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground website-section-title mb-6">{w("faqTitle")}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{w("faqDesc")}</p>
        </AnimatedSection>

        <AnimatedSection delay={0.2} className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {displayFaqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-2xl px-7 data-[state=open]:border-primary/30 data-[state=open]:shadow-xl data-[state=open]:shadow-primary/5 transition-all duration-500 bg-card"
              >
                <AccordionTrigger className="text-left font-bold text-foreground hover:text-primary hover:no-underline py-6 website-section-title">
                  {w(faq.qKey)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {w(faq.aKey)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default FAQSection;

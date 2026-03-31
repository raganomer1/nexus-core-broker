import { AnimatedSection } from "./AnimatedSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "How do I open a trading account?", a: "Click 'Open Account', fill in your details, and complete the KYC verification. The entire process takes about 5 minutes. You can start with a free demo account to practice." },
  { q: "What documents are required for verification?", a: "You'll need a valid government-issued ID (passport or driver's license) and a proof of address (utility bill or bank statement dated within the last 3 months)." },
  { q: "How can I deposit funds?", a: "We support multiple payment methods including bank cards (Visa/Mastercard), wire transfers, and popular cryptocurrencies. Deposits are processed instantly for most methods." },
  { q: "How long do withdrawals take?", a: "Standard withdrawals are processed within 24 hours. VIP account holders enjoy instant withdrawal processing. The actual delivery time depends on your payment provider." },
  { q: "What trading instruments are available?", a: "We offer 1,200+ instruments across Forex (70+ pairs), cryptocurrencies (50+ coins), stocks (500+ companies), commodities, and major global indices." },
  { q: "Is there a demo account available?", a: "Yes! Our demo account comes with $10,000 in virtual funds, access to all instruments, and no time limit. It's the perfect way to learn and test strategies risk-free." },
  { q: "How does the trading terminal work?", a: "Our web-based terminal features advanced charting, multiple order types, real-time market data, and one-click execution. No downloads required — trade directly from your browser." },
  { q: "How can I contact support?", a: "Our support team is available 24/7 via live chat, email (support@nexustrade.com), and phone. VIP clients have a dedicated personal manager." },
];

interface FAQSectionProps {
  showAll?: boolean;
}

const FAQSection = ({ showAll = false }: FAQSectionProps) => {
  const displayFaqs = showAll ? faqs : faqs.slice(0, 6);

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">FAQ</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-5">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find answers to the most common questions about our platform and services.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2} className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {displayFaqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-xl px-6 data-[state=open]:border-primary/30 data-[state=open]:shadow-lg data-[state=open]:shadow-primary/5 transition-all duration-300"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
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

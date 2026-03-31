import { useState } from "react";
import { AnimatedSection } from "@/components/website/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Clock, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useWT } from "@/hooks/useWebsiteTranslation";

const ContactsPage = () => {
  const [sending, setSending] = useState(false);
  const w = useWT();

  const contactInfo = [
    { icon: Mail, title: w("contactEmail"), value: "support@spitrade.com", href: "mailto:support@spitrade.com" },
    { icon: Clock, title: w("contactHours"), value: w("contactHoursVal") },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast({ title: w("contactSentTitle"), description: w("contactSentDesc") });
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <>
      <section className="pt-32 pb-20 bg-website-dark relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-20" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="container mx-auto px-6 relative z-10">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">{w("contactTag")}</span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mt-4 mb-6">
              {w("contactTitle1")}<span className="gradient-text">{w("contactTitleAccent")}</span>
            </h1>
            <p className="text-lg text-gray-400">{w("contactDesc")}</p>
          </AnimatedSection>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
            <AnimatedSection direction="left">
              <h2 className="text-2xl font-bold text-foreground mb-8">{w("contactInfo")}</h2>
              <div className="space-y-6">
                {contactInfo.map((c) => (
                  <div key={c.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <c.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-0.5">{c.title}</p>
                      {c.href ? (
                        <a href={c.href} className="text-muted-foreground hover:text-primary transition-colors">{c.value}</a>
                      ) : (
                        <p className="text-muted-foreground">{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right">
              <h2 className="text-2xl font-bold text-foreground mb-8">{w("contactFormTitle")}</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{w("contactFirstName")}</Label>
                    <Input required placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label>{w("contactLastName")}</Label>
                    <Input required placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{w("contactEmailLabel")}</Label>
                  <Input required type="email" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>{w("contactSubject")}</Label>
                  <Input required placeholder={w("contactSubjectPlaceholder")} />
                </div>
                <div className="space-y-2">
                  <Label>{w("contactMessage")}</Label>
                  <Textarea required placeholder={w("contactMessagePlaceholder")} rows={5} />
                </div>
                <Button type="submit" size="lg" className="w-full gap-2" disabled={sending}>
                  <Send className="w-4 h-4" />
                  {sending ? w("contactSending") : w("contactSend")}
                </Button>
              </form>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactsPage;

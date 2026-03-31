import { useState } from "react";
import { AnimatedSection } from "@/components/website/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Clock, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const contactInfo = [
  { icon: Mail, title: "Email", value: "support@spitrade.com", href: "mailto:support@spitrade.com" },
  { icon: Clock, title: "Working Hours", value: "24/7 — Support never sleeps" },
  { icon: Clock, title: "Working Hours", value: "24/7 — Support never sleeps" },
];

const ContactsPage = () => {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast({ title: "Message sent", description: "We'll get back to you within 24 hours." });
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
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Contact Us</span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mt-4 mb-6">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-lg text-gray-400">
              Have a question or need assistance? Our team is here to help you 24/7.
            </p>
          </AnimatedSection>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
            {/* Contact info */}
            <AnimatedSection direction="left">
              <h2 className="text-2xl font-bold text-foreground mb-8">Contact Information</h2>
              <div className="space-y-6">
                {contactInfo.map((c) => (
                  <div key={c.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <c.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-0.5">{c.title}</p>
                      {c.href ? (
                        <a href={c.href} className="text-muted-foreground hover:text-primary transition-colors">
                          {c.value}
                        </a>
                      ) : (
                        <p className="text-muted-foreground">{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div className="mt-10 rounded-2xl border border-border bg-muted/50 h-48 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-muted-foreground/30" />
              </div>
            </AnimatedSection>

            {/* Contact form */}
            <AnimatedSection direction="right">
              <h2 className="text-2xl font-bold text-foreground mb-8">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input required placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input required placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input required type="email" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input required placeholder="How can we help?" />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea required placeholder="Tell us more..." rows={5} />
                </div>
                <Button type="submit" size="lg" className="w-full gap-2" disabled={sending}>
                  <Send className="w-4 h-4" />
                  {sending ? "Sending..." : "Send Message"}
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

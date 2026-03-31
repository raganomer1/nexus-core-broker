import { AnimatedSection } from "./AnimatedSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { useWT } from "@/hooks/useWebsiteTranslation";
import type { WebsiteTranslationKey } from "@/i18n/websiteTranslations";

const accountKeys: { nameKey: WebsiteTranslationKey; descKey: WebsiteTranslationKey; deposit: string; depositKey?: WebsiteTranslationKey; spread: string; leverage: string; popular: boolean; featureKeys: WebsiteTranslationKey[] }[] = [
  { nameKey: "accDemo", descKey: "accDemoDesc", deposit: "", depositKey: "accFree", spread: "from 1.5 pips", leverage: "1:100", popular: false, featureKeys: ["accDemoF1", "accDemoF2", "accDemoF3", "accDemoF4", "accDemoF5"] },
  { nameKey: "accStandard", descKey: "accStandardDesc", deposit: "$250", spread: "from 1.0 pips", leverage: "1:200", popular: true, featureKeys: ["accStdF1", "accStdF2", "accStdF3", "accStdF4", "accStdF5"] },
  { nameKey: "accVIP", descKey: "accVIPDesc", deposit: "$10,000", spread: "from 0.3 pips", leverage: "1:500", popular: false, featureKeys: ["accVipF1", "accVipF2", "accVipF3", "accVipF4", "accVipF5"] },
];

const AccountTypesSection = () => {
  const w = useWT();

  return (
    <section className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">{w("accTag")}</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-5">{w("accTitle")}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{w("accDesc")}</p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {accountKeys.map((acc, i) => (
            <AnimatedSection key={acc.nameKey} delay={i * 0.15}>
              <div className={`relative p-8 rounded-2xl border h-full flex flex-col ${
                acc.popular
                  ? "border-primary bg-card shadow-2xl shadow-primary/10 scale-[1.02]"
                  : "border-border bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300"
              }`}>
                {acc.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/30">
                    <Star className="w-3 h-3" /> {w("accPopular")}
                  </div>
                )}

                <h3 className="text-2xl font-bold text-foreground mb-2">{w(acc.nameKey)}</h3>
                <p className="text-sm text-muted-foreground mb-6">{w(acc.descKey)}</p>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{w("accDeposit")}</span>
                    <span className="font-semibold text-foreground">{acc.depositKey ? w(acc.depositKey) : acc.deposit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{w("accSpread")}</span>
                    <span className="font-semibold text-foreground">{acc.spread}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{w("accLeverage")}</span>
                    <span className="font-semibold text-foreground">{acc.leverage}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-1">
                  {acc.featureKeys.map((fk) => (
                    <div key={fk} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      {w(fk)}
                    </div>
                  ))}
                </div>

                <Link to="/register">
                  <Button className="w-full" variant={acc.popular ? "default" : "outline"} size="lg">
                    {w("accOpenBtn")}
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AccountTypesSection;

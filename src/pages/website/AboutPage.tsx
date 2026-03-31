import { AnimatedSection } from "@/components/website/AnimatedSection";
import { AnimatedCounter } from "@/components/website/AnimatedCounter";
import { Target, Eye, Cpu, Globe, Users, Award } from "lucide-react";
import { useWT } from "@/hooks/useWebsiteTranslation";
import type { WebsiteTranslationKey } from "@/i18n/websiteTranslations";

const valueKeys: { icon: typeof Target; titleKey: WebsiteTranslationKey; descKey: WebsiteTranslationKey }[] = [
  { icon: Target, titleKey: "aboutMissionDriven", descKey: "aboutMissionDrivenDesc" },
  { icon: Eye, titleKey: "aboutTransparency", descKey: "aboutTransparencyDesc" },
  { icon: Cpu, titleKey: "aboutTechFirst", descKey: "aboutTechFirstDesc" },
  { icon: Globe, titleKey: "aboutGlobal", descKey: "aboutGlobalDesc" },
  { icon: Users, titleKey: "aboutClient", descKey: "aboutClientDesc" },
  { icon: Award, titleKey: "aboutExcellence", descKey: "aboutExcellenceDesc" },
];

const techKeys: WebsiteTranslationKey[] = ["aboutTech1", "aboutTech2", "aboutTech3", "aboutTech4", "aboutTech5", "aboutTech6"];

const AboutPage = () => {
  const w = useWT();

  return (
    <>
      <section className="pt-32 pb-20 bg-website-dark relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-20" />
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="container mx-auto px-6 relative z-10">
          <AnimatedSection className="max-w-3xl">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">{w("aboutTag")}</span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mt-4 mb-6">
              {w("aboutTitle1")}<span className="gradient-text">{w("aboutTitleAccent")}</span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">{w("aboutDesc")}</p>
          </AnimatedSection>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <AnimatedSection direction="left">
              <h2 className="text-3xl font-bold text-foreground mb-5">{w("aboutMission")}</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">{w("aboutMissionText")}</p>
            </AnimatedSection>
            <AnimatedSection direction="right">
              <h2 className="text-3xl font-bold text-foreground mb-5">{w("aboutVision")}</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">{w("aboutVisionText")}</p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {([
              { value: 50000, suffix: "+", labelKey: "aboutActiveTraders" as WebsiteTranslationKey },
              { value: 150, suffix: "+", labelKey: "aboutCountries" as WebsiteTranslationKey },
              { value: 2014, suffix: "", labelKey: "aboutFounded" as WebsiteTranslationKey, prefix: "" },
              { value: 99.9, suffix: "%", labelKey: "aboutUptime" as WebsiteTranslationKey },
            ]).map((stat, i) => (
              <AnimatedSection key={stat.labelKey} delay={i * 0.1} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                </div>
                <p className="text-sm text-muted-foreground">{w(stat.labelKey)}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-5">{w("aboutValues")}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{w("aboutValuesDesc")}</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {valueKeys.map((v, i) => (
              <AnimatedSection key={v.titleKey} delay={i * 0.1}>
                <div className="group p-7 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <v.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{w(v.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{w(v.descKey)}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-website-dark relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-15" />
        <div className="container mx-auto px-6 relative z-10">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">{w("aboutTechTag")}</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-6">{w("aboutTechTitle")}</h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-10">{w("aboutTechDesc")}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {techKeys.map((tk) => (
                <div key={tk} className="glass-card px-4 py-3 text-sm text-gray-300 font-medium">{w(tk)}</div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
};

export default AboutPage;

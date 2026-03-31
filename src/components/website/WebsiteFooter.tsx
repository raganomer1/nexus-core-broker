import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { useWT } from "@/hooks/useWebsiteTranslation";
import spiLogo from "@/assets/spi-logo.png";

const WebsiteFooter = () => {
  const w = useWT();

  const footerLinks = {
    [w("footCompany")]: [
      { label: w("footAbout"), href: "/about" },
      { label: w("footPlatform"), href: "/platform" },
      { label: w("footContacts"), href: "/contacts" },
      { label: w("wFAQ"), href: "/faq" },
    ],
    [w("footTrading")]: [
      { label: w("footConditions"), href: "/conditions" },
      { label: w("footAccountTypes"), href: "/conditions" },
      { label: w("footInstruments"), href: "/conditions" },
      { label: w("wOpenAccount"), href: "/register" },
    ],
    [w("footLegal")]: [
      { label: w("footPrivacy"), href: "#" },
      { label: w("footTerms"), href: "#" },
      { label: w("footRisk"), href: "#" },
      { label: w("footAML"), href: "#" },
    ],
  };

  return (
    <footer className="bg-website-dark text-white border-t border-white/5">
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src={spiLogo} alt="SPI Trade" className="h-10 w-auto" loading="lazy" width={40} height={40} />
              <span className="text-xl font-bold website-section-title">SPI Trade</span>
            </div>
            <p className="text-white/35 text-sm leading-relaxed mb-8 max-w-sm">
              {w("footDesc")}
            </p>
            <div className="flex flex-col gap-3 text-sm text-white/40">
              <a href="mailto:support@spitrade.com" className="flex items-center gap-2.5 hover:text-primary transition-colors">
                <Mail className="w-4 h-4" /> support@spitrade.com
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-xs uppercase tracking-[0.15em] mb-6 text-white/60">{title}</h4>
              <ul className="flex flex-col gap-3.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-white/35 hover:text-primary transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25">
            © 2014–{new Date().getFullYear()} {w("footRights")}
          </p>
          <p className="text-xs text-white/15 max-w-xl text-center md:text-right leading-relaxed">
            {w("footDisclaimer")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default WebsiteFooter;

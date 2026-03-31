import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { useWT } from "@/hooks/useWebsiteTranslation";

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
    <footer className="bg-website-dark text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="text-xl font-bold">SPI Trade</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              {w("footDesc")}
            </p>
            <div className="flex flex-col gap-3 text-sm text-gray-400">
              <a href="mailto:support@spitrade.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="w-4 h-4" /> support@spitrade.com
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-5 text-gray-300">{title}</h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-gray-400 hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © 2014–{new Date().getFullYear()} {w("footRights")}
          </p>
          <p className="text-xs text-gray-600 max-w-xl text-center md:text-right">
            {w("footDisclaimer")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default WebsiteFooter;

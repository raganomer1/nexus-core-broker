import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Platform", href: "/platform" },
    { label: "Contacts", href: "/contacts" },
    { label: "FAQ", href: "/faq" },
  ],
  Trading: [
    { label: "Trading Conditions", href: "/conditions" },
    { label: "Account Types", href: "/conditions" },
    { label: "Instruments", href: "/conditions" },
    { label: "Open Account", href: "/register" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Risk Disclosure", href: "#" },
    { label: "AML Policy", href: "#" },
  ],
};

const WebsiteFooter = () => (
  <footer className="bg-website-dark text-white">
    <div className="container mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center">
              <span className="text-white font-bold">N</span>
            </div>
            <span className="text-xl font-bold">Nexus</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
            A next-generation trading platform providing access to global financial markets
            with institutional-grade execution and cutting-edge technology.
          </p>
          <div className="flex flex-col gap-3 text-sm text-gray-400">
            <a href="mailto:support@nexustrade.com" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="w-4 h-4" /> support@nexustrade.com
            </a>
            <a href="tel:+442012345678" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="w-4 h-4" /> +44 20 1234 5678
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> London, United Kingdom
            </span>
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-5 text-gray-300">{title}</h4>
            <ul className="flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
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
          © {new Date().getFullYear()} Nexus Trading Ltd. All rights reserved.
        </p>
        <p className="text-xs text-gray-600 max-w-xl text-center md:text-right">
          Trading involves significant risk of loss. Past performance is not indicative of future results.
          Please ensure you fully understand the risks involved.
        </p>
      </div>
    </div>
  </footer>
);

export default WebsiteFooter;

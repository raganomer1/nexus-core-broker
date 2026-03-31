import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Platform", href: "/platform" },
  { label: "Conditions", href: "/conditions" },
  { label: "FAQ", href: "/faq" },
  { label: "Contacts", href: "/contacts" },
];

const WebsiteHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/5"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-18 flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
            <span className="text-white font-bold text-base">S</span>
          </div>
          <span className={`text-xl font-bold tracking-tight transition-colors ${scrolled ? "text-foreground" : "text-white"}`}>
            SPI Trade
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                location.pathname === link.href
                  ? "text-primary font-semibold"
                  : scrolled
                  ? "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1.5 ${scrolled ? "" : "text-white/70 hover:text-white hover:bg-white/10"}`}
          >
            <Globe className="w-4 h-4" />
            EN
          </Button>
          <Link to="/login">
            <Button
              variant={scrolled ? "outline" : "ghost"}
              size="sm"
              className={scrolled ? "" : "text-white border-white/20 hover:bg-white/10"}
            >
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="shadow-lg shadow-primary/25">
              Open Account
            </Button>
          </Link>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className={scrolled ? "" : "text-white hover:bg-white/10"}>
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col gap-2 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    location.pathname === link.href
                      ? "text-primary bg-primary/5"
                      : "text-foreground hover:text-primary hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t pt-4 mt-4 flex flex-col gap-3">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Open Account</Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
};

export default WebsiteHeader;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Shield, Zap, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useWT } from "@/hooks/useWebsiteTranslation";

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const w = useWT();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: w("regCreatedTitle"), description: w("regCreatedDesc") });
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center bg-website-dark relative overflow-hidden p-16">
        <div className="absolute inset-0 hero-grid opacity-20" />
        <motion.div
          className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px]"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-2xl font-bold text-white">SPI Trade</span>
          </Link>

          <h2 className="text-3xl font-bold text-white mb-4">{w("regTitle")}</h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-12">{w("regDesc")}</p>

          <div className="space-y-6">
            {[
              { icon: Zap, textKey: "regFastExec" as const },
              { icon: BarChart3, textKey: "regInstruments" as const },
              { icon: Shield, textKey: "regSecurity" as const },
            ].map((item) => (
              <div key={item.textKey} className="flex items-center gap-3 text-gray-300">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span>{w(item.textKey)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 pt-24 lg:pt-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="text-xl font-bold text-foreground">SPI Trade</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">{w("regCreateTitle")}</h1>
          <p className="text-muted-foreground mb-8">
            {w("regHaveAccount")}{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">{w("wSignIn")}</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{w("regFirstName")}</Label>
                <Input required placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label>{w("regLastName")}</Label>
                <Input required placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{w("regEmail")}</Label>
              <Input required type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label>{w("regPhone")}</Label>
              <Input required type="tel" placeholder="+1 234 567 890" />
            </div>
            <div className="space-y-2">
              <Label>{w("regPassword")}</Label>
              <Input required type="password" placeholder={w("regPasswordPlaceholder")} />
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="terms" required className="mt-1" />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                {w("regAgree")}{" "}
                <a href="#" className="text-primary hover:underline">{w("regTerms")}</a>
                {" "}{w("regAnd")}{" "}
                <a href="#" className="text-primary hover:underline">{w("regPrivacy")}</a>
              </label>
            </div>

            <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
              {loading ? w("regCreating") : w("wOpenAccount")}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-6 text-center">{w("regRisk")}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Shield, Zap, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Account created!", description: "Welcome to SPI Trade." });
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel - branding */}
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
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-2xl font-bold text-white">Nexus</span>
          </Link>

          <h2 className="text-3xl font-bold text-white mb-4">
            Start Your Trading Journey
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-12">
            Join thousands of traders worldwide who trust Nexus for access to global financial markets.
          </p>

          <div className="space-y-6">
            {[
              { icon: Zap, text: "Lightning-fast execution" },
              { icon: BarChart3, text: "1,200+ trading instruments" },
              { icon: Shield, text: "Bank-grade security" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-gray-300">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex items-center justify-center p-8 pt-24 lg:pt-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <span className="text-xl font-bold text-foreground">Nexus</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground mb-8">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>

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
              <Label>Phone</Label>
              <Input required type="tel" placeholder="+1 234 567 890" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input required type="password" placeholder="Min. 8 characters" />
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="terms" required className="mt-1" />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                I agree to the{" "}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </label>
            </div>

            <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
              {loading ? "Creating Account..." : "Open Account"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            Trading involves significant risk. Please ensure you understand the risks involved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;

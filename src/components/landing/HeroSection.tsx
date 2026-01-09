import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroDevices from "@/assets/hero-devices.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(160_84%_39%/0.08),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="section-badge">
              <Sparkles className="w-4 h-4" />
              Gestão financeira inteligente
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
          >
            Organize suas finanças
            <br />
            com <span className="text-gradient">simplicidade</span> e
            <br />
            <span className="text-gradient">clareza</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            BaseFin é o sistema completo para você ter controle total sobre seus
            gastos, cartões de crédito e parcelamentos. Tome decisões financeiras
            com confiança.
          </motion.p>

          {/* Hero Image with floating effect and glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-10 mb-10 flex justify-center"
          >
            <div className="relative animate-float">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-primary/40 via-emerald-glow/30 to-primary/40 rounded-full scale-75" />
              <img
                src={heroDevices}
                alt="BaseFin Dashboard em múltiplos dispositivos"
                className="relative z-10 w-full max-w-3xl h-auto drop-shadow-2xl"
              />
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" asChild className="btn-primary-glow text-lg px-8 py-6">
              <Link to="/auth?mode=signup">
                Começar agora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
              <Link to="/auth">Já tenho conta</Link>
            </Button>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
          >
            <div className="stats-card">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold">Total</div>
              <div className="text-muted-foreground">Controle</div>
            </div>
            <div className="stats-card">
              <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold">100%</div>
              <div className="text-muted-foreground">Segurança</div>
            </div>
            <div className="stats-card">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold">Simples</div>
              <div className="text-muted-foreground">Interface</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

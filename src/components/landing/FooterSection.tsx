import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/logo_basefin.svg";

const FooterSection = () => {
  return (
    <footer className="relative">
      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(160_84%_39%/0.08),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <img src={Logo} alt="BaseFin" className="h-16 w-16 mx-auto mb-8" />
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Pronto para transformar sua{" "}
              <span className="text-gradient">vida financeira</span>?
            </h2>
            
            <p className="mt-6 text-lg text-muted-foreground">
              Junte-se a milhares de pessoas que já estão no controle das suas
              finanças. Comece agora e veja a diferença em poucos dias.
            </p>
            
            <Button size="lg" asChild className="mt-8 btn-primary-glow text-lg px-8 py-6">
              <Link to="/auth?mode=signup">
                Começar agora — 7 Dias de garantia
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            
            <p className="mt-4 text-sm text-muted-foreground">
              Sem compromisso. Cancele quando quiser.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer Links */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-3">
              <img src={Logo} alt="BaseFin" className="h-8 w-8" />
              <span className="text-lg font-bold">BaseFin</span>
            </Link>
            
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/termos" className="hover:text-foreground transition-colors">
                Termos de Uso
              </Link>
              <Link to="/privacidade" className="hover:text-foreground transition-colors">
                Privacidade
              </Link>
              <Link to="/suporte" className="hover:text-foreground transition-colors">
                Suporte
              </Link>
              <Link to="/contato" className="hover:text-foreground transition-colors">
                Contato
              </Link>
            </nav>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>© 2026 BaseFin. Feito com</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;

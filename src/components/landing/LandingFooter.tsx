import { motion } from 'framer-motion';
import { Wallet, Heart } from 'lucide-react';
import BaseFinLogo from '@/assets/baselogo/logo_basefin.png';


export const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="py-12 border-t bg-card"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
<div className="flex items-center gap-3">
  <div className="w-10 h-10 rounded-xl flex items-center justify-center">
  <img
    src={BaseFinLogo}
    alt="BaseFin"
    className="w-10 h-10 object-contain"
  />
</div>

  <span className="text-xl font-bold">BaseFin</span>
</div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacidade
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Suporte
            </a>
            <a href="https://wa.me/5546988058511" className="hover:text-foreground transition-colors">
              Contato
            </a>
          </nav>

          {/* Copyright */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>© {currentYear} BaseFin. Feito com</span>
            <Heart className="w-4 h-4 text-destructive fill-destructive" />
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

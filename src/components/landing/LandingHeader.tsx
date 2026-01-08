import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Wallet, Menu, X } from 'lucide-react';
import BaseFinLogo from '@/assets/baselogo/logo_basefin.png';



export const LandingHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md shadow-sm border-b' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
         {/* Logo */}
<motion.div 
  className="flex items-center gap-3"
  whileHover={{ scale: 1.02 }}
>
  <div className="w-10 h-10 flex items-center justify-center">
  <img
  src={BaseFinLogo}
  alt="BaseFin"
  className="w-14 h-14 object-contain"
/>

  </div>
  <span className="text-xl font-bold">BaseFin</span>
</motion.div>


          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link to="/auth">Entrar na minha conta</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="https://wa.me/5546988058511">Assinar</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4 space-y-2"
          >
            <Button variant="ghost" asChild className="w-full justify-start">
              <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                Entrar na minha conta
              </Link>
            </Button>
            <Button asChild className="w-full bg-primary hover:bg-primary/90">
              <Link to="/auth?mode=signup" onClick={() => setIsMobileMenuOpen(false)}>
                Assinar
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

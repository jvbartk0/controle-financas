import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "@/assets/logo_basefin.svg";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-0 border-b border-border/30"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={Logo} alt="BaseFin" className="h-10 w-10" />
          <span className="text-xl font-bold text-foreground">BaseFin</span>
        </Link>

        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link to="/auth">Entrar na minha conta</Link>
          </Button>
          <Button asChild className="btn-primary-glow">
            <Link to="/auth?mode=signup">Assinar</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

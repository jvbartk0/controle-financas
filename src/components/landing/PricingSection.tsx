import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  "Dashboard completo",
  "Transações ilimitadas",
  "Múltiplos cartões de crédito",
  "Controle de parcelamentos",
  "Contas fixas",
  "Categorias personalizadas",
  "Tags para organização",
  "Relatórios e gráficos",
  "Tema claro e escuro",
  "Exportação de dados",
  "Suporte prioritário",
];

const PricingSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Investimento no seu <span className="text-gradient">futuro financeiro</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Um plano completo com todas as funcionalidades que você precisa
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto"
        >
          <div className="glass-card relative p-8 border-primary/30">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="section-badge">
                <Sparkles className="w-4 h-4" />
                Acesso Completo
              </span>
            </div>

            <div className="text-center pt-4">
              <h3 className="text-2xl font-bold mb-2">Plano Premium</h3>
              
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className="text-lg text-muted-foreground line-through">R$ 197,90</span>
              </div>
              
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold">R$ 19</span>
                <span className="text-xl text-muted-foreground">/mês</span>
              </div>
              
              <p className="text-muted-foreground mt-2">Cancele quando quiser</p>
            </div>

            <div className="mt-8 space-y-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Button size="lg" asChild className="w-full mt-8 btn-primary-glow text-lg py-6">
              <Link to="/auth?mode=signup">Começar agora</Link>
            </Button>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              7 dias de garantia
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;

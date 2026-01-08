import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';

const planFeatures = [
  'Dashboard completo',
  'Transações ilimitadas',
  'Múltiplos cartões de crédito',
  'Controle de parcelamentos',
  'Contas fixas',
  'Categorias personalizadas',
  'Tags para organização',
  'Relatórios e gráficos',
  'Tema claro e escuro',
  'Exportação de dados',
  'Suporte prioritário',
];

export const PricingSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Investimento no seu <span className="text-primary">futuro financeiro</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Um plano completo com todas as funcionalidades que você precisa
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-lg mx-auto"
        >
          <div className="relative rounded-3xl bg-card border-2 border-primary p-8 shadow-xl">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <motion.div 
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4" />
                Acesso Completo
              </motion.div>
            </div>

            <div className="text-center mb-8 pt-4">
              <h3 className="text-2xl font-bold mb-2">Plano Premium</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold">R$ 19</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Cancele quando quiser
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {planFeatures.map((feature, index) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </motion.li>
              ))}
            </ul>

            <Button 
              size="lg" 
              asChild 
              className="w-full bg-primary hover:bg-primary/90 text-lg py-6 rounded-xl"
            >
              <Link to="/auth?mode=signup">
                Começar agora
              </Link>
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              7 dias de garantia
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

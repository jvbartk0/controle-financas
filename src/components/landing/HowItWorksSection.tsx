import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { UserPlus, Settings2, TrendingUp, PartyPopper } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Crie sua conta',
    description: 'Cadastre-se gratuitamente em menos de 1 minuto com seu email.',
  },
  {
    number: '02',
    icon: Settings2,
    title: 'Configure suas finanças',
    description: 'Adicione seus cartões, categorias e contas fixas.',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Registre transações',
    description: 'Cadastre suas receitas e despesas diariamente.',
  },
  {
    number: '04',
    icon: PartyPopper,
    title: 'Acompanhe resultados',
    description: 'Veja relatórios e tome decisões financeiras melhores.',
  },
];

export const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Como <span className="text-primary">funciona</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comece a controlar suas finanças em 4 passos simples
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                <div className="flex items-start gap-4 p-6 rounded-2xl bg-card border hover:shadow-lg transition-shadow">
                  <motion.div 
                    className="flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
                        <step.icon className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-sm font-bold text-primary">
                        {step.number}
                      </span>
                    </div>
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-full left-1/2 w-0.5 h-8 bg-gradient-to-b from-primary/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

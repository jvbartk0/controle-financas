import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  PiggyBank, 
  Target, 
  CreditCard, 
  Shield, 
  BarChart3, 
  Clock 
} from 'lucide-react';

const benefits = [
  {
    icon: PiggyBank,
    title: 'Organização Financeira',
    description: 'Visualize todas as suas receitas e despesas em um só lugar, com categorização automática.',
  },
  {
    icon: Target,
    title: 'Controle de Gastos',
    description: 'Acompanhe para onde seu dinheiro está indo e identifique oportunidades de economia.',
  },
  {
    icon: CreditCard,
    title: 'Gestão de Cartões',
    description: 'Controle as faturas dos seus cartões de crédito e nunca mais perca um vencimento.',
  },
  {
    icon: Clock,
    title: 'Parcelamentos Claros',
    description: 'Visualize todos os parcelamentos em andamento e saiba exatamente quanto falta pagar.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios Detalhados',
    description: 'Gráficos e relatórios que mostram sua evolução financeira ao longo do tempo.',
  },
  {
    icon: Shield,
    title: 'Segurança Total',
    description: 'Seus dados financeiros protegidos com criptografia de ponta a ponta.',
  },
];

export const BenefitsSection = () => {
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
            Por que escolher o <span className="text-primary">BaseFin</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Benefícios que transformam a forma como você gerencia seu dinheiro
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group p-6 rounded-2xl bg-card border transition-all duration-300 hover:shadow-lg hover:border-primary/30"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <benefit.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

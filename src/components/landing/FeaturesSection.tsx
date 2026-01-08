import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Calendar, 
  Tags, 
  Palette, 
  Lock,
  ArrowLeftRight,
  PieChart
} from 'lucide-react';

const features = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard Completo',
    description: 'Visão geral das suas finanças com saldo, receitas e despesas do mês.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Transações',
    description: 'Registre e categorize todas as suas movimentações financeiras.',
  },
  {
    icon: CreditCard,
    title: 'Cartões de Crédito',
    description: 'Gerencie múltiplos cartões com controle de limite e faturas.',
  },
  {
    icon: Calendar,
    title: 'Parcelamentos',
    description: 'Acompanhe todas as compras parceladas e seus vencimentos.',
  },
  {
    icon: Tags,
    title: 'Categorias e Tags',
    description: 'Organize suas transações com categorias personalizadas.',
  },
  {
    icon: PieChart,
    title: 'Relatórios Visuais',
    description: 'Gráficos interativos para análise detalhada dos gastos.',
  },
  {
    icon: Palette,
    title: 'Temas Personalizados',
    description: 'Escolha entre modo claro e escuro para sua preferência.',
  },
  {
    icon: Lock,
    title: 'Contas Fixas',
    description: 'Cadastre suas contas recorrentes e nunca esqueça de pagar.',
  },
];

export const FeaturesSection = () => {
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
            Tudo que você precisa em <span className="text-primary">um só lugar</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Funcionalidades completas para gerenciar suas finanças pessoais
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="group p-5 rounded-xl bg-card border text-center transition-all duration-300 hover:shadow-md hover:border-primary/30"
            >
              <motion.div 
                className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                whileHover={{ rotate: 5 }}
              >
                <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </motion.div>
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

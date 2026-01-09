import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  CreditCard, 
  CalendarDays,
  Tags,
  LineChart,
  Palette,
  Repeat
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard Completo",
    description: "Visão geral das suas finanças com saldo, receitas e despesas do mês.",
  },
  {
    icon: ArrowLeftRight,
    title: "Transações",
    description: "Registre e categorize todas as suas movimentações financeiras.",
  },
  {
    icon: CreditCard,
    title: "Cartões de Crédito",
    description: "Gerencie múltiplos cartões com controle de limite e faturas.",
  },
  {
    icon: CalendarDays,
    title: "Parcelamentos",
    description: "Acompanhe todas as compras parceladas e seus vencimentos.",
  },
  {
    icon: Tags,
    title: "Categorias e Tags",
    description: "Organize suas transações com categorias personalizadas.",
  },
  {
    icon: LineChart,
    title: "Relatórios Visuais",
    description: "Gráficos interativos para análise detalhada dos gastos.",
  },
  {
    icon: Palette,
    title: "Temas Personalizados",
    description: "Escolha entre modo claro e escuro para sua preferência.",
  },
  {
    icon: Repeat,
    title: "Contas Fixas",
    description: "Cadastre suas contas recorrentes e nunca esqueça de pagar.",
  },
];

const FeaturesSection = () => {
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
            Tudo que você precisa em <span className="text-gradient">um só lugar</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Funcionalidades completas para gerenciar suas finanças pessoais
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="feature-card text-center"
            >
              <div className="icon-box mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

import { motion } from "framer-motion";
import { 
  Wallet, 
  PieChart, 
  CreditCard, 
  Calendar, 
  BarChart3, 
  Shield 
} from "lucide-react";

const benefits = [
  {
    icon: Wallet,
    title: "Organização Financeira",
    description: "Visualize todas as suas receitas e despesas em um só lugar, com categorização automática.",
  },
  {
    icon: PieChart,
    title: "Controle de Gastos",
    description: "Acompanhe para onde seu dinheiro está indo e identifique oportunidades de economia.",
  },
  {
    icon: CreditCard,
    title: "Gestão de Cartões",
    description: "Controle as faturas dos seus cartões de crédito e nunca mais perca um vencimento.",
  },
  {
    icon: Calendar,
    title: "Parcelamentos Claros",
    description: "Visualize todos os parcelamentos em andamento e saiba exatamente quanto falta pagar.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Detalhados",
    description: "Gráficos e relatórios que mostram sua evolução financeira ao longo do tempo.",
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Seus dados financeiros protegidos com criptografia de ponta a ponta.",
  },
];

const BenefitsSection = () => {
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
            Por que escolher o <span className="text-gradient">BaseFin</span>?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Benefícios que transformam a forma como você gerencia seu dinheiro
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="feature-card"
            >
              <div className="icon-box mb-4">
                <benefit.icon className="w-6 h-6 text-primary" />
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

export default BenefitsSection;

import { motion } from "framer-motion";
import { UserPlus, Settings, TrendingUp, Target } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Crie sua conta",
    description: "Cadastre-se gratuitamente em menos de 1 minuto com seu email.",
  },
  {
    icon: Settings,
    number: "02",
    title: "Configure suas finanças",
    description: "Adicione seus cartões, categorias e contas fixas.",
  },
  {
    icon: TrendingUp,
    number: "03",
    title: "Registre transações",
    description: "Cadastre suas receitas e despesas diariamente.",
  },
  {
    icon: Target,
    number: "04",
    title: "Acompanhe resultados",
    description: "Veja relatórios e tome decisões financeiras melhores.",
  },
];

const HowItWorksSection = () => {
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
            Como <span className="text-gradient">funciona</span>?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Comece a controlar suas finanças em 4 passos simples
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connection lines */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative ${index % 2 === 1 ? "md:mt-16" : ""}`}
              >
                <div className="glass-card-hover p-6 relative">
                  {/* Step number badge */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {step.number}
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="icon-box shrink-0">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </div>
                
                {/* Connector dot */}
                <div className="hidden md:block absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-4 border-background"
                  style={{ [index % 2 === 0 ? "right" : "left"]: "-1.875rem" }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

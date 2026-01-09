import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useState } from "react";

const testimonials = [
  {
    name: "Roberto Silva",
    role: "Desenvolvedor",
    initials: "RS",
    text: "Interface limpa e objetiva. Uso todos os dias para registrar minhas despesas. Recomendo muito!",
  },
  {
    name: "Juliana Mendes",
    role: "Designer",
    initials: "JM",
    text: "O melhor app de finanças que já usei. Os gráficos me ajudam muito a entender meus gastos.",
  },
  {
    name: "Pedro Santos",
    role: "Contador",
    initials: "PS",
    text: "Profissional e completo. Perfeito para quem quer ter controle real das finanças pessoais.",
  },
  {
    name: "Mariana Costa",
    role: "Professora",
    initials: "MC",
    text: "Simples de usar e muito eficiente. Consegui organizar minhas contas em poucos dias!",
  },
  {
    name: "Lucas Oliveira",
    role: "Estudante",
    initials: "LO",
    text: "Mesmo sendo estudante, consigo controlar meus gastos com facilidade. Excelente ferramenta!",
  },
  {
    name: "Ana Carolina",
    role: "Empreendedora",
    initials: "AC",
    text: "Finalmente consigo ver claramente onde meu dinheiro vai. O controle de cartões é sensacional!",
  },
  {
    name: "Bruno Lima",
    role: "Engenheiro",
    initials: "BL",
    text: "Os relatórios são incríveis. Consigo planejar melhor meus investimentos agora.",
  },
  {
    name: "Patricia Alves",
    role: "Arquiteta",
    initials: "PA",
    text: "Visual lindo e funcionalidades completas. Estou impressionada com a qualidade!",
  },
  {
    name: "Ricardo Gomes",
    role: "Empresário",
    initials: "RG",
    text: "Uso para controlar as finanças pessoais e da empresa. Ferramenta indispensável!",
  },
  {
    name: "Vanessa Dias",
    role: "Nutricionista",
    initials: "VD",
    text: "Consegui quitar minhas dívidas organizando tudo pelo BaseFin. Vida financeira nova!",
  },
];

// Split testimonials into two rows
const topRowTestimonials = testimonials.slice(0, 5);
const bottomRowTestimonials = testimonials.slice(5, 10);

interface TestimonialCardProps {
  testimonial: typeof testimonials[0];
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => (
  <div className="testimonial-card flex-shrink-0 w-[320px] mx-3">
    {/* Stars */}
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
      ))}
    </div>
    
    {/* Quote */}
    <p className="text-sm text-muted-foreground mb-6 italic">
      "{testimonial.text}"
    </p>
    
    {/* Author */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
        {testimonial.initials}
      </div>
      <div>
        <div className="font-semibold text-sm">{testimonial.name}</div>
        <div className="text-xs text-muted-foreground">{testimonial.role}</div>
      </div>
    </div>
  </div>
);

interface MarqueeRowProps {
  testimonials: typeof topRowTestimonials;
  direction: "left" | "right";
}

const MarqueeRow = ({ testimonials, direction }: MarqueeRowProps) => {
  const [isPaused, setIsPaused] = useState(false);
  
  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];
  
  return (
    <div 
      className="relative overflow-hidden py-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Gradient masks for smooth edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <div 
        className={`flex ${direction === "right" ? "animate-marquee-right" : "animate-marquee-left"}`}
        style={{ 
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <TestimonialCard key={`${testimonial.name}-${index}`} testimonial={testimonial} />
        ))}
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            O que nossos <span className="text-gradient">usuários</span> dizem
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Milhares de pessoas já transformaram suas finanças com o BaseFin
          </p>
        </motion.div>
      </div>

      {/* Marquee Rows */}
      <div className="space-y-6">
        <MarqueeRow testimonials={topRowTestimonials} direction="right" />
        <MarqueeRow testimonials={bottomRowTestimonials} direction="left" />
      </div>
    </section>
  );
};

export default TestimonialsSection;

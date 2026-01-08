import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star } from 'lucide-react';

const testimonialsRow1 = [
  { name: 'Ana Carolina', role: 'Empreendedora', avatar: 'AC', rating: 5, comment: 'Finalmente consigo ver claramente para onde meu dinheiro vai. O controle de cartões é sensacional!' },
  { name: 'Roberto Silva', role: 'Desenvolvedor', avatar: 'RS', rating: 5, comment: 'Interface limpa e objetiva. Uso todos os dias para registrar minhas despesas. Recomendo muito!' },
  { name: 'Juliana Mendes', role: 'Designer', avatar: 'JM', rating: 5, comment: 'O melhor app de finanças que já usei. Os gráficos me ajudam muito a entender meus gastos.' },
  { name: 'Pedro Santos', role: 'Contador', avatar: 'PS', rating: 5, comment: 'Profissional e completo. Perfeito para quem quer ter controle real das finanças pessoais.' },
  { name: 'Mariana Costa', role: 'Professora', avatar: 'MC', rating: 5, comment: 'Simples de usar e muito eficiente. Consegui organizar minhas contas em poucos dias!' },
  { name: 'Lucas Oliveira', role: 'Estudante', avatar: 'LO', rating: 5, comment: 'Mesmo sendo estudante, consigo controlar meus gastos com facilidade. Excelente ferramenta!' },
];

const testimonialsRow2 = [
  { name: 'Fernando Reis', role: 'Advogado', avatar: 'FR', rating: 5, comment: 'Organização financeira nunca foi tão fácil. Recomendo para todos os meus colegas!' },
  { name: 'Carla Souza', role: 'Médica', avatar: 'CS', rating: 5, comment: 'Finalmente um app que entende a rotina corrida. Prático e eficiente!' },
  { name: 'Bruno Lima', role: 'Engenheiro', avatar: 'BL', rating: 5, comment: 'Os relatórios são incríveis. Consigo planejar melhor meus investimentos agora.' },
  { name: 'Patrícia Alves', role: 'Arquiteta', avatar: 'PA', rating: 5, comment: 'Visual lindo e funcionalidades completas. Estou impressionada com a qualidade!' },
  { name: 'Ricardo Gomes', role: 'Empresário', avatar: 'RG', rating: 5, comment: 'Uso para controlar as finanças pessoais e da empresa. Ferramenta indispensável!' },
  { name: 'Vanessa Dias', role: 'Nutricionista', avatar: 'VD', rating: 5, comment: 'Consegui quitar minhas dívidas organizando tudo pelo BaseFin. Vida financeira nova!' },
];

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonialsRow1[0] }) => (
  <div className="flex-shrink-0 w-80 p-6 rounded-2xl bg-card border mx-3">
    <div className="flex gap-1 mb-4">
      {[...Array(testimonial.rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-warning text-warning" />
      ))}
    </div>
    <p className="text-muted-foreground mb-4 italic text-sm">"{testimonial.comment}"</p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-sm font-semibold text-primary">{testimonial.avatar}</span>
      </div>
      <div>
        <p className="font-semibold text-sm">{testimonial.name}</p>
        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
      </div>
    </div>
  </div>
);

export const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const duplicatedRow1 = [...testimonialsRow1, ...testimonialsRow1, ...testimonialsRow1];
  const duplicatedRow2 = [...testimonialsRow2, ...testimonialsRow2, ...testimonialsRow2];

  return (
    <section ref={ref} className="py-16 md:py-24 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">
            O que nossos <span className="text-primary">usuários</span> dizem
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Milhares de pessoas já transformaram suas finanças com o BaseFin
          </p>
        </motion.div>
      </div>

     {/* Row 1 - Slides Right */}
<div className="relative mb-6">
  <motion.div
    className="flex"
    animate={{ x: ['0%', '-33.333%'] }}
    transition={{
      x: {
        duration: 30, // ↓ velocidade aumentada
        repeat: Infinity,
        ease: 'linear',
      },
    }}
  >
    {duplicatedRow1.map((testimonial, index) => (
      <TestimonialCard key={`row1-${index}`} testimonial={testimonial} />
    ))}
  </motion.div>
</div>

{/* Row 2 - Slides Left */}
<div className="relative">
  <motion.div
    className="flex"
    animate={{ x: ['-33.333%', '0%'] }}
    transition={{
      x: {
        duration: 30, // ↓ velocidade aumentada
        repeat: Infinity,
        ease: 'linear',
      },
    }}
  >
    {duplicatedRow2.map((testimonial, index) => (
      <TestimonialCard key={`row2-${index}`} testimonial={testimonial} />
    ))}
  </motion.div>
</div>

    </section>
  );
};

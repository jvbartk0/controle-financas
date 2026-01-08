import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const names = [
  'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Paula', 'Carlos Eduardo',
  'Fernanda Lima', 'Lucas Mendes', 'Juliana Costa', 'Rafael Souza', 'Beatriz Alves',
  'Thiago Ferreira', 'Camila Rodrigues', 'Gustavo Martins', 'Larissa Barbosa', 'Bruno Carvalho',
  'Amanda Ribeiro', 'Diego Nascimento', 'Patricia Gomes', 'Rodrigo Pereira', 'Vanessa Araújo',
  'Felipe Cardoso', 'Mariana Dias', 'Leonardo Moreira', 'Isabela Nunes', 'André Castro',
  'Gabriela Rocha', 'Marcelo Pinto', 'Aline Correia', 'Ricardo Lopes', 'Bruna Teixeira',
  'Daniel Melo', 'Natália Freitas', 'Henrique Vieira', 'Carolina Monteiro', 'Eduardo Duarte',
  'Letícia Campos', 'Matheus Reis', 'Priscila Borges', 'Vinicius Azevedo', 'Renata Fonseca'
];

export const SignupNotifications = () => {
  const [currentNotification, setCurrentNotification] = useState<string | null>(null);
  const [usedNames, setUsedNames] = useState<Set<string>>(new Set());

  const getRandomName = useCallback(() => {
    const availableNames = names.filter(name => !usedNames.has(name));

    if (availableNames.length === 0) {
      setUsedNames(new Set());
      return names[Math.floor(Math.random() * names.length)];
    }

    return availableNames[Math.floor(Math.random() * availableNames.length)];
  }, [usedNames]);

  const showNotification = useCallback(() => {
    const name = getRandomName();
    setUsedNames(prev => new Set([...prev, name]));
    setCurrentNotification(name);

    // Fecha a notificação após 4s
    setTimeout(() => {
      setCurrentNotification(null);
    }, 4000);

    // Agenda a próxima notificação com intervalo aleatório (1 a 15 segundos)
    const randomDelay = Math.floor(Math.random() * 15000) + 1000;
    setTimeout(() => {
      showNotification();
    }, randomDelay);
  }, [getRandomName]);

  useEffect(() => {
    // Inicializa a primeira notificação após 5 segundos
    const initialTimeout = setTimeout(() => {
      showNotification();
    }, 5000);

    return () => {
      clearTimeout(initialTimeout);
    };
  }, [showNotification]);

  return (
    <AnimatePresence>
      {currentNotification && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-24 left-6 z-40 bg-card border rounded-xl p-4 shadow-lg max-w-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{currentNotification}</p>
              <p className="text-xs text-muted-foreground">acabou de assinar o BaseFin</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

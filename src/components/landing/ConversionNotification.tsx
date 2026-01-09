import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

const names = [
  "João Silva",
  "Maria Santos",
  "Pedro Oliveira",
  "Ana Carolina",
  "Lucas Ferreira",
  "Juliana Costa",
  "Roberto Almeida",
  "Amanda Ribeiro",
  "Marcelo Pinto",
  "Leonardo Moreira",
  "Fernanda Lima",
  "Carlos Eduardo",
  "Beatriz Souza",
  "Gabriel Santos",
  "Isabela Martins",
];

const ConversionNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentName, setCurrentName] = useState("");

  useEffect(() => {
    const showNotification = () => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      setCurrentName(randomName);
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 4000);
    };

    // Initial delay
    const initialTimeout = setTimeout(() => {
      showNotification();
    }, 5000);

    // Recurring notifications
    const interval = setInterval(() => {
      showNotification();
    }, 15000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 left-6 z-50"
        >
          <div className="notification-popup">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-sm">{currentName}</div>
              <div className="text-xs text-muted-foreground">
                acabou de assinar o BaseFin
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConversionNotification;

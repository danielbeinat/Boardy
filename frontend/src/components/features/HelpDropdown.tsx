import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, BookOpen, MessageCircle, Sparkles } from "lucide-react";

export const HelpDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const helpItems = [
    {
      icon: <BookOpen className="w-4 h-4 text-blue-500" />,
      title: "Guía rápida",
      description: "Aprende lo básico en 2 min",
    },
    {
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      title: "Trucos",
      description: "Atajos y productividad",
    },
    {
      icon: <MessageCircle className="w-4 h-4 text-emerald-500" />,
      title: "Soporte",
      description: "¿Necesitas ayuda?",
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
        title="Ayuda"
      >
        <HelpCircle className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-[90]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl z-[100] border border-gray-100 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-700">Ayuda y Recursos</h3>
              </div>

              <div className="p-2">
                {helpItems.map((item, index) => (
                  <button
                    key={index}
                    className="w-full flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <div className="mt-0.5">{item.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Layout, Info } from "lucide-react";
import { Button } from "../ui";

interface CreateDropdownProps {
  onCreateBoard: () => void;
}

export const CreateDropdown: React.FC<CreateDropdownProps> = ({
  onCreateBoard,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg transition-all"
      >
        <Plus className="w-4 h-4 mr-2" />
        Crear
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100]"
          >
            <div className="p-4">
              <button
                onClick={() => {
                  onCreateBoard();
                  setIsOpen(false);
                }}
                className="w-full text-left group hover:bg-blue-50 p-3 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Layout className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900 group-hover:text-blue-700">
                      Crear tablero
                    </p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Un tablero es un conjunto de tarjetas ordenadas en listas.
                      Úsalo para gestionar proyectos, realizar un seguimiento de
                      la información u organizar cualquier actividad.
                    </p>
                  </div>
                </div>
              </button>

              <div className="mt-3 pt-3 border-t border-gray-100 px-3">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Info className="w-3 h-3" />
                  <span>
                    Puedes crear múltiples tableros para diferentes proyectos
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

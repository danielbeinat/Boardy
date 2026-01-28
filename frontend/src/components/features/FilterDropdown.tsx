import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Check } from "lucide-react";
import { Button } from "../ui";
import type { Label } from "../../types";

interface FilterDropdownProps {
  availableLabels: Label[];
  selectedLabelIds: string[];
  onToggleLabel: (labelId: string) => void;
  onClearFilters: () => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  availableLabels,
  selectedLabelIds,
  onToggleLabel,
  onClearFilters,
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

  const activeFiltersCount = selectedLabelIds.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`text-white hover:bg-white/10 gap-2 relative ${
          activeFiltersCount > 0 ? "bg-white/20" : ""
        }`}
      >
        <Filter className="w-4 h-4" />
        <span className="hidden lg:inline">Filtro</span>
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-blue-600">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100]"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Filtrar tarjetas
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Etiquetas
                  </p>
                  {availableLabels.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-2">
                      No hay etiquetas en este tablero
                    </p>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {availableLabels.map((label) => {
                        const isSelected = selectedLabelIds.includes(label.id);
                        return (
                          <button
                            key={label.id}
                            onClick={() => onToggleLabel(label.id)}
                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: label.color }}
                              />
                              <span className="text-sm text-gray-700">
                                {label.text}
                              </span>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-blue-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {activeFiltersCount > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <button
                      onClick={onClearFilters}
                      className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Quitar todos los filtros
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

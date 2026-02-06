import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Edit2 } from "lucide-react";
import type { Card } from "../../types";
import { Button } from "../ui";
import { cn } from "../../utils";

interface CardComponentProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
  isDragging?: boolean;
}

export const CardComponent: React.FC<CardComponentProps> = ({
  card,
  onEdit,
  onDelete,
  isDragging = false,
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "group bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer",
        isDragging && "opacity-50 rotate-2",
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="p-3">
        {card.labels.length > 0 && (
          <div className="flex gap-1 mb-2">
            {card.labels.map((label) => (
              <span
                key={label.id}
                className="px-2 py-0.5 text-xs rounded-full text-white"
                style={{ backgroundColor: label.color }}
              >
                {label.text}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-800 mb-1">
              {card.title}
            </h4>
            {card.description && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {card.description}
              </p>
            )}
          </div>

          <div
            className={cn(
              "flex items-center gap-1 transition-opacity",
              showActions ? "opacity-100" : "opacity-0",
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(card)}
              className="p-1 h-auto"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(card.id)}
              className="p-1 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {card.dueDate && (
          <div className="mt-2 text-xs text-gray-500">
            📅 {new Date(card.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </motion.div>
  );
};

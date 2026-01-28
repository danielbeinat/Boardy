import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "../../types";
import { cn } from "../../utils";

interface SortableCardProps {
  card: Card;
  onEdit: (card: Card) => void;
}

export const SortableCard: React.FC<SortableCardProps> = ({
  card,
  onEdit,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: "card",
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200",
        isDragging && "opacity-50 rotate-2 border-blue-400",
      )}
      onClick={() => onEdit(card)}
      {...attributes}
      {...listeners}
    >
      <div className="p-3">
        {/* Labels */}
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
        </div>

        {/* Due Date */}
        {card.dueDate && (
          <div className="mt-2 text-xs text-gray-500">
            📅 {new Date(card.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

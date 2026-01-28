import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, MoreHorizontal, Copy, Trash2, Edit2 } from "lucide-react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { List, Card } from "../../types";
import { SortableCard } from "../features";
import { Button, Input } from "../ui";
import { cn } from "../../utils";

interface ListComponentProps {
  list: List;
  onUpdate: (listId: string, title: string) => void;
  onDelete: (listId: string) => void;
  onCopy: (listId: string) => void;
  onCardAdd: (listId: string, title: string, description?: string) => void;
  onCardClick: (card: Card) => void;
  onCardDelete: (listId: string, cardId: string) => void;
  onCardMove: (
    fromListId: string,
    toListId: string,
    cardId: string,
    newIndex: number,
  ) => void;
}

export const ListComponent: React.FC<ListComponentProps> = ({
  list,
  onUpdate,
  onDelete,
  onCopy,
  onCardAdd,
  onCardClick,
  onCardDelete,
  onCardMove,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [showActions, setShowActions] = useState(false);

  const handleUpdateTitle = () => {
    if (editTitle.trim() && editTitle !== list.title) {
      onUpdate(list.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onCardAdd(list.id, newCardTitle.trim(), newCardDescription.trim());
      setNewCardTitle("");
      setNewCardDescription("");
      setIsAddingCard(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex-shrink-0 w-80"
    >
      <div className="bg-gray-100/95 backdrop-blur-sm rounded-xl shadow-lg">
        {/* List Header */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between group">
            <div className="flex flex-col flex-1 min-w-0 mr-2">
              {isEditing ? (
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") handleUpdateTitle();
                    if (e.key === "Escape") {
                      setIsEditing(false);
                      setEditTitle(list.title);
                    }
                  }}
                  className="w-full text-sm font-semibold"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2 overflow-hidden">
                  <h3
                    onClick={() => {
                      setIsEditing(true);
                      setEditTitle(list.title);
                    }}
                    className="truncate text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 px-2 py-1 rounded"
                  >
                    {list.title}
                  </h3>
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-200/50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    {list.cards.length}
                  </span>
                </div>
              )}
            </div>

            <div
              className={cn(
                "flex items-center gap-1 transition-opacity",
                showActions
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100",
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopy(list.id)}
                className="p-1.5 h-auto"
                title="Copiar lista"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(list.id)}
                className="p-1.5 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Eliminar lista"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <Button variant="ghost" size="sm" className="p-1.5 h-auto">
                <MoreHorizontal className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>

        {/* Cards Container */}
        <div className="p-2 space-y-2 max-h-[calc(100vh-360px)] overflow-y-auto">
          <SortableContext
            items={list.cards.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence>
              {list.cards.map((card) => (
                <SortableCard
                  key={card.id}
                  card={card}
                  onEdit={onCardClick}
                  onDelete={(cardId) => onCardDelete(list.id, cardId)}
                  onLabelAdd={() => {}}
                  onLabelRemove={() => {}}
                />
              ))}
            </AnimatePresence>
          </SortableContext>
        </div>

        {/* Add Card Section */}
        <div className="p-2">
          <AnimatePresence>
            {isAddingCard ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Input
                  placeholder="Título de la tarjeta..."
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCard();
                    }
                    if (e.key === "Escape") {
                      setIsAddingCard(false);
                      setNewCardTitle("");
                      setNewCardDescription("");
                    }
                  }}
                  className="w-full text-sm"
                  autoFocus
                />
                <textarea
                  placeholder="Descripción (opcional)..."
                  value={newCardDescription}
                  onChange={(e) => setNewCardDescription(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddCard();
                    }
                    if (e.key === "Escape") {
                      setIsAddingCard(false);
                      setNewCardTitle("");
                      setNewCardDescription("");
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <div className="flex items-center gap-2">
                  <Button onClick={handleAddCard} size="sm" className="flex-1">
                    Añadir tarjeta
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAddingCard(false);
                      setNewCardTitle("");
                      setNewCardDescription("");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAddingCard(true)}
                onMouseEnter={() => setShowActions(true)}
                onMouseLeave={() => setShowActions(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Añade una tarjeta</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

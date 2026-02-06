import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Board as BoardType, Card } from "../../types";
import { ListComponent } from "./List";
import { SortableList } from "../features";
import { Button, Input } from "../ui";

interface BoardProps {
  board: BoardType;
  onListAdd: (title: string) => void;
  onListUpdate: (listId: string, title: string) => void;
  onListDelete: (listId: string) => void;
  onListCopy: (listId: string) => void;
  onCardAdd: (listId: string, title: string, description?: string) => void;
  onCardClick: (card: Card, listId: string) => void;
}

export const Board: React.FC<BoardProps> = ({
  board,
  onListAdd,
  onListUpdate,
  onListDelete,
  onListCopy,
  onCardAdd,
  onCardClick,
}) => {
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const handleAddList = () => {
    if (newListTitle.trim()) {
      onListAdd(newListTitle.trim());
      setNewListTitle("");
      setIsAddingList(false);
    }
  };

  return (
    <div className="inline-flex gap-4 p-6 h-full">
      <SortableContext
        items={board.lists.map((l) => l.id)}
        strategy={horizontalListSortingStrategy}
      >
        <AnimatePresence>
          {board.lists.map((list) => (
            <SortableList key={list.id} list={list}>
              <ListComponent
                list={list}
                onUpdate={onListUpdate}
                onDelete={onListDelete}
                onCopy={onListCopy}
                onCardAdd={onCardAdd}
                onCardClick={(card) => onCardClick(card, list.id)}
              />
            </SortableList>
          ))}
        </AnimatePresence>
      </SortableContext>

      <div className="flex-shrink-0 w-80">
        <AnimatePresence>
          {isAddingList ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-100/95 backdrop-blur-sm rounded-xl shadow-lg p-3"
            >
              <Input
                placeholder="Introduce el título de la lista..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") handleAddList();
                  if (e.key === "Escape") {
                    setIsAddingList(false);
                    setNewListTitle("");
                  }
                }}
                className="w-full text-sm mb-2"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button onClick={handleAddList} size="sm" className="flex-1">
                  Añadir lista
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddingList(false);
                    setNewListTitle("");
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
              onClick={() => setIsAddingList(true)}
              className="w-full flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Añade otra lista</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

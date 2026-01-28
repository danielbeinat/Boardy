import { useState, useCallback } from "react";
import type { List } from "../types";

interface DragItem {
  id: string;
  type: "card" | "list";
  listId?: string;
  index: number;
}

export function useDragAndDrop() {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverListId, setDragOverListId] = useState<string | null>(null);

  const handleDragStart = useCallback((item: DragItem) => {
    setDraggedItem(item);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverListId(null);
  }, []);

  const handleDragOver = useCallback((listId: string) => {
    setDragOverListId(listId);
  }, []);

  const handleDrop = useCallback(
    (targetListId: string, targetIndex: number, lists: List[]) => {
      if (!draggedItem) return lists;

      const newLists = [...lists];
      const sourceList = newLists.find(
        (list) => list.id === draggedItem.listId,
      );
      const targetList = newLists.find((list) => list.id === targetListId);

      if (!sourceList || !targetList) return lists;

      // Remove card from source list
      const [movedCard] = sourceList.cards.splice(draggedItem.index, 1);

      // Add card to target list
      targetList.cards.splice(targetIndex, 0, movedCard);

      // Update card positions
      targetList.cards.forEach((card, index) => {
        card.position = index;
      });

      return newLists;
    },
    [draggedItem],
  );

  return {
    draggedItem,
    dragOverListId,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  };
}

import React from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { Card, List } from "../../types";

interface DragAndDropProviderProps {
  children: React.ReactNode;
  lists: List[];
  onCardMove: (
    fromListId: string,
    toListId: string,
    cardId: string,
    newIndex: number,
  ) => void;
  onListReorder: (fromIndex: number, toIndex: number) => void;
}

export const DragAndDropProvider: React.FC<DragAndDropProviderProps> = ({
  children,
  lists,
  onCardMove,
  onListReorder,
}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [activeData, setActiveData] = React.useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveData(active.data.current);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    // We can add logic here if we want to preview moving cards between lists
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveData(null);
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) {
      setActiveId(null);
      setActiveData(null);
      return;
    }

    if (activeData.type === "card") {
      const activeCard = activeData.card as Card;
      let fromListId = "";

      // Find where the card came from
      lists.forEach((list) => {
        const index = list.cards.findIndex((c: Card) => c.id === activeCard.id);
        if (index !== -1) {
          fromListId = list.id;
        }
      });

      if (overData.type === "card") {
        const overCard = overData.card as Card;
        let toListId = "";
        let toIndex = -1;

        lists.forEach((list) => {
          const index = list.cards.findIndex((c: Card) => c.id === overCard.id);
          if (index !== -1) {
            toListId = list.id;
            toIndex = index;
          }
        });

        if (fromListId && toListId) {
          onCardMove(fromListId, toListId, activeCard.id, toIndex);
        }
      } else if (overData.type === "list") {
        const toList = overData.list as List;
        onCardMove(fromListId, toList.id, activeCard.id, toList.cards.length);
      }
    } else if (activeData.type === "list") {
      const activeList = activeData.list as List;
      const fromIndex = lists.findIndex((l) => l.id === activeList.id);

      if (overData.type === "list") {
        const overList = overData.list as List;
        const toIndex = lists.findIndex((l) => l.id === overList.id);

        if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
          onListReorder(fromIndex, toIndex);
        }
      }
    }

    setActiveId(null);
    setActiveData(null);
  };

  const renderDragOverlay = () => {
    if (!activeId || !activeData) return null;

    if (activeData.type === "card") {
      const card = activeData.card as Card;
      return (
        <div className="bg-white rounded-lg shadow-xl p-3 rotate-2 opacity-90 border-2 border-blue-400 w-72">
          <h4 className="text-sm font-medium text-gray-800">{card.title}</h4>
          {card.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {card.description}
            </p>
          )}
        </div>
      );
    } else if (activeData.type === "list") {
      const list = activeData.list as List;
      return (
        <div className="bg-gray-100/95 backdrop-blur-sm rounded-xl shadow-xl p-4 w-80 rotate-2 opacity-90 border-2 border-blue-400">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">
            {list.title}
          </h3>
          <div className="text-xs text-gray-500">
            {list.cards.length} tarjetas
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>{renderDragOverlay()}</DragOverlay>
    </DndContext>
  );
};

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { List } from '../../types';
import { cn } from '../../utils';

interface SortableListProps {
  list: List;
  children: React.ReactNode;
}

export const SortableList: React.FC<SortableListProps> = ({ list, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: 'list',
      list,
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
        'flex-shrink-0 w-80',
        isDragging && 'opacity-50 rotate-2'
      )}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};

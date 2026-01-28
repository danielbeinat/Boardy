import React, { useState, useEffect } from "react";
import {
  X,
  AlignLeft,
  Tag,
  Calendar as CalendarIcon,
  Trash2,
  Type,
  Clock,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { Button, Input, Modal, ConfirmModal } from "../ui";
import { LabelManager } from "./LabelManager";
import { DatePicker, DueDateDisplay } from "./DatePicker";
import type { Card, Label } from "../../types";
import { cn } from "../../utils";

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card;
  listId: string;
  listName: string;
  onUpdate: (cardId: string, listId: string, updates: Partial<Card>) => void;
  onDelete: (listId: string, cardId: string) => void;
  onLabelAdd: (cardId: string, label: Omit<Label, "id">) => void;
  onLabelRemove: (cardId: string, labelId: string) => void;
}

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  card,
  listId,
  listName,
  onUpdate,
  onDelete,
  onLabelAdd,
  onLabelRemove,
}) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    setTitle(card.title);
    if (!isEditingDescription) {
      setDescription(card.description || "");
    }
  }, [card, isEditingDescription]);

  const handleTitleBlur = () => {
    if (title.trim() && title !== card.title) {
      onUpdate(card.id, listId, { title: title.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionSave = () => {
    if (description !== card.description) {
      onUpdate(card.id, listId, { description: description.trim() });
    }
    setIsEditingDescription(false);
  };

  const handleDateChange = (date: string) => {
    onUpdate(card.id, listId, { dueDate: date });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" className="bg-gray-50">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Type className="w-5 h-5 text-gray-500 mt-1" />
          <div className="flex-1">
            {isEditingTitle ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") handleTitleBlur();
                  if (e.key === "Escape") {
                    setTitle(card.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="text-xl font-bold bg-white"
                autoFocus
              />
            ) : (
              <h2
                onClick={() => setIsEditingTitle(true)}
                className="text-xl font-bold text-gray-800 cursor-pointer hover:bg-gray-200 px-2 py-1 rounded -ml-2 transition-colors"
              >
                {card.title}
              </h2>
            )}
            <p className="text-sm text-gray-500 mt-1">
              en la lista{" "}
              <span className="underline font-medium">{listName}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="md:col-span-3 space-y-6">
            {/* Labels and Dates */}
            <div className="flex flex-wrap gap-4">
              {card.labels.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Etiquetas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {card.labels.map((label) => (
                      <div
                        key={label.id}
                        className="px-3 py-1 rounded-full text-white text-sm"
                        style={{ backgroundColor: label.color }}
                      >
                        {label.text}
                      </div>
                    ))}
                    <button
                      onClick={() => setIsLabelManagerOpen(true)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}

              {card.dueDate && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Fecha de vencimiento
                  </h3>
                  <DueDateDisplay
                    dueDate={card.dueDate}
                    onRemove={() => handleDateChange("")}
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <AlignLeft className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Descripción
                </h3>
              </div>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setIsEditingDescription(true);
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                }}
                placeholder="Añade una descripción más detallada..."
                className="w-full min-h-[150px] p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white transition-all"
              />
              {isEditingDescription && (
                <div className="flex items-center gap-2 mt-2">
                  <Button size="sm" onClick={handleDescriptionSave}>
                    Guardar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDescription(card.description || "");
                      setIsEditingDescription(false);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>

            {/* Activity (Placeholder) */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Actividad
                </h3>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 italic p-4 bg-white rounded-lg border border-dashed border-gray-300">
                Próximamente: Historial de cambios y comentarios.
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Añadir a la tarjeta
              </h3>
              <div className="flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="justify-start"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLabelManagerOpen(true);
                  }}
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Etiquetas
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="justify-start"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDatePickerOpen(true);
                  }}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Fecha
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="justify-start opacity-50 cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Checklist
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Acciones
              </h3>
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsConfirmDeleteOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar tarjeta
                </Button>
              </div>
            </div>
          </div>
        </div>

        <ConfirmModal
          isOpen={isConfirmDeleteOpen}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={() => {
            onDelete(listId, card.id);
            onClose();
          }}
          title="Eliminar tarjeta"
          message="¿Estás seguro de que quieres eliminar esta tarjeta? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          variant="danger"
        />
      </div>

      {/* Sub-modals */}
      <LabelManager
        isOpen={isLabelManagerOpen}
        onClose={() => setIsLabelManagerOpen(false)}
        cardId={card.id}
        labels={card.labels}
        onLabelAdd={onLabelAdd}
        onLabelRemove={onLabelRemove}
      />

      <DatePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        value={card.dueDate}
        onChange={handleDateChange}
      />
    </Modal>
  );
};

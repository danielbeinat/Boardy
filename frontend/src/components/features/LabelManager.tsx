import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button, Input, Modal } from "../ui";
import type { Label } from "../../types";

interface LabelManagerProps {
  cardId: string;
  labels: Label[];
  onLabelAdd: (cardId: string, label: Omit<Label, "id">) => void;
  onLabelRemove: (cardId: string, labelId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#64748b", // gray
];

const PRESET_LABELS = [
  { text: "Urgente", color: "#ef4444" },
  { text: "Importante", color: "#f97316" },
  { text: "Revisión", color: "#eab308" },
  { text: "Progreso", color: "#22c55e" },
  { text: "Backlog", color: "#06b6d4" },
  { text: "Idea", color: "#3b82f6" },
  { text: "Mejora", color: "#8b5cf6" },
  { text: "Bug", color: "#ec4899" },
];

export const LabelManager: React.FC<LabelManagerProps> = ({
  cardId,
  labels,
  onLabelAdd,
  onLabelRemove,
  isOpen,
  onClose,
}) => {
  const [newLabelText, setNewLabelText] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");

  const handleAddLabel = () => {
    if (newLabelText.trim()) {
      onLabelAdd(cardId, {
        text: newLabelText.trim(),
        color: selectedColor,
      });
      setNewLabelText("");
      onClose();
    }
  };

  const handleAddPresetLabel = (preset: (typeof PRESET_LABELS)[0]) => {
    const exists = labels.some(
      (label) => label.text.toLowerCase() === preset.text.toLowerCase(),
    );

    if (!exists) {
      onLabelAdd(cardId, preset);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestionar Etiquetas"
      size="md"
    >
      <div className="space-y-4">
        {/* Current Labels */}
        {labels.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Etiquetas actuales
            </h4>
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => (
                <div
                  key={label.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-sm"
                  style={{ backgroundColor: label.color }}
                >
                  <span>{label.text}</span>
                  <button
                    onClick={() => onLabelRemove(cardId, label.id)}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preset Labels */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Etiquetas predefinidas
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_LABELS.map((preset) => {
              const exists = labels.some(
                (label) =>
                  label.text.toLowerCase() === preset.text.toLowerCase(),
              );

              return (
                <Button
                  key={preset.text}
                  variant={exists ? "secondary" : "primary"}
                  size="sm"
                  onClick={() => handleAddPresetLabel(preset)}
                  disabled={exists}
                  className="justify-start"
                  style={{
                    backgroundColor: exists ? undefined : preset.color,
                    borderColor: preset.color,
                    color: exists ? preset.color : "white",
                  }}
                >
                  {preset.text}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Custom Label */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Nueva etiqueta personalizada
          </h4>
          <div className="space-y-3">
            <Input
              placeholder="Texto de la etiqueta..."
              value={newLabelText}
              onChange={(e) => setNewLabelText(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") handleAddLabel();
              }}
            />

            {/* Color Picker */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Color:</span>
              <div className="flex gap-1">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedColor(color);
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? "border-gray-800 scale-110"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={handleAddLabel}
              disabled={!newLabelText.trim()}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir etiqueta
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

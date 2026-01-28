import React, { useState } from "react";
import { Layout, X } from "lucide-react";
import { Modal, Button, Input } from "../ui";
import { boardService } from "../../services";
import { useBoardStore, useUIStore } from "../../store";

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setBoard } = useBoardStore();
  const { addNotification } = useUIStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await boardService.createBoard(title.trim(), description.trim());
      if (response.success) {
        setBoard(response.data.board);
        addNotification({
          type: "success",
          title: "Tablero creado",
          message: `El tablero "${title}" ha sido creado correctamente.`,
        });
        onClose();
        setTitle("");
        setDescription("");
      } else {
        setError(response.message || "Error al crear el tablero");
      }
    } catch (err) {
      setError("Error de conexión al servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Layout className="w-5 h-5 text-blue-600" />
            Crear tablero
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título del tablero"
            placeholder="Introduce el título del tablero"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Descripción (opcional)
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px]"
              placeholder="Añade una descripción para tu tablero"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isLoading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isLoading ? "Creando..." : "Crear tablero"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

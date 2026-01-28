import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Trash2 } from "lucide-react";
import { boardService } from "../../services";
import { useBoardStore, useUIStore } from "../../store";
import type { Board } from "../../types";
import { ConfirmModal } from "../ui";

export const BoardsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  const { setBoard, board: currentBoard } = useBoardStore();
  const { addNotification } = useUIStore();

  const loadBoards = async () => {
    setIsLoading(true);
    try {
      const response = await boardService.getBoards();
      if (response.success) {
        setBoards(response.data.boards);
      }
    } catch (error) {
      console.error("Error loading boards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadBoards();
    }
  }, [isOpen]);

  const handleSelectBoard = async (boardId: string) => {
    try {
      const response = await boardService.getBoard(boardId);
      if (response.success) {
        setBoard(response.data.board);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error selecting board:", error);
    }
  };

  const confirmDeleteBoard = async () => {
    if (!boardToDelete) return;

    try {
      const response = await boardService.deleteBoard(boardToDelete);
      if (response.success) {
        setBoards(boards.filter((b) => b.id !== boardToDelete));
        addNotification({
          type: "success",
          title: "Tablero eliminado",
          message: "El tablero ha sido eliminado correctamente",
        });

        // If current board was deleted, switch to another one or create new
        if (currentBoard.id === boardToDelete) {
          const otherBoards = boards.filter((b) => b.id !== boardToDelete);
          if (otherBoards.length > 0) {
            handleSelectBoard(otherBoards[0].id);
          } else {
            // Logic to create a default board if none left
            const createResponse = await boardService.createBoard("Mi Tablero");
            if (createResponse.success) {
              setBoard(createResponse.data.board);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error deleting board:", error);
      addNotification({
        type: "error",
        title: "Error",
        message: "No se pudo eliminar el tablero",
      });
    } finally {
      setBoardToDelete(null);
    }
  };

  const handleDeleteBoard = (e: React.MouseEvent, boardId: string) => {
    e.stopPropagation();
    setBoardToDelete(boardId);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
        title="Mis Tableros"
      >
        <LayoutGrid className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-[90]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl z-[100] border border-gray-100 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-blue-600" />
                  Mis Tableros
                </h3>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {isLoading ? (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    Cargando tableros...
                  </div>
                ) : boards.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    No tienes tableros
                  </div>
                ) : (
                  <div className="space-y-1">
                    {boards.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => handleSelectBoard(b.id)}
                        className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                          currentBoard.id === b.id
                            ? "bg-blue-50 border-blue-100"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-700 truncate">
                            {b.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleDeleteBoard(e, b.id)}
                            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                            title="Eliminar tablero"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!boardToDelete}
        onClose={() => setBoardToDelete(null)}
        onConfirm={confirmDeleteBoard}
        title="Eliminar tablero"
        message="¿Estás seguro de que quieres eliminar este tablero? Se perderán todas las listas y tarjetas que contiene."
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
};

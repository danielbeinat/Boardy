import React, { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit2,
  GripVertical,
  X,
  Calendar,
  LayoutGrid,
  Users,
  Zap,
  Bell,
  HelpCircle,
  Share2,
  Star,
  Filter,
  Menu,
  Search,
  ChevronDown,
} from "lucide-react";

interface Card {
  id: string;
  title: string;
  description?: string;
  labels?: { color: string; text: string }[];
  dueDate?: string;
}

interface List {
  id: string;
  title: string;
  cards: Card[];
}

export const TrelloBoard: React.FC = () => {
  const [lists, setLists] = useState<List[]>([
    {
      id: "1",
      title: "Lista de tareas",
      cards: [],
    },
    {
      id: "2",
      title: "En proceso",
      cards: [],
    },
    {
      id: "3",
      title: "Hecho",
      cards: [],
    },
  ]);

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [addingCardToList, setAddingCardToList] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [editingList, setEditingList] = useState<string | null>(null);
  const [editListTitle, setEditListTitle] = useState("");

  // Add new list
  const handleAddList = () => {
    if (newListTitle.trim()) {
      const newList: List = {
        id: Date.now().toString(),
        title: newListTitle,
        cards: [],
      };
      setLists([...lists, newList]);
      setNewListTitle("");
      setIsAddingList(false);
    }
  };

  // Add new card to list
  const handleAddCard = (listId: string) => {
    if (newCardTitle.trim()) {
      const newCard: Card = {
        id: Date.now().toString(),
        title: newCardTitle,
      };
      setLists(
        lists.map((list) =>
          list.id === listId
            ? { ...list, cards: [...list.cards, newCard] }
            : list,
        ),
      );
      setNewCardTitle("");
      setAddingCardToList(null);
    }
  };

  // Delete list
  const handleDeleteList = (listId: string) => {
    setLists(lists.filter((list) => list.id !== listId));
  };

  // Delete card
  const handleDeleteCard = (listId: string, cardId: string) => {
    setLists(
      lists.map((list) =>
        list.id === listId
          ? { ...list, cards: list.cards.filter((card) => card.id !== cardId) }
          : list,
      ),
    );
  };

  // Edit list title
  const handleEditList = (listId: string) => {
    if (editListTitle.trim()) {
      setLists(
        lists.map((list) =>
          list.id === listId ? { ...list, title: editListTitle } : list,
        ),
      );
      setEditingList(null);
      setEditListTitle("");
    }
  };

  // Copy list
  const handleCopyList = (listId: string) => {
    const listToCopy = lists.find((list) => list.id === listId);
    if (listToCopy) {
      const copiedList: List = {
        ...listToCopy,
        id: Date.now().toString(),
        title: `${listToCopy.title} (copia)`,
        cards: listToCopy.cards.map((card) => ({
          ...card,
          id: `${Date.now()}-${Math.random()}`,
        })),
      };
      setLists([...lists, copiedList]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700">
      {/* Top Navigation Bar */}
      <nav className="bg-blue-800/40 backdrop-blur-md border-b border-white/10">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <LayoutGrid className="w-5 h-5 text-white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-white" />
              </motion.button>

              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Buscar"
                  className="pl-10 pr-4 py-2 bg-blue-700/50 text-white placeholder-white/60 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 w-64 transition-all"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Crear</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <HelpCircle className="w-5 h-5 text-white" />
              </motion.button>

              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                DB
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Board Header */}
      <div className="bg-blue-800/30 backdrop-blur-sm border-b border-white/10">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              <h1 className="text-white text-xl font-bold">dev</h1>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Menu className="w-4 h-4 text-white" />
                <ChevronDown className="w-4 h-4 text-white" />
              </motion.button>

              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                DB
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Zap className="w-5 h-5 text-white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Filter className="w-5 h-5 text-white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Star className="w-5 h-5 text-white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Users className="w-5 h-5 text-white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-gray-800 rounded-lg font-semibold transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Compartir</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="overflow-x-auto">
        <div className="inline-flex gap-4 p-6 min-h-[calc(100vh-180px)]">
          <AnimatePresence>
            {lists.map((list) => (
              <motion.div
                key={list.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-shrink-0 w-80"
              >
                <div className="bg-gray-100/95 backdrop-blur-sm rounded-xl shadow-lg">
                  {/* List Header */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center justify-between group">
                      {editingList === list.id ? (
                        <input
                          type="text"
                          value={editListTitle}
                          onChange={(e) => setEditListTitle(e.target.value)}
                          onBlur={() => handleEditList(list.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditList(list.id);
                            if (e.key === "Escape") {
                              setEditingList(null);
                              setEditListTitle("");
                            }
                          }}
                          autoFocus
                          className="flex-1 px-2 py-1 text-sm font-semibold text-gray-800 bg-white border-2 border-blue-500 rounded focus:outline-none"
                        />
                      ) : (
                        <h3
                          onClick={() => {
                            setEditingList(list.id);
                            setEditListTitle(list.title);
                          }}
                          className="flex-1 text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 px-2 py-1 rounded"
                        >
                          {list.title}
                        </h3>
                      )}

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleCopyList(list.id)}
                          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                          title="Copiar lista"
                        >
                          <Copy className="w-4 h-4 text-gray-600" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteList(list.id)}
                          className="p-1.5 hover:bg-red-100 rounded transition-colors"
                          title="Eliminar lista"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-600" />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Cards Container */}
                  <div className="p-2 space-y-2 max-h-[calc(100vh-360px)] overflow-y-auto">
                    <AnimatePresence>
                      {list.cards.map((card) => (
                        <motion.div
                          key={card.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          whileHover={{ scale: 1.02 }}
                          className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm text-gray-800 flex-1">
                                {card.title}
                              </p>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  handleDeleteCard(list.id, card.id)
                                }
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
                              >
                                <X className="w-3 h-3 text-gray-500" />
                              </motion.button>
                            </div>
                            {card.labels && card.labels.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {card.labels.map((label, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 text-xs rounded"
                                    style={{ backgroundColor: label.color }}
                                  >
                                    {label.text}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Add Card Section */}
                  <div className="p-2">
                    {addingCardToList === list.id ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <textarea
                          value={newCardTitle}
                          onChange={(e) => setNewCardTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleAddCard(list.id);
                            }
                            if (e.key === "Escape") {
                              setAddingCardToList(null);
                              setNewCardTitle("");
                            }
                          }}
                          placeholder="Introduce un título para esta tarjeta..."
                          autoFocus
                          className="w-full px-3 py-2 text-sm border-2 border-blue-500 rounded-lg focus:outline-none resize-none"
                          rows={3}
                        />
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAddCard(list.id)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Añadir tarjeta
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setAddingCardToList(null);
                              setNewCardTitle("");
                            }}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5 text-gray-600" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAddingCardToList(list.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors group"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Añade una tarjeta</span>
                        <Copy className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add List Button */}
          <div className="flex-shrink-0 w-80">
            {isAddingList ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-100/95 backdrop-blur-sm rounded-xl shadow-lg p-3"
              >
                <input
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddList();
                    if (e.key === "Escape") {
                      setIsAddingList(false);
                      setNewListTitle("");
                    }
                  }}
                  placeholder="Introduce el título de la lista..."
                  autoFocus
                  className="w-full px-3 py-2 text-sm border-2 border-blue-500 rounded-lg focus:outline-none mb-2"
                />
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddList}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Añadir lista
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsAddingList(false);
                      setNewListTitle("");
                    }}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </motion.button>
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
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 flex items-center gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <LayoutGrid className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
              Bandeja de entrada
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
              Planificador
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl transition-colors"
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">
              Tablero
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
              Cambiar de tablero
            </span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default TrelloBoard;

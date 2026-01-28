import React, { useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Menu,
  Search,
  Plus,
  Bell,
  HelpCircle,
  MoreHorizontal,
  Star,
  Users,
  Zap,
  Filter,
  X,
} from "lucide-react";
import { Board } from "./components/board";
import {
  DragAndDropProvider,
  AuthModal,
  LandingPage,
  CardModal,
  CreateBoardModal,
  CreateDropdown,
  FilterDropdown,
  BoardsDropdown,
  NotificationsDropdown,
  HelpDropdown,
} from "./components/features";
import { useBoardStore, useUIStore } from "./store";
import { Button, NotificationCenter } from "./components/ui";
import { cn } from "./utils";
import { authService, boardService } from "./services";
import type { Card, Label } from "./types";

export const BoardyApp: React.FC = () => {
  const {
    board,
    addList,
    updateList,
    deleteList,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    reorderLists,
    addLabel,
    removeLabel,
    toggleStar,
    setBoard,
  } = useBoardStore();

  const {
    currentUser,
    addNotification,
    logout,
    setCurrentUser,
    clearNotifications,
  } = useUIStore();

  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedLabelIds, setSelectedLabelIds] = React.useState<string[]>([]);
  const [selectedCard, setSelectedCard] = React.useState<{
    card: Card;
    listId: string;
  } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Available labels from all cards in the board
  const availableLabels = React.useMemo(() => {
    const labelsMap = new Map<string, Label>();
    board.lists.forEach((list) => {
      list.cards.forEach((card) => {
        card.labels.forEach((label) => {
          labelsMap.set(label.id, label);
        });
      });
    });
    return Array.from(labelsMap.values());
  }, [board]);

  // Memoized filtered board
  const filteredBoard = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const hasLabelFilter = selectedLabelIds.length > 0;

    if (!query && !hasLabelFilter) return board;

    return {
      ...board,
      lists: board.lists.map((list) => ({
        ...list,
        cards: list.cards.filter((card) => {
          // Search query filter
          const matchesQuery =
            !query ||
            card.title.toLowerCase().includes(query) ||
            card.description?.toLowerCase().includes(query) ||
            card.labels.some((label) =>
              label.text.toLowerCase().includes(query),
            );

          // Label filter
          const matchesLabels =
            !hasLabelFilter ||
            card.labels.some((label) => selectedLabelIds.includes(label.id));

          return matchesQuery && matchesLabels;
        }),
      })),
    };
  }, [board, searchQuery, selectedLabelIds]);

  // Load user boards
  const loadBoards = useCallback(async () => {
    try {
      const response = await boardService.getBoards();
      if (response.success && response.data.boards.length > 0) {
        setBoard(response.data.boards[0]);
      } else if (response.success) {
        const createResponse = await boardService.createBoard("Mi Tablero");
        if (createResponse.success) {
          setBoard(createResponse.data.board);
        }
      }
    } catch (error) {
      console.error("Error loading boards:", error);
    }
  }, [setBoard]);

  // Initialize Auth
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setCurrentUser(response.data);
            await loadBoards();
          } else {
            authService.clearToken();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        authService.clearToken();
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, [setCurrentUser, loadBoards]);

  // Fetch boards when user logs in manually
  useEffect(() => {
    if (currentUser && !isLoading) {
      loadBoards();
    }
  }, [currentUser, isLoading, loadBoards]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      authService.clearToken();
      clearNotifications();
      addNotification({
        type: "info",
        title: "Sesión cerrada",
        message: "Has cerrado sesión exitosamente",
      });
    }
  };

  const handleCardClick = (card: Card, listId: string) => {
    setSelectedCard({ card, listId });
  };

  const handleAddList = async (title: string) => {
    addList(title); // Optimistic update
    try {
      const response = await boardService.addList(board.id, title);
      if (response.success) {
        setBoard(response.data.board);
      }
    } catch (error) {
      console.error("Error adding list:", error);
      addNotification({
        type: "error",
        title: "Error",
        message: "No se pudo sincronizar la lista con el servidor",
      });
    }
  };

  const handleAddCard = async (
    listId: string,
    title: string,
    description?: string,
  ) => {
    addCard(listId, title, description); // Optimistic update
    try {
      const response = await boardService.addCard(
        board.id,
        listId,
        title,
        description,
      );
      if (response.success) {
        setBoard(response.data.board);
      }
    } catch (error) {
      console.error("Error adding card:", error);
      addNotification({
        type: "error",
        title: "Error",
        message: "No se pudo sincronizar la tarjeta con el servidor",
      });
    }
  };

  const handleToggleLabelFilter = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId],
    );
  };

  const handleUpdateCard = async (
    cardId: string,
    listId: string,
    updates: Partial<Card>,
  ) => {
    updateCard(cardId, listId, updates);

    // Also update selectedCard state so the modal re-renders
    setSelectedCard((prev) =>
      prev
        ? {
            ...prev,
            card: {
              ...prev.card,
              ...updates,
            },
          }
        : null,
    );

    try {
      const response = await boardService.updateCard(
        board.id,
        listId,
        cardId,
        updates,
      );
      if (response.success) {
        setBoard(response.data.board);
      }
    } catch (error) {
      console.error("Error updating card:", error);
      addNotification({
        type: "error",
        title: "Error",
        message: "No se pudo sincronizar los cambios con el servidor",
      });
    }
  };

  const handleAddLabel = async (cardId: string, label: Omit<Label, "id">) => {
    const currentCard = board.lists
      .find((l) => l.id === selectedCard?.listId)
      ?.cards.find((c) => c.id === cardId);

    if (!currentCard) return;

    const newLabel = { ...label, id: uuidv4() };
    const updatedLabels = [...currentCard.labels, newLabel];

    // Optimistic update in store
    addLabel(cardId, label);

    // Also update selectedCard state so the modal re-renders
    setSelectedCard((prev) =>
      prev
        ? {
            ...prev,
            card: {
              ...prev.card,
              labels: updatedLabels,
            },
          }
        : null,
    );

    try {
      const response = await boardService.updateCard(
        board.id,
        selectedCard!.listId,
        cardId,
        {
          labels: updatedLabels,
        },
      );
      if (response.success) {
        setBoard(response.data.board);
      }
    } catch (error) {
      console.error("Error adding label:", error);
    }
  };

  const handleRemoveLabel = async (cardId: string, labelId: string) => {
    const currentCard = board.lists
      .find((l) => l.id === selectedCard?.listId)
      ?.cards.find((c) => c.id === cardId);

    if (!currentCard) return;

    const updatedLabels = currentCard.labels.filter((l) => l.id !== labelId);

    // Optimistic update in store
    removeLabel(cardId, labelId);

    // Also update selectedCard state so the modal re-renders
    setSelectedCard((prev) =>
      prev
        ? {
            ...prev,
            card: {
              ...prev.card,
              labels: updatedLabels,
            },
          }
        : null,
    );

    try {
      const response = await boardService.updateCard(
        board.id,
        selectedCard!.listId,
        cardId,
        {
          labels: updatedLabels,
        },
      );
      if (response.success) {
        setBoard(response.data.board);
      }
    } catch (error) {
      console.error("Error removing label:", error);
    }
  };

  const handleDeleteCard = async (listId: string, cardId: string) => {
    deleteCard(listId, cardId);
    try {
      const response = await boardService.deleteCard(board.id, listId, cardId);
      if (response.success) {
        setBoard(response.data.board);
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      addNotification({
        type: "error",
        title: "Error",
        message: "No se pudo eliminar la tarjeta del servidor",
      });
    }
  };

  const openAuthModal = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <LandingPage onOpenAuth={openAuthModal} />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          mode={authMode}
        />
      </>
    );
  }

  return (
    <>
      <NotificationCenter />
      <DragAndDropProvider
        lists={board.lists}
        onCardMove={moveCard}
        onListReorder={reorderLists}
      >
        <div className="flex flex-col h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 overflow-hidden relative">
          {/* Mobile Drawer Overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-black/50 z-[100] md:hidden backdrop-blur-sm"
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 left-0 w-72 bg-blue-900 z-[101] md:hidden shadow-2xl flex flex-col"
                >
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="w-6 h-6 text-white" />
                      <span className="text-xl font-bold text-white">
                        Boardy
                      </span>
                    </div>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                  </div>

                  <div className="p-4 flex flex-col gap-6 overflow-y-auto">
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-inner"
                        style={{
                          backgroundColor:
                            currentUser?.avatarColor || "#10b981",
                        }}
                      >
                        {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-white font-medium truncate">
                          {currentUser?.name}
                        </span>
                        <span className="text-white/60 text-xs truncate">
                          {currentUser?.email}
                        </span>
                      </div>
                    </div>

                    {/* Search in Mobile */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-white/40 uppercase tracking-wider px-2">
                        Búsqueda
                      </span>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                        <input
                          type="text"
                          placeholder="Buscar tarjetas..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          className="w-full pl-10 pr-4 py-2 bg-white/5 text-white placeholder-white/60 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                        />
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-white/40 uppercase tracking-wider px-2">
                        Menú
                      </span>
                      <button
                        onClick={() => {
                          setIsCreateModalOpen(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Nuevo Tablero</span>
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-6 space-y-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <nav className="shrink-0 sticky top-0 z-40 bg-blue-800/40 backdrop-blur-md border-b border-white/10">
            <div className="px-4 sm:px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BoardsDropdown />
                  <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="md:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Menu className="w-6 h-6 text-white" />
                  </button>
                  <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                    <input
                      type="text"
                      placeholder="Buscar tarjetas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="pl-10 pr-4 py-2 bg-blue-700/50 text-white placeholder-white/60 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 w-64 transition-all"
                    />
                    {searchQuery && (
                      <X
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/60 cursor-pointer"
                        onClick={() => setSearchQuery("")}
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2">
                    <CreateDropdown
                      onCreateBoard={() => setIsCreateModalOpen(true)}
                    />
                    <div className="flex items-center gap-1 mx-2">
                      <NotificationsDropdown />
                      <HelpDropdown />
                    </div>
                    <div className="h-8 w-[1px] bg-white/10 mx-2" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-inner"
                      style={{
                        backgroundColor: currentUser?.avatarColor || "#10b981",
                      }}
                    >
                      {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <Button
                      variant="ghost"
                      className="hidden md:flex text-white hover:bg-white/10"
                      onClick={handleLogout}
                    >
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <div className="shrink-0 relative z-20 px-4 sm:px-6 py-3 flex items-center justify-between bg-black/5 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white px-2 py-1 rounded hover:bg-white/10 transition-colors">
                {board.title}
              </h1>
              <Star
                className={cn(
                  "w-4 h-4 cursor-pointer transition-colors",
                  board.isStarred
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-white",
                )}
                onClick={toggleStar}
              />
              <div className="h-4 w-[1px] bg-white/20" />
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 gap-2"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Visible para el equipo</span>
              </Button>
              <div className="h-4 w-[1px] bg-white/20" />
              <div
                className="w-8 h-8 rounded-full border-2 border-blue-600 flex items-center justify-center text-white text-xs font-bold"
                style={{
                  backgroundColor: currentUser?.avatarColor || "#10b981",
                }}
              >
                {currentUser?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FilterDropdown
                availableLabels={availableLabels}
                selectedLabelIds={selectedLabelIds}
                onToggleLabel={handleToggleLabelFilter}
                onClearFilters={() => setSelectedLabelIds([])}
              />
              <MoreHorizontal className="w-5 h-5 text-white cursor-pointer" />
            </div>
          </div>

          <main className="flex-1 overflow-x-auto overflow-y-hidden">
            <Board
              board={filteredBoard}
              onUpdate={() => {}}
              onListAdd={handleAddList}
              onListUpdate={updateList}
              onListDelete={deleteList}
              onListCopy={() => {}}
              onCardAdd={handleAddCard}
              onCardClick={handleCardClick}
              onCardDelete={deleteCard}
              onCardMove={moveCard}
            />
          </main>
        </div>
      </DragAndDropProvider>

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {selectedCard && (
        <CardModal
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          card={selectedCard.card}
          listId={selectedCard.listId}
          listName={
            board.lists.find((l) => l.id === selectedCard.listId)?.title || ""
          }
          onUpdate={handleUpdateCard}
          onDelete={handleDeleteCard}
          onLabelAdd={handleAddLabel}
          onLabelRemove={handleRemoveLabel}
        />
      )}
    </>
  );
};

export default BoardyApp;

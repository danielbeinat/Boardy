import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Board, List, Card, Label } from "../types";
import { v4 as uuidv4 } from "uuid";

interface BoardState {
  board: Board;
  addList: (title: string) => void;
  updateList: (id: string, title: string) => void;
  deleteList: (id: string) => void;
  reorderLists: (fromIndex: number, toIndex: number) => void;

  addCard: (listId: string, title: string, description?: string) => void;
  updateCard: (cardId: string, listId: string, updates: Partial<Card>) => void;
  deleteCard: (listId: string, cardId: string) => void;
  moveCard: (
    fromListId: string,
    toListId: string,
    cardId: string,
    newIndex: number,
  ) => void;
  reorderCards: (listId: string, fromIndex: number, toIndex: number) => void;

  addLabel: (cardId: string, label: Omit<Label, "id">) => void;
  removeLabel: (cardId: string, labelId: string) => void;

  searchCards: (query: string) => Card[];
  getCardsByLabel: (labelId: string) => Card[];
  toggleStar: () => void;
  setBoard: (board: Board) => void;
  resetBoard: () => void;
}

const initialBoard: Board = {
  id: uuidv4(),
  title: "dev",
  lists: [
    {
      id: uuidv4(),
      title: "Lista de tareas",
      cards: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      position: 0,
    },
    {
      id: uuidv4(),
      title: "En proceso",
      cards: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      position: 1,
    },
    {
      id: uuidv4(),
      title: "Hecho",
      cards: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      position: 2,
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      board: initialBoard,

      addList: (title: string) => {
        set((state) => {
          const newList: List = {
            id: uuidv4(),
            title,
            cards: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            position: state.board.lists.length,
          };

          return {
            board: {
              ...state.board,
              lists: [...state.board.lists, newList],
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      updateList: (id: string, title: string) => {
        set((state) => ({
          board: {
            ...state.board,
            lists: state.board.lists.map((list) =>
              list.id === id
                ? { ...list, title, updatedAt: new Date().toISOString() }
                : list,
            ),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      deleteList: (id: string) => {
        set((state) => ({
          board: {
            ...state.board,
            lists: state.board.lists.filter((list) => list.id !== id),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      reorderLists: (fromIndex: number, toIndex: number) => {
        set((state) => {
          const newLists = [...state.board.lists];
          const [movedList] = newLists.splice(fromIndex, 1);
          newLists.splice(toIndex, 0, movedList);

          // Update positions
          newLists.forEach((list, index) => {
            list.position = index;
          });

          return {
            board: {
              ...state.board,
              lists: newLists,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      addCard: (listId: string, title: string, description?: string) => {
        set((state) => {
          const newCard: Card = {
            id: uuidv4(),
            title,
            description,
            labels: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            position: 0,
          };

          return {
            board: {
              ...state.board,
              lists: state.board.lists.map((list) =>
                list.id === listId
                  ? {
                      ...list,
                      cards: [...list.cards, newCard],
                      updatedAt: new Date().toISOString(),
                    }
                  : list,
              ),
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      updateCard: (cardId: string, listId: string, updates: Partial<Card>) => {
        set((state) => ({
          board: {
            ...state.board,
            lists: state.board.lists.map((list) =>
              list.id === listId
                ? {
                    ...list,
                    cards: list.cards.map((card) =>
                      card.id === cardId
                        ? {
                            ...card,
                            ...updates,
                            updatedAt: new Date().toISOString(),
                          }
                        : card,
                    ),
                    updatedAt: new Date().toISOString(),
                  }
                : list,
            ),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      deleteCard: (listId: string, cardId: string) => {
        set((state) => ({
          board: {
            ...state.board,
            lists: state.board.lists.map((list) =>
              list.id === listId
                ? {
                    ...list,
                    cards: list.cards.filter((card) => card.id !== cardId),
                    updatedAt: new Date().toISOString(),
                  }
                : list,
            ),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      moveCard: (
        fromListId: string,
        toListId: string,
        cardId: string,
        newIndex: number,
      ) => {
        set((state) => {
          const newLists = [...state.board.lists];
          const fromList = newLists.find((list) => list.id === fromListId);
          const toList = newLists.find((list) => list.id === toListId);

          if (!fromList || !toList) return state;

          const cardIndex = fromList.cards.findIndex(
            (card) => card.id === cardId,
          );
          if (cardIndex === -1) return state;

          const [movedCard] = fromList.cards.splice(cardIndex, 1);
          toList.cards.splice(newIndex, 0, movedCard);

          // Update positions
          fromList.cards.forEach((card, index) => {
            card.position = index;
          });
          toList.cards.forEach((card, index) => {
            card.position = index;
          });

          return {
            board: {
              ...state.board,
              lists: newLists,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      reorderCards: (listId: string, fromIndex: number, toIndex: number) => {
        set((state) => {
          const newLists = [...state.board.lists];
          const list = newLists.find((l) => l.id === listId);

          if (!list) return state;

          const [movedCard] = list.cards.splice(fromIndex, 1);
          list.cards.splice(toIndex, 0, movedCard);

          // Update positions
          list.cards.forEach((card, index) => {
            card.position = index;
          });

          return {
            board: {
              ...state.board,
              lists: newLists,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      addLabel: (cardId: string, label: Omit<Label, "id">) => {
        set((state) => ({
          board: {
            ...state.board,
            lists: state.board.lists.map((list) => ({
              ...list,
              cards: list.cards.map((card) =>
                card.id === cardId
                  ? {
                      ...card,
                      labels: [...card.labels, { ...label, id: uuidv4() }],
                      updatedAt: new Date().toISOString(),
                    }
                  : card,
              ),
              updatedAt: new Date().toISOString(),
            })),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      removeLabel: (cardId: string, labelId: string) => {
        set((state) => ({
          board: {
            ...state.board,
            lists: state.board.lists.map((list) => ({
              ...list,
              cards: list.cards.map((card) =>
                card.id === cardId
                  ? {
                      ...card,
                      labels: card.labels.filter(
                        (label) => label.id !== labelId,
                      ),
                      updatedAt: new Date().toISOString(),
                    }
                  : card,
              ),
              updatedAt: new Date().toISOString(),
            })),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      searchCards: (query: string) => {
        const { board } = get();
        const lowerQuery = query.toLowerCase();

        return board.lists.flatMap((list) =>
          list.cards.filter(
            (card) =>
              card.title.toLowerCase().includes(lowerQuery) ||
              card.description?.toLowerCase().includes(lowerQuery) ||
              card.labels.some((label) =>
                label.text.toLowerCase().includes(lowerQuery),
              ),
          ),
        );
      },

      getCardsByLabel: (labelId: string) => {
        const { board } = get();

        return board.lists.flatMap((list) =>
          list.cards.filter((card) =>
            card.labels.some((label) => label.id === labelId),
          ),
        );
      },

      toggleStar: () => {
        set((state) => ({
          board: {
            ...state.board,
            isStarred: !state.board.isStarred,
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      setBoard: (board: Board) => {
        set({ board });
      },

      resetBoard: () => {
        set({ board: initialBoard });
      },
    }),
    {
      name: "trello-board-storage",
    },
  ),
);

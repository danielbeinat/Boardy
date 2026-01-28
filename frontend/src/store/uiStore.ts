import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Theme, UIState, Notification, User } from "../types";

interface UIStore extends UIState {
  currentUser: User | null;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;

  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  setCurrentUser: (user: User | null) => void;
  logout: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: "system",
      sidebarOpen: true,
      searchOpen: false,
      notifications: [],
      currentUser: null,

      setTheme: (theme: Theme) => {
        set({ theme });

        // Apply theme to document
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else if (theme === "light") {
          document.documentElement.classList.remove("dark");
        } else {
          // system theme
          const isDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
          ).matches;
          document.documentElement.classList.toggle("dark", isDark);
        }
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      toggleSearch: () => {
        set((state) => ({ searchOpen: !state.searchOpen }));
      },

      setSearchOpen: (open: boolean) => {
        set({ searchOpen: open });
      },

      addNotification: (
        notification: Omit<Notification, "id" | "timestamp" | "read">,
      ) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep only last 50
        }));
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      markNotificationRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification,
          ),
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      setCurrentUser: (user: User | null) => {
        set({ currentUser: user });
      },

      logout: () => {
        set({ currentUser: null });
      },
    }),
    {
      name: "trello-ui-storage",
    },
  ),
);

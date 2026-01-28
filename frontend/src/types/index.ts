export interface Label {
  id: string;
  text: string;
  color: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  labels: Label[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  position: number;
}

export interface List {
  id: string;
  title: string;
  cards: Card[];
  createdAt: string;
  updatedAt: string;
  position: number;
}

export interface Board {
  id: string;
  title: string;
  lists: List[];
  createdAt: string;
  updatedAt: string;
  isStarred?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message?: string;
  timestamp: string;
  read: boolean;
}

export interface SearchFilters {
  query: string;
  labels: string[];
  dueDate?: string;
  assignee?: string;
}

export type Theme = "light" | "dark" | "system";

export interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  searchOpen: boolean;
  notifications: Notification[];
}

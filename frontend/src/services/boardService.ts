import { authService } from "./authService";
import type { Board, List, Card } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class BoardService {
  private getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authService.getToken()}`,
    };
  }

  async getBoards() {
    const response = await fetch(`${API_BASE_URL}/board`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async getBoard(id: string) {
    const response = await fetch(`${API_BASE_URL}/board/${id}`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async createBoard(title: string, description?: string) {
    const response = await fetch(`${API_BASE_URL}/board`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ title, description }),
    });
    return response.json();
  }

  async addList(boardId: string, title: string) {
    const response = await fetch(`${API_BASE_URL}/board/${boardId}/lists`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ title }),
    });
    return response.json();
  }

  async addCard(boardId: string, listId: string, title: string, description?: string) {
    const response = await fetch(`${API_BASE_URL}/board/${boardId}/lists/${listId}/cards`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ title, description }),
    });
    return response.json();
  }

  async updateCard(boardId: string, listId: string, cardId: string, updates: Partial<Card>) {
    const response = await fetch(`${API_BASE_URL}/board/${boardId}/lists/${listId}/cards/${cardId}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    return response.json();
  }

  async deleteCard(boardId: string, listId: string, cardId: string) {
    const response = await fetch(`${API_BASE_URL}/board/${boardId}/lists/${listId}/cards/${cardId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async updateBoard(id: string, updates: Partial<Board>) {
    const response = await fetch(`${API_BASE_URL}/board/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    return response.json();
  }

  async deleteBoard(id: string) {
    const response = await fetch(`${API_BASE_URL}/board/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return response.json();
  }
}

export const boardService = new BoardService();

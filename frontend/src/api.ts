import axios from 'axios';
import type { Task, CreateTaskDTO, UpdateTaskDTO } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/** Get or create a persistent user ID */
function getUserId(): string {
  let userId = localStorage.getItem('eisen-user-id');
  if (!userId) {
    userId = crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('eisen-user-id', userId);
  }
  return userId;
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach user ID header to every request
api.interceptors.request.use((config) => {
  config.headers['x-user-id'] = getUserId();
  return config;
});

export const taskApi = {
  async getAll(): Promise<Task[]> {
    const { data } = await api.get<Task[]>('/tasks');
    return data;
  },

  async getArchived(): Promise<Task[]> {
    const { data } = await api.get<Task[]>('/tasks/archived');
    return data;
  },

  async create(dto: CreateTaskDTO): Promise<Task> {
    const { data } = await api.post<Task>('/tasks', dto);
    return data;
  },

  async update(id: string, dto: UpdateTaskDTO): Promise<Task> {
    const { data } = await api.patch<Task>(`/tasks/${id}`, dto);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async aiSuggest(text: string): Promise<any> {
    const { data } = await api.post('/ai/suggest', { text });
    return data;
  },
};

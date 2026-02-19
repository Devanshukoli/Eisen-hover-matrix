/** Shared Task interfaces for Eisenhower Matrix */

export type Priority = 'urgent' | 'not urgent';
export type Importance = 'important' | 'not important';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  importance: Importance;
  createdAt: string; // ISO 8601
  deadline?: string; // YYYY-MM-DD
  done: boolean;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority: Priority;
  importance: Importance;
  deadline?: string;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  priority?: Priority;
  importance?: Importance;
  deadline?: string;
  done?: boolean;
}

export type QuadrantKey =
  | 'urgent-important'
  | 'not-urgent-important'
  | 'urgent-not-important'
  | 'not-urgent-not-important';

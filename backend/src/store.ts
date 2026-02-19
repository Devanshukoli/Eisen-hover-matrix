import { Task, CreateTaskDTO, UpdateTaskDTO } from './types';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '..', 'data');
const getFilePath = (userId: string) => path.join(DATA_DIR, `${userId}.json`);

/** Simple file-based store keyed by userId */
export class TaskStore {
  private cache: Map<string, Task[]> = new Map();

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(userId: string): Task[] {
    if (this.cache.has(userId)) return this.cache.get(userId)!;
    const fp = getFilePath(userId);
    if (fs.existsSync(fp)) {
      const data = JSON.parse(fs.readFileSync(fp, 'utf-8')) as Task[];
      this.cache.set(userId, data);
      return data;
    }
    return [];
  }

  private save(userId: string, tasks: Task[]): void {
    this.cache.set(userId, tasks);
    fs.writeFileSync(getFilePath(userId), JSON.stringify(tasks, null, 2));
  }

  getAll(userId: string): Task[] {
    return this.load(userId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getArchived(userId: string): Task[] {
    const tasks = this.load(userId);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return tasks
      .filter((t) => {
        const created = new Date(t.createdAt);
        return created < yesterday || t.done;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  create(userId: string, dto: CreateTaskDTO): Task {
    const tasks = this.load(userId);

    // Duplicate check
    const duplicate = tasks.find(
      (t) =>
        t.title.toLowerCase() === dto.title.toLowerCase() &&
        t.priority === dto.priority &&
        t.importance === dto.importance &&
        !t.done
    );
    if (duplicate) {
      throw new Error(`A task with title "${dto.title}" already exists in the same quadrant.`);
    }

    const task: Task = {
      id: uuidv4(),
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      importance: dto.importance,
      createdAt: new Date().toISOString(),
      deadline: dto.deadline,
      done: false,
    };
    tasks.push(task);
    this.save(userId, tasks);
    return task;
  }

  update(userId: string, taskId: string, dto: UpdateTaskDTO): Task {
    const tasks = this.load(userId);
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) throw new Error('Task not found');

    const updated = { ...tasks[idx], ...dto };
    tasks[idx] = updated;
    this.save(userId, tasks);
    return updated;
  }

  delete(userId: string, taskId: string): void {
    let tasks = this.load(userId);
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) throw new Error('Task not found');
    tasks.splice(idx, 1);
    this.save(userId, tasks);
  }
}

export const store = new TaskStore();

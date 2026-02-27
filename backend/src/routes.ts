import { Router, Request, Response } from 'express';
import { store } from './store';
import { CreateTaskDTO, UpdateTaskDTO } from './types';

const router = Router();

/** Extract user ID from header */
function getUserId(req: Request): string {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) throw new Error('Missing x-user-id header');
  return userId;
}

// GET all tasks
router.get('/tasks', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const tasks = await store.getAll(userId);
    res.json(tasks);
  } catch (err: any) {
    console.error('Error fetching tasks:', err);
    res.status(err.message === 'Missing x-user-id header' ? 401 : 400).json({ error: err.message });
  }
});

// GET archived tasks
router.get('/tasks/archived', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const tasks = await store.getArchived(userId);
    res.json(tasks);
  } catch (err: any) {
    console.error('Error fetching archived tasks:', err);
    res.status(err.message === 'Missing x-user-id header' ? 401 : 400).json({ error: err.message });
  }
});

// POST create task
router.post('/tasks', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const dto = req.body as CreateTaskDTO;

    if (!dto.title || !dto.title.trim()) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    if (!dto.priority || !['urgent', 'not urgent'].includes(dto.priority)) {
      res.status(400).json({ error: 'Priority must be "urgent" or "not urgent"' });
      return;
    }
    if (!dto.importance || !['important', 'not important'].includes(dto.importance)) {
      res.status(400).json({ error: 'Importance must be "important" or "not important"' });
      return;
    }

    const task = await store.create(userId, dto);
    res.status(201).json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH update task
router.patch('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const dto = req.body as UpdateTaskDTO;
    const task = await store.update(userId, req.params.id, dto);
    res.json(task);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// DELETE task
router.delete('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    await store.delete(userId, req.params.id);
    res.status(204).send();
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// POST AI suggestion (mock)
router.post('/ai/suggest', (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) {
    res.status(400).json({ error: 'Text input is required' });
    return;
  }

  // Mock AI response - parse natural language into task suggestions
  const lowerText = text.toLowerCase();
  let priority: 'urgent' | 'not urgent' = 'not urgent';
  let importance: 'important' | 'not important' = 'not important';

  if (lowerText.includes('urgent') || lowerText.includes('asap') || lowerText.includes('now') || lowerText.includes('today')) {
    priority = 'urgent';
  }
  if (lowerText.includes('important') || lowerText.includes('critical') || lowerText.includes('must') || lowerText.includes('key')) {
    importance = 'important';
  }

  res.json({
    suggestion: {
      title: text.trim(),
      priority,
      importance,
      confidence: 0.75,
      reasoning: `Based on keyword analysis: priority=${priority}, importance=${importance}`,
    },
  });
});

export default router;

<template>
  <div
    class="task-card"
    :class="{ 'task-done': task.done || completed }"
    @click="$emit('edit', task)"
  >
    <div class="task-card-row">
      <v-btn
        icon
        size="x-small"
        variant="text"
        class="check-btn"
        @click.stop="toggleDone"
      >
        <v-icon
          :icon="task.done ? 'mdi-check-circle' : 'mdi-circle-outline'"
          :color="task.done ? 'success' : undefined"
          size="20"
        />
      </v-btn>
      <div class="task-card-content">
        <span class="task-title" :class="{ 'done-title': task.done }">{{ task.title }}</span>
        <span v-if="task.description" class="task-desc">{{ task.description }}</span>
      </div>
      <v-btn
        icon
        size="x-small"
        variant="text"
        class="drag-handle"
        @mousedown.stop
      >
        <v-icon size="16" style="opacity:0.4">mdi-drag-vertical</v-icon>
      </v-btn>
    </div>
    <div class="task-meta" v-if="task.deadline">
      <v-icon icon="mdi-calendar-outline" size="12" class="mr-1" />
      <span>{{ formatDate(task.deadline) }}</span>
    </div>
    <!-- Accent bar -->
    <div class="accent-bar" :style="{ background: quadrantColor }" />
  </div>
</template>

<script setup lang="ts">
import type { Task } from '../types';
import { useTaskStore } from '../store';

const props = defineProps<{
  task: Task;
  quadrantColor?: string;
  completed?: boolean;
}>();

defineEmits<{
  (e: 'edit', task: Task): void;
}>();

const store = useTaskStore();

function toggleDone() {
  store.toggleDone(props.task.id);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
</script>

<style scoped>
.task-card {
  position: relative;
  padding: 10px 12px 10px 4px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  background: rgba(var(--v-theme-surface), 0.6);
}

.task-card:hover {
  background: rgba(var(--v-theme-surface), 1);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.task-card:active {
  transform: scale(0.98);
}

.task-done {
  opacity: 0.5;
}

.task-card-row {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.check-btn {
  flex-shrink: 0;
  margin-top: -2px;
}

.task-card-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.task-title {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  word-break: break-word;
}

.done-title {
  text-decoration: line-through;
  opacity: 0.6;
}

.task-desc {
  font-size: 11px;
  opacity: 0.5;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.drag-handle {
  flex-shrink: 0;
  cursor: grab;
  opacity: 0;
  transition: opacity 0.2s;
}

.task-card:hover .drag-handle {
  opacity: 1;
}

.task-meta {
  display: flex;
  align-items: center;
  margin-top: 6px;
  margin-left: 32px;
  font-size: 11px;
  opacity: 0.5;
}

.accent-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 0 2px 2px 0;
  opacity: 0.7;
}
</style>

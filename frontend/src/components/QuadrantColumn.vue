<template>
  <div
    class="quadrant-column"
    :style="{ '--quadrant-color': quadrant.color, '--quadrant-color-alpha': quadrant.color + '20' }"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop="handleDrop"
    :class="{ 'drag-over': isDragOver }"
  >
    <div class="quadrant-header">
      <div class="quadrant-header-content">
        <v-icon :icon="quadrant.icon" size="20" :style="{ color: quadrant.color }" />
        <div>
          <h3 class="quadrant-title">{{ quadrant.label }}</h3>
          <span class="quadrant-subtitle">{{ quadrant.subtitle }}</span>
        </div>
      </div>
      <v-chip size="x-small" variant="tonal" :style="{ color: quadrant.color }">
        {{ tasks.length }}
      </v-chip>
    </div>

    <!-- Quick Add -->
    <div class="quick-add" v-if="!quickAdding">
      <v-btn
        variant="text"
        size="small"
        prepend-icon="mdi-plus"
        class="quick-add-btn"
        @click="quickAdding = true"
      >
        Add a task
      </v-btn>
    </div>
    <div v-else class="quick-add-form">
      <v-text-field
        v-model="quickTitle"
        placeholder="Task title..."
        variant="outlined"
        density="compact"
        hide-details
        autofocus
        @keyup.enter="submitQuick"
        @keyup.escape="cancelQuick"
        class="quick-input"
      >
        <template #append-inner>
          <v-btn icon size="x-small" variant="text" @click="submitQuick" :disabled="!quickTitle.trim()">
            <v-icon size="18" color="success">mdi-check</v-icon>
          </v-btn>
          <v-btn icon size="x-small" variant="text" @click="cancelQuick">
            <v-icon size="18">mdi-close</v-icon>
          </v-btn>
        </template>
      </v-text-field>
    </div>

    <!-- Task List -->
    <div class="task-list">
      <TransitionGroup name="task-list">
        <TaskCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          :quadrant-color="quadrant.color"
          @edit="$emit('edit', task)"
          draggable="true"
          @dragstart="handleDragStart($event, task)"
        />
      </TransitionGroup>
      <div v-if="tasks.length === 0 && !quickAdding" class="empty-state">
        <v-icon icon="mdi-tray-alert" size="32" class="mb-2" style="opacity: 0.3" />
        <span class="text-caption" style="opacity: 0.4">No tasks yet</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Task, QuadrantInfo, CreateTaskDTO } from '../types';
import TaskCard from './TaskCard.vue';
import { useTaskStore } from '../store';

const props = defineProps<{
  quadrant: QuadrantInfo;
  tasks: Task[];
}>();

const emit = defineEmits<{
  (e: 'edit', task: Task): void;
  (e: 'quick-add', dto: CreateTaskDTO): void;
}>();

const store = useTaskStore();
const quickAdding = ref(false);
const quickTitle = ref('');
const isDragOver = ref(false);

function submitQuick() {
  const title = quickTitle.value.trim();
  if (!title) return;
  emit('quick-add', {
    title,
    priority: props.quadrant.priority,
    importance: props.quadrant.importance,
  });
  quickTitle.value = '';
  quickAdding.value = false;
}

function cancelQuick() {
  quickAdding.value = false;
  quickTitle.value = '';
}

function handleDragStart(event: DragEvent, task: Task) {
  event.dataTransfer?.setData('application/json', JSON.stringify(task));
  event.dataTransfer!.effectAllowed = 'move';
}

function onDragOver() {
  isDragOver.value = true;
}

function onDragLeave() {
  isDragOver.value = false;
}

function handleDrop(event: DragEvent) {
  isDragOver.value = false;
  const data = event.dataTransfer?.getData('application/json');
  if (!data) return;
  try {
    const task = JSON.parse(data) as Task;
    if (task.priority === props.quadrant.priority && task.importance === props.quadrant.importance) return;
    store.moveTask(task.id, props.quadrant.priority, props.quadrant.importance);
  } catch { /* ignore parse errors */ }
}
</script>

<style scoped>
.quadrant-column {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  overflow: hidden;
  border: 1px solid rgba(128, 128, 128, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.quadrant-column:hover {
  border-color: var(--quadrant-color);
  background: var(--quadrant-color-alpha);
}

.quadrant-column.drag-over {
  border-color: var(--quadrant-color);
  background: var(--quadrant-color-alpha);
  box-shadow: inset 0 0 20px var(--quadrant-color-alpha);
}

.quadrant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.quadrant-header-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quadrant-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}

.quadrant-subtitle {
  font-size: 11px;
  opacity: 0.5;
}

.quick-add-btn {
  text-transform: none !important;
  opacity: 0.6;
  font-size: 13px;
}

.quick-add-btn:hover {
  opacity: 1;
}

.quick-add-form {
  padding: 4px 0;
}

.quick-input {
  font-size: 13px;
}

.task-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 4px;
}

.task-list::-webkit-scrollbar {
  width: 4px;
}

.task-list::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.2);
  border-radius: 2px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
}

/* Transitions */
.task-list-enter-active {
  transition: all 0.3s ease-out;
}

.task-list-leave-active {
  transition: all 0.2s ease-in;
}

.task-list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.task-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.task-list-move {
  transition: transform 0.3s ease;
}
</style>

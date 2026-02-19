<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="520" persistent>
    <v-card class="task-dialog" rounded="xl">
      <v-card-title class="d-flex align-center pa-5 pb-2">
        <v-icon :icon="isEdit ? 'mdi-pencil-outline' : 'mdi-plus-circle-outline'" class="mr-3" color="primary" />
        <span class="text-h6 font-weight-medium">{{ isEdit ? 'Edit Task' : 'Create Task' }}</span>
        <v-spacer />
        <v-btn icon size="small" variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-5 pb-2">
        <v-text-field
          v-model="form.title"
          label="Title"
          variant="outlined"
          density="comfortable"
          :rules="[(v: string) => !!v?.trim() || 'Title is required']"
          autofocus
          class="mb-3"
        />

        <v-textarea
          v-model="form.description"
          label="Description (optional)"
          variant="outlined"
          density="comfortable"
          rows="2"
          auto-grow
          class="mb-3"
        />

        <div class="d-flex gap-3 mb-3">
          <v-select
            v-model="form.priority"
            :items="priorityItems"
            label="Priority"
            variant="outlined"
            density="comfortable"
            class="flex-1"
          />
          <v-select
            v-model="form.importance"
            :items="importanceItems"
            label="Importance"
            variant="outlined"
            density="comfortable"
            class="flex-1"
          />
        </div>

        <v-text-field
          v-model="form.deadline"
          label="Deadline (optional)"
          variant="outlined"
          density="comfortable"
          type="date"
          class="mb-1"
        />

        <!-- Quadrant Preview -->
        <v-chip
          v-if="form.priority && form.importance"
          :color="getQuadrantColor()"
          variant="tonal"
          size="small"
          prepend-icon="mdi-arrow-right"
          class="mt-1"
        >
          {{ getQuadrantLabel() }}
        </v-chip>
      </v-card-text>

      <v-card-actions class="pa-5 pt-2">
        <v-btn
          v-if="isEdit"
          variant="text"
          color="error"
          prepend-icon="mdi-delete-outline"
          @click="$emit('delete', task!.id)"
        >
          Delete
        </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancel</v-btn>
        <v-btn
          variant="flat"
          color="primary"
          rounded="lg"
          :disabled="!form.title?.trim()"
          @click="save"
        >
          {{ isEdit ? 'Update' : 'Create' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { Task, CreateTaskDTO, Priority, Importance } from '../types';
import { QUADRANTS } from '../types';

const props = defineProps<{
  modelValue: boolean;
  task?: Task | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'save', data: CreateTaskDTO & { id?: string }): void;
  (e: 'delete', id: string): void;
  (e: 'close'): void;
}>();

const isEdit = computed(() => !!props.task);

const priorityItems = [
  { title: 'Urgent', value: 'urgent' as Priority },
  { title: 'Not Urgent', value: 'not urgent' as Priority },
];

const importanceItems = [
  { title: 'Important', value: 'important' as Importance },
  { title: 'Not Important', value: 'not important' as Importance },
];

const form = ref({
  title: '',
  description: '',
  priority: 'urgent' as Priority,
  importance: 'important' as Importance,
  deadline: '',
});

watch(
  () => props.modelValue,
  (open) => {
    if (open && props.task) {
      form.value = {
        title: props.task.title,
        description: props.task.description || '',
        priority: props.task.priority,
        importance: props.task.importance,
        deadline: props.task.deadline || '',
      };
    } else if (open) {
      form.value = {
        title: '',
        description: '',
        priority: 'urgent',
        importance: 'important',
        deadline: '',
      };
    }
  }
);

function getQuadrantColor(): string {
  const q = QUADRANTS.find(
    (q) => q.priority === form.value.priority && q.importance === form.value.importance
  );
  return q?.color || '#888';
}

function getQuadrantLabel(): string {
  const q = QUADRANTS.find(
    (q) => q.priority === form.value.priority && q.importance === form.value.importance
  );
  return q ? `${q.label} — ${q.subtitle}` : '';
}

function save() {
  if (!form.value.title?.trim()) return;
  emit('save', {
    ...(props.task?.id ? { id: props.task.id } : {}),
    title: form.value.title.trim(),
    description: form.value.description?.trim() || undefined,
    priority: form.value.priority,
    importance: form.value.importance,
    deadline: form.value.deadline || undefined,
  });
}

function close() {
  emit('close');
  emit('update:modelValue', false);
}
</script>

<style scoped>
.task-dialog {
  border: 1px solid rgba(128, 128, 128, 0.15);
}

.gap-3 {
  gap: 12px;
}

.flex-1 {
  flex: 1;
}
</style>

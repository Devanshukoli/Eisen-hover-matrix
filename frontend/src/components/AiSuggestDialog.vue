<template>
  <!-- FAB Button -->
  <v-btn
    icon
    color="primary"
    size="large"
    class="ai-fab"
    elevation="6"
    @click="dialog = true"
  >
    <v-icon>mdi-auto-fix</v-icon>
    <v-tooltip activator="parent" location="left">AI Suggest</v-tooltip>
  </v-btn>

  <!-- AI Dialog -->
  <v-dialog v-model="dialog" max-width="480">
    <v-card rounded="xl" class="ai-dialog">
      <v-card-title class="d-flex align-center pa-5 pb-3">
        <v-icon icon="mdi-auto-fix" color="primary" class="mr-3" />
        <span class="text-h6 font-weight-medium">AI Task Suggestion</span>
        <v-spacer />
        <v-btn icon size="small" variant="text" @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-5">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Describe your task in natural language and AI will suggest the right quadrant for it.
        </p>
        <v-textarea
          v-model="inputText"
          label="Describe your task..."
          variant="outlined"
          density="comfortable"
          rows="3"
          auto-grow
          autofocus
          @keydown.ctrl.enter="suggest"
          class="mb-2"
        />

        <!-- Suggestion Result -->
        <v-expand-transition>
          <v-card v-if="suggestion" variant="tonal" color="primary" rounded="lg" class="pa-4 mb-2">
            <div class="text-subtitle-2 font-weight-bold mb-2">
              <v-icon icon="mdi-lightbulb-outline" size="16" class="mr-1" />
              Suggestion
            </div>
            <div class="text-body-2 mb-1">
              <strong>Title:</strong> {{ suggestion.title }}
            </div>
            <div class="text-body-2 mb-1">
              <strong>Priority:</strong> {{ suggestion.priority }}
            </div>
            <div class="text-body-2 mb-1">
              <strong>Importance:</strong> {{ suggestion.importance }}
            </div>
            <div class="text-caption text-medium-emphasis mt-2">
              {{ suggestion.reasoning }}
            </div>
            <v-btn
              variant="flat"
              color="primary"
              rounded="lg"
              size="small"
              class="mt-3"
              @click="acceptSuggestion"
            >
              Add Task
            </v-btn>
          </v-card>
        </v-expand-transition>
      </v-card-text>

      <v-card-actions class="pa-5 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
        <v-btn
          variant="flat"
          color="primary"
          rounded="lg"
          :disabled="!inputText.trim()"
          :loading="loading"
          @click="suggest"
        >
          Analyze
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { taskApi } from '../api';
import { useTaskStore } from '../store';

const dialog = ref(false);
const inputText = ref('');
const loading = ref(false);
const suggestion = ref<any>(null);
const store = useTaskStore();

async function suggest() {
  if (!inputText.value.trim()) return;
  loading.value = true;
  suggestion.value = null;
  try {
    const result = await taskApi.aiSuggest(inputText.value);
    suggestion.value = result.suggestion;
  } catch (e) {
    console.error('AI suggestion failed:', e);
  } finally {
    loading.value = false;
  }
}

async function acceptSuggestion() {
  if (!suggestion.value) return;
  await store.createTask({
    title: suggestion.value.title,
    priority: suggestion.value.priority,
    importance: suggestion.value.importance,
  });
  dialog.value = false;
  inputText.value = '';
  suggestion.value = null;
}
</script>

<style scoped>
.ai-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.ai-dialog {
  border: 1px solid rgba(128, 128, 128, 0.15);
}
</style>

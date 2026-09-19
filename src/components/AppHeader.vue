<template>
  <ion-header class="app-header">
    <ion-toolbar>
      <div class="header-content">
        <!-- ! Title section -->
        <div class="header-title">
          <div class="title-row">
            <span class="title-accent"></span>

            <span v-if="eyebrow" class="eyebrow">
              {{ eyebrow }}
            </span>
          </div>

          <h1>{{ title }}</h1>

          <p v-if="subtitle">
            {{ subtitle }}
          </p>
        </div>

        <!-- ! Optional action -->
        <button
          v-if="showAction"
          class="header-action"
          type="button"
          aria-label="Header action"
          @click="handleAction"
        >
          <ion-icon :icon="actionIcon" />
        </button>
      </div>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { IonHeader, IonToolbar, IonIcon } from "@ionic/vue";

import type { Component } from "vue";

withDefaults(
  defineProps<{
    title: string;
    eyebrow?: string;
    subtitle?: string;
    showAction?: boolean;
    actionIcon?: Component;
  }>(),
  {
    eyebrow: "",
    subtitle: "",
    showAction: false,
    actionIcon: undefined,
  },
);

const emit = defineEmits<{
  action: [];
}>();

function handleAction(): void {
  emit("action");
}
</script>

<style scoped>
/* ! Header shell */
.app-header {
  background: var(--app-background);

  box-shadow: none;

  z-index: 10;
}

/* ! Main toolbar */
ion-toolbar {
  --background: var(--ion-color-primary);
  --border-width: 0;

  padding: 14px 18px 16px;

  border-radius: 0 0 30px 30px;

  box-shadow: 0 6px 18px rgba(31, 41, 55, 0.08);
}

/* ! Header content */
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;

  min-height: 58px;
}

/* ! Title container */
.header-title {
  min-width: 0;
}

/* ! Eyebrow row */
.title-row {
  display: flex;
  align-items: center;

  gap: 8px;

  margin-bottom: 5px;
}

/* ! Sage identity marker */
.title-accent {
  width: 6px;
  height: 6px;

  flex-shrink: 0;

  border-radius: 50%;

  background: var(--app-sage);
}

/* ! Eyebrow */
.eyebrow {
  color: rgba(255, 255, 255, 0.62);

  font-size: 10px;
  font-weight: 700;

  letter-spacing: 1.6px;

  line-height: 1;

  text-transform: uppercase;
}

/* ! Main title */
.header-title h1 {
  margin: 0;

  color: #ffffff;

  font-size: 26px;
  font-weight: 800;

  line-height: 1.15;

  letter-spacing: -0.6px;
}

/* ! Subtitle */
.header-title p {
  margin: 5px 0 0;

  color: rgba(255, 255, 255, 0.62);

  font-size: 12px;
  font-weight: 500;

  line-height: 1.4;
}

/* ! Header action */
.header-action {
  width: 42px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  margin-left: 18px;

  border: 1px solid rgba(255, 255, 255, 0.12);

  border-radius: 14px;

  background: rgba(255, 255, 255, 0.08);

  color: #ffffff;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  cursor: pointer;

  transition:
    transform 0.15s ease,
    background 0.15s ease;
}

/* ! Action hover */
.header-action:hover {
  background: rgba(255, 255, 255, 0.13);
}

/* ! Action press */
.header-action:active {
  transform: scale(0.94);
}

/* ! Action icon */
.header-action ion-icon {
  font-size: 19px;
}

/* ! Small screens */
@media (max-width: 400px) {
  ion-toolbar {
    padding-left: 16px;
    padding-right: 16px;
  }

  .header-title h1 {
    font-size: 24px;
  }

  .header-action {
    width: 40px;
    height: 40px;

    margin-left: 14px;
  }
}
</style>

<template>
  <ion-tab-bar slot="bottom">
    <ion-tab-button tab="home" href="/home">
      <ion-icon :icon="homeOutline" />

      <ion-label>Home</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="debts" href="/debts">
      <ion-icon :icon="walletOutline" />

      <ion-label>Debts</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="add" @click="handleAdd">
      <div class="add-button">
        <ion-icon :icon="add" />
      </div>

      <ion-label>Add</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="more" href="/more">
      <ion-icon :icon="settingsOutline" />

      <ion-label>More</ion-label>
    </ion-tab-button>
  </ion-tab-bar>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonIcon, IonLabel } from "@ionic/vue";

import {
  homeOutline,
  walletOutline,
  add,
  settingsOutline,
} from "ionicons/icons";

const emit = defineEmits<{
  add: [];
}>();

function handleAdd() {
  emit("add");
}
</script>

<style scoped>
ion-tab-bar {
  height: 68px;
  --background: #ffffff;
  border-top: 1px solid #eeeeee;
}

ion-tab-button {
  --color: #999;
  --color-selected: #171717;
}

ion-icon {
  font-size: 21px;
}

ion-label {
  font-size: 11px;
  margin-top: 3px;
}

.add-button {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: #171717;
  color: white;
}

.add-button ion-icon {
  font-size: 23px;
}
</style>

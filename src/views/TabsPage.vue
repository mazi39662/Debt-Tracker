<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />

      <!-- ! Main bottom navigation -->
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :icon="homeOutline" />
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="debts" href="/tabs/debts">
          <ion-icon :icon="walletOutline" />
          <ion-label>Debts</ion-label>
        </ion-tab-button>

        <!-- ! Center Add action -->
        <ion-tab-button tab="add" @click="openAddDebt">
          <div class="add-button">
            <ion-icon :icon="add" />
          </div>

          <ion-label>Add</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="calendar" href="/tabs/calendar">
          <ion-icon :icon="calendarClearOutline" />
          <ion-label>Calendar</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="more" href="/tabs/more">
          <ion-icon :icon="settingsOutline" />
          <ion-label>More</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>

    <!-- ! Add Debt modal -->
    <AddDebtModal :is-open="showAddDebt" @close="closeAddDebt" />
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";

import {
  IonPage,
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from "@ionic/vue";

import {
  homeOutline,
  walletOutline,
  add,
  settingsOutline,
  calendarClearOutline,
} from "ionicons/icons";

import AddDebtModal from "@/components/debt/AddDebtModal.vue";

const showAddDebt = ref(false);

// ! Open the Add Debt modal.
function openAddDebt(): void {
  showAddDebt.value = true;
}

// ! Close the Add Debt modal.
function closeAddDebt(): void {
  showAddDebt.value = false;
}
</script>

<style scoped>
ion-tab-bar {
  height: 68px;

  --background: #ffffff;
  --border: 1px solid #eeeeee;
}

ion-tab-button {
  --color: #999999;
  --color-selected: #171717;
}

ion-tab-button ion-icon {
  font-size: 21px;
}

ion-tab-button ion-label {
  font-size: 11px;
  margin-top: 3px;
}

/* ! Center Add button */
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

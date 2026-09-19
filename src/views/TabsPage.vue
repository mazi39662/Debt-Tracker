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
/* ! Floating bottom navigation */
ion-tab-bar {
  height: 74px;

  --background: var(--ion-color-primary);
  --border: none;

  margin: 0 10px 10px;

  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;

  overflow: hidden;

  box-shadow: 0 8px 24px rgba(31, 41, 55, 0.16);
}

/* ! Navigation buttons */
ion-tab-button {
  --color: rgba(255, 255, 255, 0.55);
  --color-selected: var(--ion-color-secondary);

  --background: transparent;
  --background-focused: transparent;
  --background-activated: rgba(255, 255, 255, 0.05);

  position: relative;

  font-weight: 600;
}

/* ! Navigation icons */
ion-tab-button ion-icon {
  font-size: 21px;

  transition:
    transform 0.2s ease,
    color 0.2s ease;
}

/* ! Navigation labels */
ion-tab-button ion-label {
  margin-top: 3px;

  font-size: 10px;
  font-weight: 600;

  letter-spacing: 0.1px;
}

/* ! Selected tab */
ion-tab-button.tab-selected ion-icon {
  transform: translateY(-1px);
}

/* ! Small active indicator */
ion-tab-button.tab-selected::after {
  content: "";

  position: absolute;

  bottom: 5px;
  left: 50%;

  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: var(--ion-color-secondary);

  transform: translateX(-50%);
}

/* ! Center Add button */
.add-button {
  width: 46px;
  height: 46px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 2px;

  border-radius: 16px;

  background: var(--ion-color-secondary);

  color: var(--ion-color-secondary-contrast);

  box-shadow: 0 5px 14px rgba(77, 124, 15, 0.28);

  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

/* ! Add icon */
.add-button ion-icon {
  font-size: 24px;
}

/* ! Add button press feedback */
ion-tab-button:active .add-button {
  transform: scale(0.92);

  box-shadow: 0 3px 8px rgba(77, 124, 15, 0.2);
}

/* ! Keep Add label visible */
ion-tab-button:nth-child(3) ion-label {
  color: rgba(255, 255, 255, 0.65);
}

/* ! Small screens */
@media (max-width: 400px) {
  ion-tab-bar {
    margin: 0 7px 7px;

    border-radius: 21px;
  }

  .add-button {
    width: 44px;
    height: 44px;
  }
}
</style>

<template>
  <ion-page>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content
          pulling-text="Pull to refresh"
          refreshing-text="Refreshing..."
        />
      </ion-refresher>

      <div class="page-container">
        <!-- ! Page header -->
        <div class="page-header">
          <span class="eyebrow">APP SETTINGS</span>
          <h1>More</h1>
          <p>Manage your Debt Tracker preferences.</p>
        </div>

        <!-- ! Appearance -->
        <section class="settings-section">
          <div class="section-label">APPEARANCE</div>

          <div class="settings-card">
            <div class="setting-icon appearance-icon">
              <ion-icon :icon="colorPaletteOutline" />
            </div>

            <div class="setting-content">
              <strong>Theme</strong>
              <span>
                {{ isDarkMode ? "Dark mode" : "Light mode" }}
              </span>
            </div>

            <ion-toggle :checked="isDarkMode" @ionChange="toggleTheme" />
          </div>
        </section>

        <!-- ! Data -->
        <section class="settings-section">
          <div class="section-label">DATA</div>

          <div class="settings-card danger-card">
            <div class="setting-icon danger-icon">
              <ion-icon :icon="trashOutline" />
            </div>

            <div class="setting-content">
              <strong>Clear All Data</strong>
              <span> Permanently delete all debts and payment history. </span>
            </div>

            <ion-button
              fill="clear"
              color="danger"
              class="clear-button"
              @click="confirmClearData"
            >
              Clear
            </ion-button>
          </div>

          <div class="warning-box">
            <ion-icon :icon="warningOutline" />

            <div>
              <strong>This action cannot be undone.</strong>
              <p>
                Clearing your data will permanently remove all debts, payments,
                and locally stored records.
              </p>
            </div>
          </div>
        </section>

        <!-- ! About -->
        <section class="settings-section">
          <div class="section-label">ABOUT</div>

          <div class="about-card">
            <div class="app-logo">
              <ion-icon :icon="walletOutline" />
            </div>

            <div class="about-content">
              <h2>Debt Tracker</h2>
              <p class="version">MVP · v1.0.0</p>

              <p class="description">
                A simple offline-first app for tracking debts, payments, and due
                dates.
              </p>

              <div class="author-divider" />

              <div class="author-row">
                <div>
                  <span>Created by</span>
                  <strong>Cypher Studio</strong>
                </div>

                <span class="author-badge"> Developer </span>
              </div>
            </div>
          </div>
        </section>

        <!-- ! Footer -->
        <div class="footer">
          <span>Debt Tracker by W4K1</span>
        </div>
      </div>
    </ion-content>

    <!-- ! Clear data confirmation -->
    <ion-alert
      :is-open="showClearAlert"
      header="Clear All Data?"
      message="This will permanently delete all debts and payment history from this device. This action cannot be undone."
      :buttons="clearAlertButtons"
      @didDismiss="showClearAlert = false"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

import {
  IonPage,
  IonContent,
  IonIcon,
  IonToggle,
  IonButton,
  IonAlert,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/vue";

import {
  colorPaletteOutline,
  trashOutline,
  warningOutline,
  walletOutline,
} from "ionicons/icons";

import { useDebtStore } from "@/stores/debt.store";

// ! Access debt store.
const debtStore = useDebtStore();

// ! Theme state.
const isDarkMode = ref(document.documentElement.classList.contains("dark"));

// ! Clear-data confirmation state.
const showClearAlert = ref(false);

onMounted(() => {
  debtStore.loadDebts();
  isDarkMode.value = document.documentElement.classList.contains("dark");
});

/**
 * ! Refresh the page data from storage.
 */
async function handleRefresh(event: CustomEvent): Promise<void> {
  const refresher = event.target as HTMLIonRefresherElement;

  await new Promise((resolve) => setTimeout(resolve, 300));

  refresher.complete();
  window.location.reload();
}

// ! Toggle light/dark theme.
function toggleTheme(event: CustomEvent): void {
  const enabled = event.detail.checked;

  isDarkMode.value = enabled;

  document.documentElement.classList.toggle("dark", enabled);

  localStorage.setItem("debt_tracker_theme", enabled ? "dark" : "light");
}

// ! Open clear-data confirmation.
function confirmClearData(): void {
  showClearAlert.value = true;
}

// ! Permanently remove all local debt data.
function clearAllData(): void {
  debtStore.$reset();

  localStorage.removeItem("debt_tracker_debts");

  showClearAlert.value = false;
}

// ! Confirmation buttons for destructive action.
const clearAlertButtons = [
  {
    text: "Cancel",
    role: "cancel",
  },
  {
    text: "Delete Everything",
    role: "destructive",
    handler: () => {
      clearAllData();
    },
  },
];
</script>

<style scoped>
ion-content {
  --background: var(--app-background);
}

/* ! Page */
.page-container {
  padding: 24px 16px 100px;
}

/* ! Header */
.page-header {
  margin-bottom: 26px;
}

.eyebrow,
.section-label {
  color: var(--app-sage-dark);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.page-header h1 {
  margin: 3px 0 4px;
  color: var(--app-sage-dark);
  font-size: 25px;
  font-weight: 850;
}

.page-header p {
  margin: 0;
  color: var(--app-text-muted);
  font-size: 12px;
}

/* ! Sections */
.settings-section {
  margin-bottom: 25px;
}

.section-label {
  margin: 0 4px 9px;
}

/* ! Generic setting card */
.settings-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 68px;
  padding: 13px 14px;
  border: 1px solid var(--app-border);
  border-radius: 17px;
  background: var(--app-surface);
  box-shadow: 0 3px 12px rgba(31, 41, 55, 0.03);
}

.setting-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 12px;
}

.setting-icon ion-icon {
  font-size: 19px;
}

.appearance-icon {
  background: var(--app-sage-light);
  color: var(--app-sage-dark);
}

.danger-icon {
  background: #fef2f2;
  color: var(--ion-color-danger);
}

.setting-content {
  flex: 1;
  min-width: 0;
}

.setting-content strong {
  display: block;
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
}

.setting-content span {
  display: block;
  margin-top: 3px;
  color: var(--app-text-muted);
  font-size: 10px;
  line-height: 1.4;
}

/* ! Theme toggle */
ion-toggle {
  --track-background: #d1d5db;
  --track-background-checked: var(--app-sage);
  --handle-background: #ffffff;
  --handle-background-checked: #ffffff;
}

/* ! Clear button */
.clear-button {
  margin: 0;
  height: 34px;
  min-width: 54px;
  --border-radius: 9px;
  font-size: 10px;
  font-weight: 800;
}

/* ! Danger card */
.danger-card {
  border-color: #fecaca;
}

/* ! Warning */
.warning-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 9px;
  padding: 12px 13px;
  border: 1px solid #fde68a;
  border-radius: 13px;
  background: #fffbeb;
}

.warning-box > ion-icon {
  flex-shrink: 0;
  margin-top: 1px;
  color: #d97706;
  font-size: 17px;
}

.warning-box strong {
  display: block;
  color: #92400e;
  font-size: 10px;
  font-weight: 800;
}

.warning-box p {
  margin: 3px 0 0;
  color: #a16207;
  font-size: 9px;
  line-height: 1.45;
}

/* ! About */
.about-card {
  display: flex;
  gap: 14px;
  padding: 17px;
  border: 1px solid var(--app-border);
  border-radius: 18px;
  background: var(--app-surface);
  box-shadow: 0 3px 12px rgba(31, 41, 55, 0.03);
}

.app-logo {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--app-sage-dark), var(--app-sage));
  color: #ffffff;
  box-shadow: 0 5px 12px rgba(63, 98, 18, 0.18);
}

.app-logo ion-icon {
  font-size: 22px;
}

.about-content {
  flex: 1;
  min-width: 0;
}

.about-content h2 {
  margin: 0;
  color: var(--app-text);
  font-size: 16px;
  font-weight: 850;
}

.version {
  margin: 2px 0 0;
  color: var(--app-sage-dark);
  font-size: 9px;
  font-weight: 700;
}

.description {
  margin: 10px 0 0;
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.5;
}

/* ! Author */
.author-divider {
  height: 1px;
  margin: 13px 0;
  background: var(--app-border);
}

.author-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.author-row span:first-child {
  display: block;
  color: var(--app-text-muted);
  font-size: 9px;
}

.author-row strong {
  display: block;
  margin-top: 2px;
  color: var(--app-text);
  font-size: 11px;
}

.author-badge {
  padding: 5px 8px;
  border-radius: 7px;
  background: var(--app-sage-light);
  color: var(--app-sage-dark);
  font-size: 8px;
  font-weight: 800;
}

/* ! Footer */
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  margin-top: 30px;
  color: var(--app-text-muted);
  font-size: 9px;
  opacity: 0.7;
}
</style>

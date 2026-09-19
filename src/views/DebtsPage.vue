<template>
  <ion-page>
    <!-- ! Page header -->
    <ion-header class="app-header">
      <ion-toolbar>
        <div class="header-content">
          <div class="header-title">
            <div class="title-row"></div>

            <h1>My Debts</h1>

            <p>Keep track of what you owe and what is owed to you.</p>
          </div>

          <!-- ! Header actions -->
          <div class="header-actions">
            <!-- ! Payment history -->
            <button
              class="header-action"
              type="button"
              aria-label="Payment history"
              @click="goToPaymentHistory"
            >
              <ion-icon :icon="receiptOutline" />
            </button>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content
          pulling-text="Pull to refresh"
          refreshing-text="Refreshing..."
        />
      </ion-refresher>

      <div class="page-container">
        <!-- ! Debt status tabs -->
        <div v-if="debtStore.debts.length > 0" class="status-tabs">
          <button
            type="button"
            class="status-tab"
            :class="{
              active: selectedSegment === 'unpaid',
            }"
            @click="selectSegment('unpaid')"
          >
            <span>Unpaid</span>

            <span
              class="tab-count"
              :class="{
                active: selectedSegment === 'unpaid',
              }"
            >
              {{ unpaidDebts.length }}
            </span>
          </button>

          <button
            type="button"
            class="status-tab"
            :class="{
              active: selectedSegment === 'completed',
            }"
            @click="selectSegment('completed')"
          >
            <span>Completed</span>

            <span
              class="tab-count"
              :class="{
                active: selectedSegment === 'completed',
              }"
            >
              {{ completedDebts.length }}
            </span>
          </button>
        </div>

        <!-- ! Completed selection toolbar -->
        <div
          v-if="selectedSegment === 'completed' && completedDebts.length > 0"
          class="completed-toolbar"
        >
          <div class="completed-toolbar-info">
            <span>
              {{
                isSelectionMode
                  ? `${selectedDeleteIds.size} selected`
                  : "Manage completed debts"
              }}
            </span>

            <small v-if="isSelectionMode">
              Select the debts you want to delete.
            </small>
          </div>

          <button
            v-if="!isSelectionMode"
            class="select-button"
            type="button"
            @click="startSelectionMode"
          >
            <ion-icon :icon="checkmarkOutline" />
            Select
          </button>

          <button
            v-else
            class="cancel-select-button"
            type="button"
            @click="cancelSelectionMode"
          >
            Cancel
          </button>
        </div>

        <!-- ! Debt list -->
        <div v-if="debtStore.debts.length === 0" class="empty-state">
          <div class="empty-icon">
            <ion-icon :icon="receiptOutline" />
          </div>

          <h2>No debts yet</h2>

          <p>Add your first debt to start tracking your balance.</p>
        </div>

        <!-- ! Empty state: selected tab -->
        <div
          v-else-if="filteredDebts.length === 0"
          class="empty-state segment-empty"
        >
          <div class="empty-icon">
            <ion-icon
              :icon="
                selectedSegment === 'unpaid' ? walletOutline : checkmarkCircle
              "
            />
          </div>

          <h2>
            {{
              selectedSegment === "unpaid"
                ? "No unpaid debts"
                : "No completed debts"
            }}
          </h2>

          <p>
            {{
              selectedSegment === "unpaid"
                ? "You're all caught up. Add a new debt when you need to."
                : "Completed debts will appear here once they are fully paid."
            }}
          </p>
        </div>

        <!-- ! Debt list -->
        <div v-else class="debt-list">
          <div
            v-for="debt in filteredDebts"
            :key="debt.id"
            class="debt-card"
            :class="{
              expanded: expandedDebtId === debt.id,
              completed: debt.status === 'completed',
              selected: selectedDeleteIds.has(debt.id),
              'selection-mode': isSelectionMode,
            }"
          >
            <!-- ! Selection checkbox -->
            <button
              v-if="isSelectionMode && debt.status === 'completed'"
              class="selection-checkbox"
              type="button"
              :class="{
                checked: selectedDeleteIds.has(debt.id),
              }"
              :aria-label="
                selectedDeleteIds.has(debt.id) ? 'Deselect debt' : 'Select debt'
              "
              @click.stop="toggleDeleteSelection(debt.id)"
            >
              <ion-icon
                v-if="selectedDeleteIds.has(debt.id)"
                :icon="checkmarkOutline"
              />
            </button>

            <!-- ! Compact card header -->
            <button
              class="card-main"
              type="button"
              @click="
                isSelectionMode && debt.status === 'completed'
                  ? toggleDeleteSelection(debt.id)
                  : toggleExpanded(debt.id)
              "
            >
              <div class="card-top">
                <div class="debt-title-area">
                  <h2>
                    {{ debt.name }}
                  </h2>

                  <p>
                    {{ debt.person || "No person specified" }}
                  </p>
                </div>

                <!-- ! Debt direction -->
                <span
                  class="direction-badge"
                  :class="{
                    owe: debt.direction === 'owe',
                    owed: debt.direction === 'owed_to_me',
                  }"
                >
                  <span class="direction-dot"></span>

                  {{ debt.direction === "owe" ? "YOU OWE" : "OWED TO YOU" }}
                </span>
              </div>

              <div class="compact-balance-row">
                <div>
                  <span class="balance-label"> REMAINING </span>

                  <strong class="balance">
                    {{ formatCurrency(debt.remainingAmount) }}
                  </strong>
                </div>

                <!-- ! Hide expand button while selecting -->
                <div v-if="!isSelectionMode" class="expand-button">
                  <ion-icon
                    :icon="
                      expandedDebtId === debt.id
                        ? chevronUpOutline
                        : chevronDownOutline
                    "
                  />
                </div>
              </div>

              <!-- ! Compact progress -->
              <div v-if="debt.originalAmount > 0" class="compact-progress">
                <div class="progress-track">
                  <div
                    class="progress-fill"
                    :class="{
                      completed: debt.status === 'completed',
                    }"
                    :style="{
                      width: `${getPaidPercentage(debt)}%`,
                    }"
                  ></div>
                </div>

                <span> {{ getPaidPercentage(debt) }}% paid </span>
              </div>
            </button>

            <!-- ! Expanded details -->
            <div
              v-if="expandedDebtId === debt.id && !isSelectionMode"
              class="expanded-content"
            >
              <div class="detail-divider"></div>

              <!-- ! Debt summary -->
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label"> ORIGINAL AMOUNT </span>

                  <strong>
                    {{ formatCurrency(debt.originalAmount) }}
                  </strong>
                </div>

                <div class="detail-item">
                  <span class="detail-label"> PAID SO FAR </span>

                  <strong>
                    {{
                      formatCurrency(debt.originalAmount - debt.remainingAmount)
                    }}
                  </strong>
                </div>
              </div>

              <!-- ! Details -->
              <div class="details-list">
                <!-- ! Due date -->
                <div class="detail-row">
                  <div class="detail-icon">
                    <ion-icon :icon="calendarOutline" />
                  </div>

                  <div class="detail-text">
                    <span>Due date</span>

                    <strong>
                      {{
                        debt.dueDate ? formatDate(debt.dueDate) : "No due date"
                      }}
                    </strong>
                  </div>
                </div>

                <!-- ! Debt type -->
                <div class="detail-row">
                  <div class="detail-icon">
                    <ion-icon :icon="walletOutline" />
                  </div>

                  <div class="detail-text">
                    <span>Debt type</span>

                    <strong>
                      {{ formatDebtType(debt.type) }}
                    </strong>
                  </div>
                </div>

                <!-- ! Completed -->
                <div v-if="debt.status === 'completed'" class="completed-row">
                  <ion-icon :icon="checkmarkCircle" />

                  <span>Fully paid</span>
                </div>
              </div>

              <!-- ! Expanded actions -->
              <div class="expanded-actions">
                <!-- ! Record payment -->
                <ion-button
                  v-if="debt.status === 'active' && debt.remainingAmount > 0"
                  class="pay-button"
                  expand="block"
                  fill="solid"
                  @click.stop="openPaymentModal(debt.id)"
                >
                  <ion-icon slot="start" :icon="cashOutline" />

                  Pay Now!
                </ion-button>

                <!-- ! Edit -->
                <button
                  v-if="debt.status === 'active' && debt.remainingAmount > 0"
                  class="secondary-action"
                  type="button"
                  @click.stop="openEditModal(debt.id)"
                >
                  <ion-icon :icon="createOutline" />

                  Edit
                </button>

                <!-- ! Delete active debt -->
                <button
                  v-if="debt.status === 'active'"
                  class="secondary-action delete-action"
                  type="button"
                  @click.stop="deleteDebt(debt.id)"
                >
                  <ion-icon :icon="trashOutline" />

                  Delete
                </button>

                <!-- ! Completed single delete -->
                <button
                  v-if="debt.status === 'completed'"
                  class="completed-single-delete"
                  type="button"
                  @click.stop="deleteDebt(debt.id)"
                >
                  <ion-icon :icon="trashOutline" />

                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ! Bulk delete footer -->
      <div
        v-if="isSelectionMode && selectedDeleteIds.size > 0"
        class="bulk-delete-bar"
      >
        <div class="bulk-delete-info">
          <strong>
            {{ selectedDeleteIds.size }}
          </strong>

          <span>
            {{
              selectedDeleteIds.size === 1 ? "debt selected" : "debts selected"
            }}
          </span>
        </div>

        <button
          class="bulk-delete-button"
          type="button"
          @click="deleteSelectedDebts"
        >
          <ion-icon :icon="trashOutline" />

          Delete Selected
        </button>
      </div>
    </ion-content>

    <!-- ! Payment modal -->
    <RecordPaymentModal
      :is-open="showPaymentModal"
      :debt-id="selectedDebtId"
      @close="closePaymentModal"
    />

    <!-- ! Edit modal -->
    <EditDebtModal
      :is-open="showEditModal"
      :debt-id="selectedDebtId"
      @close="closeEditModal"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { useRouter } from "vue-router";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  alertController,
} from "@ionic/vue";

import {
  trashOutline,
  receiptOutline,
  calendarOutline,
  createOutline,
  checkmarkCircle,
  checkmarkOutline,
  walletOutline,
  chevronDownOutline,
  chevronUpOutline,
  cashOutline,
} from "ionicons/icons";

import { useDebtStore } from "@/stores/debt.store";

import type { Debt, DebtType } from "@/models/debt";

import RecordPaymentModal from "@/components/debt/RecordPaymentModal.vue";
import EditDebtModal from "@/components/debt/EditDebtModal.vue";

const router = useRouter();

const debtStore = useDebtStore();

/* ! Selected debt segment */
const selectedSegment = ref<"unpaid" | "completed">("unpaid");

/* ! Currently expanded debt */
const expandedDebtId = ref<string | null>(null);

/* ! Modal state */
const showPaymentModal = ref(false);

const showEditModal = ref(false);

const selectedDebtId = ref<string | null>(null);

/* ! Bulk selection mode */
const isSelectionMode = ref(false);

/* ! Completed debt IDs selected for deletion */
const selectedDeleteIds = ref<Set<string>>(new Set());

/**
 * ! Load saved debts.
 */
onMounted(() => {
  debtStore.loadDebts();
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

/**
 * ! Navigate to payment history.
 */
function goToPaymentHistory(): void {
  router.push("/tabs/payment-history");
}

/**
 * ! Unpaid debts.
 */
const unpaidDebts = computed<Debt[]>(() => {
  return debtStore.debts.filter((debt: Debt) => debt.status === "active");
});

/**
 * ! Completed debts.
 */
const completedDebts = computed<Debt[]>(() => {
  return debtStore.debts.filter((debt: Debt) => debt.status === "completed");
});

/**
 * ! Debts shown by selected tab.
 */
const filteredDebts = computed<Debt[]>(() => {
  if (selectedSegment.value === "completed") {
    return completedDebts.value;
  }

  return unpaidDebts.value;
});

/**
 * ! Change debt tab.
 */
function selectSegment(segment: "unpaid" | "completed"): void {
  selectedSegment.value = segment;

  /* ! Exit selection mode when leaving completed */
  if (segment !== "completed") {
    cancelSelectionMode();
  }
}

/**
 * ! Start bulk selection mode.
 */
function startSelectionMode(): void {
  isSelectionMode.value = true;

  expandedDebtId.value = null;
}

/**
 * ! Cancel bulk selection mode.
 */
function cancelSelectionMode(): void {
  isSelectionMode.value = false;

  selectedDeleteIds.value = new Set();

  expandedDebtId.value = null;
}

/**
 * ! Select or deselect a completed debt.
 */
function toggleDeleteSelection(debtId: string): void {
  const updated = new Set(selectedDeleteIds.value);

  if (updated.has(debtId)) {
    updated.delete(debtId);
  } else {
    updated.add(debtId);
  }

  selectedDeleteIds.value = updated;
}

/**
 * ! Expand or collapse a debt.
 */
function toggleExpanded(debtId: string): void {
  if (expandedDebtId.value === debtId) {
    expandedDebtId.value = null;

    return;
  }

  expandedDebtId.value = debtId;
}

/**
 * ! Calculate paid percentage.
 */
function getPaidPercentage(debt: Debt): number {
  if (debt.originalAmount <= 0) {
    return 0;
  }

  const paid = debt.originalAmount - debt.remainingAmount;

  return Math.min(
    100,
    Math.max(0, Math.round((paid / debt.originalAmount) * 100)),
  );
}

/**
 * ! Open payment modal.
 */
function openPaymentModal(debtId: string): void {
  selectedDebtId.value = debtId;

  showPaymentModal.value = true;
}

/**
 * ! Close payment modal.
 */
function closePaymentModal(): void {
  showPaymentModal.value = false;

  selectedDebtId.value = null;
}

/**
 * ! Open edit modal.
 */
function openEditModal(debtId: string): void {
  selectedDebtId.value = debtId;

  showEditModal.value = true;
}

/**
 * ! Close edit modal.
 */
function closeEditModal(): void {
  showEditModal.value = false;

  selectedDebtId.value = null;
}

/**
 * ! Delete a single debt.
 */
async function deleteDebt(id: string): Promise<void> {
  const alert = await alertController.create({
    header: "Delete Debt?",

    message: "This debt and its payment history will be permanently removed.",

    buttons: [
      {
        text: "Cancel",
        role: "cancel",
      },

      {
        text: "Delete",
        role: "destructive",

        handler: () => {
          debtStore.deleteDebt(id);

          /* ! Remove from selection */
          const updated = new Set(selectedDeleteIds.value);

          updated.delete(id);

          selectedDeleteIds.value = updated;

          /* ! Collapse deleted card */
          if (expandedDebtId.value === id) {
            expandedDebtId.value = null;
          }
        },
      },
    ],
  });

  await alert.present();
}

/**
 * ! Delete all selected completed debts.
 */
async function deleteSelectedDebts(): Promise<void> {
  const ids = Array.from(selectedDeleteIds.value);

  if (ids.length === 0) {
    return;
  }

  const count = ids.length;

  const alert = await alertController.create({
    header: "Delete Selected Debts?",

    message: `You are about to permanently delete ${count} ${
      count === 1 ? "completed debt" : "completed debts"
    } and their payment history.`,

    buttons: [
      {
        text: "Cancel",
        role: "cancel",
      },

      {
        text: "Delete",
        role: "destructive",

        handler: () => {
          /* ! Delete every selected debt */
          ids.forEach((id) => {
            debtStore.deleteDebt(id);
          });

          /* ! Reset selection state */
          selectedDeleteIds.value = new Set();

          isSelectionMode.value = false;

          expandedDebtId.value = null;
        },
      },
    ],
  });

  await alert.present();
}

/**
 * ! Format currency.
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * ! Format date.
 */
function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * ! Format debt type.
 */
function formatDebtType(type: DebtType): string {
  switch (type) {
    case "one_time":
      return "One-time";

    case "recurring":
      return "Recurring";

    case "no_due_date":
      return "No due date";

    default:
      return "Debt";
  }
}
</script>

<style scoped>
/* ! Page header */
.app-header {
  background: var(--app-background);
  box-shadow: none;
  z-index: 10;
}

ion-toolbar {
  --background: var(--ion-color-primary);
  --border-width: 0;

  padding: 14px 18px 16px;

  border-radius: 0 0 30px 30px;

  box-shadow: 0 6px 18px rgba(31, 41, 55, 0.08);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;

  min-height: 58px;
}

.header-title {
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;

  margin-bottom: 5px;
}

.title-accent {
  width: 6px;
  height: 6px;

  flex-shrink: 0;

  border-radius: 50%;

  background: var(--app-sage);
}

.eyebrow {
  color: rgba(255, 255, 255, 0.62);

  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.6px;
  line-height: 1;

  text-transform: uppercase;
}

.header-title h1 {
  margin: 0;

  color: #ffffff;

  font-size: 26px;
  font-weight: 800;
  line-height: 1.15;

  letter-spacing: -0.6px;
}

.header-title p {
  max-width: 330px;

  margin: 5px 0 0;

  color: rgba(255, 255, 255, 0.62);

  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
}

.header-actions {
  display: flex;
  align-items: center;

  gap: 8px;

  margin-left: 18px;
}

.header-action {
  width: 42px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border: 1px solid rgba(255, 255, 255, 0.12);

  border-radius: 14px;

  background: rgba(255, 255, 255, 0.08);

  color: #ffffff;

  cursor: pointer;
}

.header-action ion-icon {
  font-size: 19px;
}

/* ! Page */
.page-container {
  max-width: 700px;

  margin: 0 auto;

  padding: 20px 16px 120px;
}

/* ! Custom status tabs */
.status-tabs {
  display: flex;
  gap: 4px;

  margin-bottom: 12px;
  padding: 4px;

  border: 1px solid var(--app-border);
  border-radius: 15px;

  background: var(--ion-color-primary);

  box-shadow: 0 3px 10px rgba(31, 41, 55, 0.04);
}

.status-tab {
  flex: 1;

  min-height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;

  padding: 0 12px;

  border: 0;
  border-radius: 11px;

  background: transparent;

  color: var(--app-text-muted);

  font-family: inherit;
  font-size: 12px;
  font-weight: 700;

  cursor: pointer;

  transition:
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.status-tab.active {
  background: var(--app-surface);

  color: var(--app-text);

  box-shadow: 0 2px 7px rgba(31, 41, 55, 0.08);
}

.tab-count {
  min-width: 21px;
  height: 21px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0 6px;

  border-radius: 999px;

  background: #e1e4df;

  color: var(--app-text-muted);

  font-size: 10px;
  font-weight: 800;
}

.tab-count.active {
  background: var(--app-sage-light);

  color: var(--app-sage-dark);
}

/* ! Completed selection toolbar */
.completed-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  margin-bottom: 12px;
  padding: 10px 12px;

  border: 1px solid var(--app-border);
  border-radius: 13px;

  background: var(--app-surface);

  box-shadow: 0 3px 10px rgba(31, 41, 55, 0.04);
}

.completed-toolbar-info {
  min-width: 0;

  display: flex;
  flex-direction: column;

  gap: 2px;
}

.completed-toolbar-info span {
  color: var(--app-text);

  font-size: 11px;
  font-weight: 800;
}

.completed-toolbar-info small {
  color: var(--app-text-muted);

  font-size: 9px;
  font-weight: 500;
}

.select-button,
.cancel-select-button {
  height: 34px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  gap: 5px;

  padding: 0 11px;

  border: 1px solid var(--app-border);
  border-radius: 9px;

  background: var(--app-surface);

  color: var(--app-text);

  font-family: inherit;

  font-size: 10px;
  font-weight: 800;

  cursor: pointer;
}

.select-button ion-icon {
  font-size: 14px;

  color: var(--app-sage);
}

.cancel-select-button {
  color: var(--ion-color-danger);

  background: #fef2f2;

  border-color: #fee2e2;
}

/* ! Debt list */
.debt-list {
  display: flex;
  flex-direction: column;

  gap: 10px;
}

/* ! Debt card */
.debt-card {
  position: relative;

  overflow: hidden;

  background: var(--app-surface);

  border: 1px solid var(--app-border);
  border-radius: 18px;

  box-shadow: 0 4px 14px rgba(31, 41, 55, 0.06);

  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    transform 0.18s ease;
}

.debt-card.expanded {
  border-color: rgba(77, 124, 15, 0.22);

  box-shadow: 0 7px 20px rgba(31, 41, 55, 0.09);
}

.debt-card.completed {
  opacity: 0.92;
}

.debt-card.selection-mode {
  cursor: pointer;
}

.debt-card.selection-mode .card-main {
  padding-left: 52px;
}

.debt-card.selected {
  border-color: rgba(77, 124, 15, 0.5);

  background: rgba(236, 252, 203, 0.3);

  box-shadow: 0 5px 16px rgba(77, 124, 15, 0.1);
}

/* ! Selection checkbox */
.selection-checkbox {
  position: absolute;

  top: 16px;
  left: 16px;

  z-index: 2;

  width: 24px;
  height: 24px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  border: 1.5px solid var(--app-border);
  border-radius: 7px;

  background: #ffffff;

  color: #ffffff;

  cursor: pointer;

  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    transform 0.15s ease;
}

.selection-checkbox.checked {
  border-color: var(--app-sage);

  background: var(--app-sage);
}

.selection-checkbox ion-icon {
  font-size: 16px;
}

.selection-checkbox:active {
  transform: scale(0.92);
}

/* ! Main clickable card area */
.card-main {
  width: 100%;

  display: block;

  padding: 16px;

  border: 0;

  background: transparent;

  color: inherit;

  font-family: inherit;

  text-align: left;

  cursor: pointer;
}

/* ! Top row */
.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 10px;
}

.debt-title-area {
  min-width: 0;
}

.debt-title-area h2 {
  overflow: hidden;

  margin: 0;

  color: var(--app-text);

  font-size: 15px;
  font-weight: 800;
  line-height: 1.3;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.debt-title-area p {
  overflow: hidden;

  margin: 3px 0 0;

  color: var(--app-text-muted);

  font-size: 11px;
  line-height: 1.3;

  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ! Direction */
.direction-badge {
  display: inline-flex;
  align-items: center;

  flex-shrink: 0;

  gap: 5px;

  padding: 5px 7px;

  border-radius: 7px;

  font-size: 8px;
  font-weight: 800;

  letter-spacing: 0.45px;

  white-space: nowrap;
}

.direction-badge.owe {
  background: #fef2f2;

  color: var(--ion-color-danger);
}

.direction-badge.owed {
  background: var(--app-sage-light);

  color: var(--app-sage-dark);
}

.direction-dot {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: currentColor;
}

/* ! Compact balance */
.compact-balance-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  margin-top: 16px;
}

.balance-label {
  display: block;

  margin-bottom: 3px;

  color: var(--app-text-muted);

  font-size: 8px;
  font-weight: 800;

  letter-spacing: 1.1px;
}

.balance {
  display: block;

  color: var(--app-text);

  font-size: 23px;
  font-weight: 800;
  line-height: 1.1;

  letter-spacing: -0.4px;
}

.debt-card.completed .balance {
  color: var(--app-sage-dark);
}

/* ! Expand button */
.expand-button {
  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border: 1px solid var(--app-border);
  border-radius: 10px;

  background: #f8f9f7;

  color: var(--app-text-muted);
}

.debt-card.expanded .expand-button {
  background: var(--app-sage-light);

  color: var(--app-sage-dark);
}

.expand-button ion-icon {
  font-size: 17px;
}

/* ! Compact progress */
.compact-progress {
  display: flex;
  align-items: center;

  gap: 9px;

  margin-top: 13px;
}

.compact-progress .progress-track {
  flex: 1;
}

.compact-progress span {
  flex-shrink: 0;

  color: var(--app-text-muted);

  font-size: 9px;
  font-weight: 700;
}

/* ! Progress */
.progress-track {
  width: 100%;
  height: 5px;

  overflow: hidden;

  border-radius: 999px;

  background: #eef0ee;
}

.progress-fill {
  height: 100%;

  border-radius: inherit;

  background: var(--app-sage);

  transition: width 0.35s ease;
}

.progress-fill.completed {
  background: var(--ion-color-success);
}

/* ! Expanded content */
.expanded-content {
  padding: 0 16px 16px;
}

.detail-divider {
  height: 1px;

  margin-bottom: 16px;

  background: var(--app-border);
}

/* ! Amount details */
.detail-grid {
  display: grid;

  grid-template-columns: repeat(2, minmax(0, 1fr));

  gap: 10px;

  margin-bottom: 18px;
}

.detail-item {
  padding: 11px;

  border-radius: 12px;

  background: var(--app-surface);
}

.detail-label {
  display: block;

  margin-bottom: 5px;

  color: var(--app-text-muted);

  font-size: 8px;
  font-weight: 800;

  letter-spacing: 0.8px;
}

.detail-item strong {
  color: var(--app-text);

  font-size: 14px;
  font-weight: 800;
}

/* ! Details list */
.details-list {
  display: flex;
  flex-direction: column;

  gap: 10px;

  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  align-items: center;

  gap: 10px;
}

.detail-icon {
  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 9px;

  background: var(--app-sage-light);

  color: var(--app-sage-dark);
}

.detail-icon ion-icon {
  font-size: 16px;
}

.detail-text {
  display: flex;
  flex-direction: column;

  gap: 2px;
}

.detail-text span {
  color: var(--app-text-muted);

  font-size: 9px;
  font-weight: 600;
}

.detail-text strong {
  color: var(--app-text);

  font-size: 11px;
  font-weight: 700;
}

.completed-row {
  display: flex;
  align-items: center;

  gap: 7px;

  padding: 9px 11px;

  border-radius: 10px;

  background: var(--app-sage-light);

  color: var(--app-sage-dark);

  font-size: 11px;
  font-weight: 700;
}

.completed-row ion-icon {
  font-size: 16px;
}

/* ! Expanded actions */
.expanded-actions {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    auto
    auto;

  gap: 6px;

  padding-top: 4px;
}

.pay-button {
  --background: var(--app-sage);
  --background-activated: var(--app-sage-dark);
  --border-radius: 10px;

  height: 38px;

  margin: 0;

  font-size: 11px;
  font-weight: 700;
}

.secondary-action {
  min-width: 38px;
  height: 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0 10px;

  border: 1px solid var(--app-border);
  border-radius: 10px;

  background: var(--app-surface);

  color: var(--app-text-muted);

  font-family: inherit;

  font-size: 10px;
  font-weight: 700;

  cursor: pointer;
  border-color: var(--app-border);
  padding: 0;
}

.secondary-action ion-icon {
  font-size: 15px;
}

.secondary-action.delete-action,
.completed-single-delete {
  color: var(--ion-color-danger);
}

.completed-single-delete {
  height: 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;

  padding: 0 12px;

  border: 1px solid #fee2e2;
  border-radius: 10px;

  font-family: inherit;

  font-size: 10px;
  font-weight: 700;

  cursor: pointer;
}

.completed-single-delete ion-icon {
  font-size: 15px;
}

/* ! Bulk delete bar */
.bulk-delete-bar {
  position: fixed;

  left: 50%;
  bottom: 76px;

  z-index: 20;

  width: min(calc(100% - 24px), 668px);

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding: 10px 12px;

  transform: translateX(-50%);

  border: 1px solid #fee2e2;
  border-radius: 15px;

  background: #ffffff;

  box-shadow: 0 8px 28px rgba(31, 41, 55, 0.16);
}

.bulk-delete-info {
  display: flex;
  align-items: baseline;

  gap: 5px;

  color: var(--app-text-muted);

  font-size: 10px;
  font-weight: 700;
}

.bulk-delete-info strong {
  color: var(--ion-color-danger);

  font-size: 18px;
  font-weight: 900;
}

.bulk-delete-button {
  height: 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;

  padding: 0 13px;

  border: 0;
  border-radius: 10px;

  background: var(--ion-color-danger);

  color: #ffffff;

  font-family: inherit;

  font-size: 10px;
  font-weight: 800;

  cursor: pointer;
}

.bulk-delete-button ion-icon {
  font-size: 15px;
}

.bulk-delete-button:active {
  transform: scale(0.97);
}

/* ! Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: 420px;

  padding: 40px 20px;

  text-align: center;
}

.segment-empty {
  min-height: 350px;
}

.empty-icon {
  width: 58px;
  height: 58px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 16px;

  border-radius: 18px;

  background: var(--app-sage-light);

  color: var(--app-sage);
}

.empty-icon ion-icon {
  font-size: 27px;
}

.empty-state h2 {
  margin: 0 0 6px;

  color: var(--app-text);

  font-size: 19px;
  font-weight: 800;
}

.empty-state p {
  max-width: 280px;

  margin: 0;

  color: var(--app-text-muted);

  font-size: 13px;
  line-height: 1.5;
}

/* ! Mobile */
@media (max-width: 400px) {
  ion-toolbar {
    padding-left: 16px;
    padding-right: 16px;
  }

  .header-title h1 {
    font-size: 24px;
  }

  .header-title p {
    max-width: 240px;
  }

  .header-actions {
    margin-left: 12px;
  }

  .header-action {
    width: 40px;
    height: 40px;
  }

  .card-main {
    padding: 15px;
  }

  .debt-card.selection-mode .card-main {
    padding-left: 50px;
  }

  .selection-checkbox {
    top: 15px;
    left: 15px;
  }

  .direction-badge {
    padding: 5px 6px;

    font-size: 7px;
  }

  .balance {
    font-size: 22px;
  }

  .expanded-content {
    padding: 0 15px 15px;
  }

  .expanded-actions {
    grid-template-columns:
      minmax(0, 1fr)
      38px
      38px;
  }

  .secondary-action {
    width: 38px;

    padding: 0;
  }

  .secondary-action:not(.delete-action) {
    font-size: 0;
  }

  .secondary-action.delete-action {
    font-size: 0;
  }

  .completed-single-delete {
    width: 100%;
  }

  .bulk-delete-bar {
    bottom: 70px;

    width: calc(100% - 20px);

    padding: 9px 10px;
  }

  .bulk-delete-button {
    padding: 0 11px;

    font-size: 9px;
  }
}

/* ! ============================= */
/* ! DARK MODE OVERRIDES */
/* ! ============================= */

/* ! Header */
:global(html.dark) .app-header {
  background: var(--app-background);
}

:global(html.dark) ion-toolbar {
  --background: #1a2118;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
}

/* ! Status tabs */
:global(html.dark) .status-tabs {
  background: #202820;
  border-color: var(--app-border);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
}

:global(html.dark) .status-tab.active {
  background: var(--app-surface);
  color: var(--app-text);
  box-shadow: 0 2px 7px rgba(0, 0, 0, 0.2);
}

:global(html.dark) .tab-count {
  background: #30392d;
  color: var(--app-text-muted);
}

:global(html.dark) .tab-count.active {
  background: var(--app-sage-light);
  color: var(--app-sage-dark);
}

/* ! Completed selection toolbar */
:global(html.dark) .completed-toolbar {
  background: var(--app-surface);
  border-color: var(--app-border);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
}

:global(html.dark) .select-button,
:global(html.dark) .cancel-select-button {
  background: var(--app-surface-soft);
  border-color: var(--app-border);
}

:global(html.dark) .cancel-select-button {
  background: #3a2020;
  border-color: #5a2b2b;
  color: var(--app-danger);
}

/* ! Debt cards */
:global(html.dark) .debt-card {
  background: var(--app-surface);
  border-color: var(--app-border);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
}

:global(html.dark) .debt-card.expanded {
  border-color: rgba(132, 204, 22, 0.35);
  box-shadow: 0 7px 20px rgba(0, 0, 0, 0.25);
}

:global(html.dark) .debt-card.selected {
  background: rgba(132, 204, 22, 0.08);
  border-color: rgba(132, 204, 22, 0.5);
  box-shadow: 0 5px 16px rgba(132, 204, 22, 0.08);
}

/* ! Selection checkbox */
:global(html.dark) .selection-checkbox {
  background: var(--app-surface-soft);
  border-color: var(--app-border);
}

/* ! Direction badges */
:global(html.dark) .direction-badge.owe {
  background: #3a2020;
  color: var(--app-danger);
}

:global(html.dark) .direction-badge.owed {
  background: var(--app-sage-light);
  color: var(--app-sage-dark);
}

/* ! Expand button */
:global(html.dark) .expand-button {
  background: var(--app-surface-soft);
  border-color: var(--app-border);
}

:global(html.dark) .debt-card.expanded .expand-button {
  background: var(--app-sage-light);
  color: var(--app-sage-dark);
}

/* ! Progress track */
:global(html.dark) .progress-track {
  background: #30392d;
}

/* ! Detail amount cards */
:global(html.dark) .detail-item {
  background: var(--app-surface-soft);
  color: var(--app-text);
}

/* ! Secondary actions */
:global(html.dark) .secondary-action {
  background: var(--app-surface-soft);
  border-color: var(--app-border);
  color: var(--app-text-muted);
}

:global(html.dark) .secondary-action.delete-action,
:global(html.dark) .completed-single-delete {
  background: #3a2020;
  border-color: #5a2b2b;
  color: var(--app-danger);
}

/* ! Bulk delete bar */
:global(html.dark) .bulk-delete-bar {
  background: var(--app-surface);
  border-color: #5a2b2b;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
}

/* ! Empty state */
:global(html.dark) .empty-state {
  background: transparent;
}

/* ! Completed debt */
:global(html.dark) .debt-card.completed .balance {
  color: var(--app-sage-dark);
}
</style>

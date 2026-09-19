<template>
  <ion-page>
    <!-- ! Page header -->
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/more" />
        </ion-buttons>

        <ion-title> Payment History </ion-title>

        <!-- ! Select mode -->
        <ion-buttons slot="end">
          <ion-button v-if="payments.length > 0" @click="toggleSelectionMode">
            {{ isSelectionMode ? "Cancel" : "Select" }}
          </ion-button>
        </ion-buttons>
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
        <!-- ! Selection toolbar -->
        <div
          v-if="isSelectionMode && payments.length > 0"
          class="selection-toolbar"
        >
          <div class="selection-info">
            <strong>
              {{ selectedPaymentIds.size }}
            </strong>

            <span>
              {{
                selectedPaymentIds.size === 1
                  ? "payment selected"
                  : "payments selected"
              }}
            </span>
          </div>

          <button
            class="select-all-button"
            type="button"
            @click="toggleSelectAll"
          >
            <ion-icon :icon="checkmarkDoneOutline" />

            {{ allPaymentsSelected ? "Deselect All" : "Select All" }}
          </button>
        </div>

        <!-- ! Empty state -->
        <div v-if="payments.length === 0" class="empty-state">
          <div class="empty-icon">
            <ion-icon :icon="receiptOutline" />
          </div>

          <h2>No Payments Yet</h2>

          <p>Payments you record will appear here.</p>
        </div>

        <!-- ! Payment history -->
        <div v-else class="history-list">
          <div
            v-for="payment in payments"
            :key="payment.id"
            class="payment-card"
            :class="{
              selected: selectedPaymentIds.has(payment.id),
              'selection-mode': isSelectionMode,
            }"
            @click="
              isSelectionMode
                ? togglePaymentSelection(payment.id)
                : openReceipt(payment)
            "
          >
            <!-- ! Selection checkbox -->
            <button
              v-if="isSelectionMode"
              class="payment-checkbox"
              :class="{
                checked: selectedPaymentIds.has(payment.id),
              }"
              type="button"
              :aria-label="
                selectedPaymentIds.has(payment.id)
                  ? 'Deselect payment'
                  : 'Select payment'
              "
              @click.stop="togglePaymentSelection(payment.id)"
            >
              <ion-icon
                v-if="selectedPaymentIds.has(payment.id)"
                :icon="checkmarkOutline"
              />
            </button>

            <!-- ! Receipt icon -->
            <div class="payment-icon">
              <ion-icon :icon="receiptOutline" />
            </div>

            <!-- ! Payment information -->
            <div class="payment-info">
              <div class="payment-top">
                <h3>
                  {{ payment.debtName }}
                </h3>

                <strong
                  :class="{
                    incoming: payment.direction === 'owed_to_me',
                  }"
                >
                  {{ payment.direction === "owed_to_me" ? "+" : "-" }}₱{{
                    formatAmount(payment.amount)
                  }}
                </strong>
              </div>

              <p v-if="payment.person" class="person">
                {{
                  payment.direction === "owe"
                    ? `Paid to ${payment.person}`
                    : `Received from ${payment.person}`
                }}
              </p>

              <p class="date">
                {{ formatDate(payment.paidAt) }}
              </p>

              <p v-if="payment.note" class="note">
                {{ payment.note }}
              </p>
            </div>

            <!-- ! Hide chevron during selection -->
            <ion-icon
              v-if="!isSelectionMode"
              :icon="chevronForwardOutline"
              class="chevron"
            />
          </div>
        </div>
      </div>

      <!-- ! Bulk delete footer -->
      <div
        v-if="isSelectionMode && selectedPaymentIds.size > 0"
        class="bulk-delete-bar"
      >
        <div class="bulk-delete-info">
          <strong>
            {{ selectedPaymentIds.size }}
          </strong>

          <span>
            {{
              selectedPaymentIds.size === 1
                ? "payment selected"
                : "payments selected"
            }}
          </span>
        </div>

        <button
          class="bulk-delete-button"
          type="button"
          @click="deleteSelectedPayments"
        >
          <ion-icon :icon="trashOutline" />

          Delete Selected
        </button>
      </div>

      <!-- ! Payment receipt modal -->
      <ion-modal :is-open="showReceipt" @didDismiss="closeReceipt">
        <ion-header>
          <ion-toolbar>
            <ion-title> Payment Receipt </ion-title>

            <ion-buttons slot="end">
              <ion-button @click="closeReceipt"> Done </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content v-if="selectedPayment" class="ion-padding">
          <div class="receipt">
            <!-- ! Success indicator -->
            <div class="success-icon">
              <ion-icon :icon="checkmarkOutline" />
            </div>

            <h2>Payment Recorded</h2>

            <div
              class="receipt-amount"
              :class="{
                incoming: selectedPayment.direction === 'owed_to_me',
              }"
            >
              {{ selectedPayment.direction === "owed_to_me" ? "+" : "-" }}₱{{
                formatAmount(selectedPayment.amount)
              }}
            </div>

            <p class="receipt-date">
              {{ formatDate(selectedPayment.paidAt) }}
            </p>

            <div class="receipt-divider" />

            <!-- ! Debt information -->
            <div class="receipt-row">
              <span>Debt</span>

              <strong>
                {{ selectedPayment.debtName }}
              </strong>
            </div>

            <div v-if="selectedPayment.person" class="receipt-row">
              <span>
                {{
                  selectedPayment.direction === "owe"
                    ? "Paid To"
                    : "Received From"
                }}
              </span>

              <strong>
                {{ selectedPayment.person }}
              </strong>
            </div>

            <div class="receipt-row">
              <span>Type</span>

              <strong>
                {{
                  selectedPayment.direction === "owe" ? "Payment" : "Received"
                }}
              </strong>
            </div>

            <!-- ! Note -->
            <div v-if="selectedPayment.note" class="receipt-note">
              <span>Note</span>

              <p>
                {{ selectedPayment.note }}
              </p>
            </div>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonContent,
  IonIcon,
  IonModal,
  IonRefresher,
  IonRefresherContent,
  alertController,
} from "@ionic/vue";

import {
  receiptOutline,
  chevronForwardOutline,
  checkmarkOutline,
  checkmarkDoneOutline,
  trashOutline,
} from "ionicons/icons";

import { useDebtStore } from "@/stores/debt.store";

/* ! Access the debt store. */
const debtStore = useDebtStore();

/* ! Selection mode state. */
const isSelectionMode = ref(false);

/* ! Selected payment IDs. */
const selectedPaymentIds = ref<Set<string>>(new Set());

/* ! Currently selected payment. */
const selectedPayment = ref<(typeof payments.value)[number] | null>(null);

/* ! Controls receipt modal visibility. */
const showReceipt = ref(false);

/**
 * ! Load saved debts before rendering payment history.
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
 * ! Get all payments from the store.
 */
const payments = computed(() => {
  return debtStore.paymentHistory;
});

/**
 * ! Check whether every payment is selected.
 */
const allPaymentsSelected = computed(() => {
  return (
    payments.value.length > 0 &&
    payments.value.every((payment) => selectedPaymentIds.value.has(payment.id))
  );
});

/**
 * ! Toggle selection mode.
 */
function toggleSelectionMode(): void {
  isSelectionMode.value = !isSelectionMode.value;

  // ? Clear selections when leaving selection mode.
  if (!isSelectionMode.value) {
    selectedPaymentIds.value = new Set();
  }
}

/**
 * ! Select or deselect one payment.
 */
function togglePaymentSelection(paymentId: string): void {
  const updated = new Set(selectedPaymentIds.value);

  if (updated.has(paymentId)) {
    updated.delete(paymentId);
  } else {
    updated.add(paymentId);
  }

  selectedPaymentIds.value = updated;
}

/**
 * ! Select all or deselect all payments.
 */
function toggleSelectAll(): void {
  if (allPaymentsSelected.value) {
    selectedPaymentIds.value = new Set();

    return;
  }

  selectedPaymentIds.value = new Set(
    payments.value.map((payment) => payment.id),
  );
}

/**
 * ! Open payment receipt.
 */
function openReceipt(payment: (typeof payments.value)[number]): void {
  selectedPayment.value = payment;

  showReceipt.value = true;
}

/**
 * ! Close payment receipt.
 */
function closeReceipt(): void {
  showReceipt.value = false;

  selectedPayment.value = null;
}

/**
 * ! Delete selected payments.
 */
async function deleteSelectedPayments(): Promise<void> {
  const selectedIds = Array.from(selectedPaymentIds.value);

  if (selectedIds.length === 0) {
    return;
  }

  const count = selectedIds.length;

  const alert = await alertController.create({
    header: "Delete Selected Payments?",

    message: `You are about to permanently delete ${count} ${
      count === 1 ? "payment" : "payments"
    }. The deleted payment amounts will be restored to their respective debt balances.`,

    buttons: [
      {
        text: "Cancel",
        role: "cancel",
      },

      {
        text: "Delete",
        role: "destructive",

        handler: () => {
          /* ! Delete each selected payment. */
          selectedIds.forEach((paymentId) => {
            const payment = payments.value.find(
              (item) => item.id === paymentId,
            );

            // ? Skip if payment cannot be found.
            if (!payment) {
              return;
            }

            debtStore.deletePayment(payment.debtId, payment.id);
          });

          /* ! Reset selection mode. */
          selectedPaymentIds.value = new Set();

          isSelectionMode.value = false;

          /* ! Close receipt if the deleted payment was open. */
          if (
            selectedPayment.value &&
            selectedIds.includes(selectedPayment.value.id)
          ) {
            closeReceipt();
          }
        },
      },
    ],
  });

  await alert.present();
}

/**
 * ! Format currency amount.
 */
function formatAmount(amount: number): string {
  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * ! Format payment date and time.
 */
function formatDate(date: string): string {
  return new Date(date).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
</script>

<style scoped>
/* ! Page */
ion-content {
  --background: var(--app-background);
}

.page-container {
  max-width: 700px;

  margin: 0 auto;

  padding: 16px 16px 120px;
}

/* ! Selection toolbar */
.selection-toolbar {
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

.selection-info {
  display: flex;
  align-items: baseline;

  gap: 5px;

  color: var(--app-text-muted);

  font-size: 10px;
  font-weight: 700;
}

.selection-info strong {
  color: var(--app-sage-dark);

  font-size: 18px;
  font-weight: 900;
}

.select-all-button {
  height: 34px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 5px;

  flex-shrink: 0;

  padding: 0 11px;

  border: 1px solid var(--app-border);
  border-radius: 9px;

  background: #f8f9f7;

  color: var(--app-text);

  font-family: inherit;

  font-size: 10px;
  font-weight: 800;

  cursor: pointer;
}

.select-all-button ion-icon {
  font-size: 14px;

  color: var(--app-sage);
}

/* ! Empty state */
.empty-state {
  min-height: 70vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 30px;

  text-align: center;
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
  font-size: 28px;
}

.empty-state h2 {
  margin: 0 0 8px;

  color: var(--app-text);

  font-size: 20px;
  font-weight: 800;
}

.empty-state p {
  margin: 0;

  color: var(--app-text-muted);

  font-size: 13px;
}

/* ! Payment list */
.history-list {
  display: flex;
  flex-direction: column;

  gap: 10px;
}

/* ! Payment card */
.payment-card {
  position: relative;

  display: flex;
  align-items: center;

  gap: 12px;

  padding: 15px;

  background: var(--app-surface);

  border: 1px solid var(--app-border);
  border-radius: 16px;

  cursor: pointer;

  transition:
    transform 0.15s ease,
    opacity 0.15s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.payment-card:active {
  transform: scale(0.98);

  opacity: 0.8;
}

.payment-card.selection-mode {
  padding-left: 49px;
}

.payment-card.selected {
  border-color: rgba(77, 124, 15, 0.5);

  background: rgba(236, 252, 203, 0.35);
}

/* ! Payment checkbox */
.payment-checkbox {
  position: absolute;

  left: 15px;

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

.payment-checkbox.checked {
  border-color: var(--app-sage);

  background: var(--app-sage);
}

.payment-checkbox ion-icon {
  font-size: 16px;
}

.payment-checkbox:active {
  transform: scale(0.92);
}

/* ! Receipt icon */
.payment-icon {
  width: 42px;
  height: 42px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  background: var(--app-surface-soft);
}

.payment-icon ion-icon {
  font-size: 21px;

  color: var(--app-text);
}

/* ! Payment information */
.payment-info {
  flex: 1;

  min-width: 0;
}

.payment-top {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 10px;
}

.payment-top h3 {
  overflow: hidden;

  margin: 0;

  color: var(--app-text);

  font-size: 15px;
  font-weight: 700;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.payment-top strong {
  flex-shrink: 0;

  color: var(--ion-color-danger);

  font-size: 15px;
}

.payment-top strong.incoming {
  color: var(--ion-color-success);
}

.person {
  margin: 4px 0 0;

  color: var(--app-text-subtle);

  font-size: 13px;
}

.date {
  margin: 3px 0 0;

  color: var(--app-text-muted);

  font-size: 12px;
}

.note {
  overflow: hidden;

  margin: 6px 0 0;

  color: var(--app-text-muted);

  font-size: 12px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ! Chevron */
.chevron {
  flex-shrink: 0;

  color: var(--app-text-muted);

  font-size: 18px;
}

/* ! Bulk delete footer */
.bulk-delete-bar {
  position: fixed;

  left: 50%;
  bottom: 16px;

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

/* ! Receipt */
.receipt {
  padding: 20px 10px;

  text-align: center;
}

.success-icon {
  width: 64px;
  height: 64px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 10px auto 16px;

  border-radius: 50%;

  background: var(--app-success-soft);
}

.success-icon ion-icon {
  color: var(--ion-color-success);

  font-size: 34px;
}

.receipt h2 {
  margin: 0;

  color: var(--app-text);

  font-size: 21px;
  font-weight: 700;
}

.receipt-amount {
  margin-top: 20px;

  color: var(--ion-color-danger);

  font-size: 34px;
  font-weight: 800;
}

.receipt-amount.incoming {
  color: var(--ion-color-success);
}

.receipt-date {
  margin: 6px 0 0;

  color: var(--app-text-muted);

  font-size: 13px;
}

.receipt-divider {
  height: 1px;

  margin: 24px 0;

  background: var(--app-border);
}

.receipt-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding: 12px 0;

  text-align: left;

  border-bottom: 1px solid var(--app-border);
}

.receipt-row span {
  color: var(--app-text-muted);

  font-size: 14px;
}

.receipt-row strong {
  font-size: 14px;

  text-align: right;
}

.receipt-note {
  margin-top: 20px;

  padding: 14px;

  border-radius: 12px;

  background: var(--app-surface-alt);

  text-align: left;
}

.receipt-note span {
  display: block;

  margin-bottom: 5px;

  color: var(--app-text-muted);

  font-size: 12px;
  font-weight: 700;
}

.receipt-note p {
  margin: 0;

  color: var(--app-text);

  font-size: 14px;
}

/* ! Mobile */
@media (max-width: 400px) {
  .page-container {
    padding-left: 12px;
    padding-right: 12px;
  }

  .payment-card {
    padding: 13px;
  }

  .payment-card.selection-mode {
    padding-left: 47px;
  }

  .payment-checkbox {
    left: 13px;
  }

  .payment-top strong {
    font-size: 14px;
  }

  .payment-icon {
    width: 40px;
    height: 40px;
  }

  .bulk-delete-bar {
    bottom: 10px;

    width: calc(100% - 20px);

    padding: 9px 10px;
  }

  .bulk-delete-button {
    padding: 0 11px;

    font-size: 9px;
  }
}
</style>

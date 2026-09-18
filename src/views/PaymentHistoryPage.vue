<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/more" />
        </ion-buttons>

        <ion-title>Payment History</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- ! Empty state -->
      <div v-if="payments.length === 0" class="empty-state">
        <ion-icon :icon="receiptOutline" class="empty-icon" />

        <h2>No Payments Yet</h2>

        <p>Payments you record will appear here.</p>
      </div>

      <!-- ! Payment history -->
      <div v-else class="history-list">
        <div
          v-for="payment in payments"
          :key="payment.id"
          class="payment-card"
          @click="openReceipt(payment)"
        >
          <div class="payment-icon">
            <ion-icon :icon="receiptOutline" />
          </div>

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

          <ion-icon :icon="chevronForwardOutline" class="chevron" />
        </div>
      </div>

      <!-- ! Payment receipt modal -->
      <ion-modal :is-open="showReceipt" @didDismiss="closeReceipt">
        <ion-header>
          <ion-toolbar>
            <ion-title>Payment Receipt</ion-title>

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

            <div class="receipt-amount">
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
} from "@ionic/vue";

import {
  receiptOutline,
  chevronForwardOutline,
  checkmarkOutline,
} from "ionicons/icons";

import { useDebtStore } from "@/stores/debt.store";

// ! Access the debt store.
const debtStore = useDebtStore();

// ! Load saved debts before rendering payment history.
onMounted(() => {
  debtStore.loadDebts();
});

// ! Get all payments from the store.
const payments = computed(() => {
  return debtStore.paymentHistory;
});

// ! Currently selected payment.
const selectedPayment = ref<(typeof payments.value)[number] | null>(null);

// ! Controls receipt modal visibility.
const showReceipt = ref(false);

// ! Open payment receipt.
function openReceipt(payment: (typeof payments.value)[number]): void {
  selectedPayment.value = payment;
  showReceipt.value = true;
}

// ! Close payment receipt.
function closeReceipt(): void {
  showReceipt.value = false;
  selectedPayment.value = null;
}

// ! Format currency amount.
function formatAmount(amount: number): string {
  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ! Format payment date and time.
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
ion-content {
  --background: #f7f7f7;
}

/* ! Empty state */
.empty-state {
  min-height: 70vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;
  padding: 30px;
}

.empty-icon {
  font-size: 52px;
  color: #999999;
  margin-bottom: 16px;
}

.empty-state h2 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
}

.empty-state p {
  margin: 0;
  color: #777777;
}

/* ! Payment list */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ! Payment card */
.payment-card {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 15px;

  background: #ffffff;
  border-radius: 16px;

  cursor: pointer;

  transition:
    transform 0.15s ease,
    opacity 0.15s ease;
}

.payment-card:active {
  transform: scale(0.98);
  opacity: 0.8;
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

  background: #f0f0f0;
}

.payment-icon ion-icon {
  font-size: 21px;
  color: #333333;
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
  margin: 0;

  font-size: 15px;
  font-weight: 700;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.payment-top strong {
  flex-shrink: 0;

  font-size: 15px;
  color: #dc3545;
}

.payment-top strong.incoming {
  color: #198754;
}

.person {
  margin: 4px 0 0;

  font-size: 13px;
  color: #555555;
}

.date {
  margin: 3px 0 0;

  font-size: 12px;
  color: #888888;
}

.note {
  margin: 6px 0 0;

  font-size: 12px;
  color: #777777;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron {
  flex-shrink: 0;

  font-size: 18px;
  color: #aaaaaa;
}

/* ! Receipt */
.receipt {
  text-align: center;
  padding: 20px 10px;
}

.success-icon {
  width: 64px;
  height: 64px;

  margin: 10px auto 16px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #e9f7ef;
}

.success-icon ion-icon {
  font-size: 34px;
  color: #198754;
}

.receipt h2 {
  margin: 0;

  font-size: 21px;
  font-weight: 700;
}

.receipt-amount {
  margin-top: 20px;

  font-size: 34px;
  font-weight: 800;
  color: #dc3545;
}

.receipt-date {
  margin: 6px 0 0;

  color: #777777;
  font-size: 13px;
}

.receipt-divider {
  height: 1px;

  margin: 24px 0;

  background: #eeeeee;
}

.receipt-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding: 12px 0;

  text-align: left;
  border-bottom: 1px solid #eeeeee;
}

.receipt-row span {
  color: #777777;
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

  background: #f7f7f7;

  text-align: left;
}

.receipt-note span {
  display: block;

  margin-bottom: 5px;

  font-size: 12px;
  font-weight: 700;
  color: #777777;
}

.receipt-note p {
  margin: 0;

  font-size: 14px;
}
</style>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Calendar</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="page-container">
        <!-- ! Calendar -->
        <ion-card class="calendar-card">
          <ion-card-content>
            <ion-datetime
              v-model="selectedDate"
              presentation="date"
              :highlighted-dates="highlightedDates"
              @ionChange="handleDateChange"
            />

            <!-- ! Calendar legend -->
            <div class="legend">
              <div class="legend-item">
                <span class="legend-dot overdue"></span>
                <span>Overdue</span>
              </div>

              <div class="legend-item">
                <span class="legend-dot soon"></span>
                <span>Due Soon</span>
              </div>

              <div class="legend-item">
                <span class="legend-dot later"></span>
                <span>Later</span>
              </div>

              <div class="legend-item">
                <span class="legend-dot completed"></span>
                <span>Completed</span>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- ! Selected date information -->
        <div v-if="selectedDateDebts.length > 0" class="selected-date-section">
          <h2>
            {{ formatLongDate(selectedDate) }}
          </h2>

          <p class="section-subtitle">
            {{ selectedDateDebts.length }}
            payment{{ selectedDateDebts.length !== 1 ? "s" : "" }}
            scheduled
          </p>

          <!-- ! Debts for selected date -->
          <div
            v-for="debt in selectedDateDebts"
            :key="debt.id"
            class="debt-card"
            @click="openDebtDetails(debt)"
          >
            <div
              class="status-indicator"
              :class="getDebtColorClass(debt)"
            ></div>

            <div class="date-box">
              <strong>
                {{ getDay(debt.dueDate!) }}
              </strong>

              <span>
                {{ getMonth(debt.dueDate!) }}
              </span>
            </div>

            <div class="debt-info">
              <strong>
                {{ debt.name }}
              </strong>

              <span>
                {{ debt.person || "No person" }}
              </span>

              <small>
                {{ getDebtStatusText(debt) }}
              </small>
            </div>

            <strong class="amount">
              {{ formatCurrency(debt.remainingAmount) }}
            </strong>
          </div>
        </div>

        <!-- ! No debts for selected date -->
        <div v-else class="no-date-debts">
          <h2>
            {{ formatLongDate(selectedDate) }}
          </h2>

          <p>No debt payments scheduled for this date.</p>
        </div>

        <!-- ! Upcoming -->
        <section v-if="upcomingDebts.length > 0">
          <h2>Upcoming</h2>

          <div
            v-for="debt in upcomingDebts"
            :key="debt.id"
            class="debt-card"
            @click="openDebtDetails(debt)"
          >
            <div
              class="status-indicator"
              :class="getDebtColorClass(debt)"
            ></div>

            <div class="date-box">
              <strong>
                {{ getDay(debt.dueDate!) }}
              </strong>

              <span>
                {{ getMonth(debt.dueDate!) }}
              </span>
            </div>

            <div class="debt-info">
              <strong>
                {{ debt.name }}
              </strong>

              <span>
                {{ debt.person || "No person" }}
              </span>

              <small>
                Due
                {{ formatDate(debt.dueDate!) }}
              </small>
            </div>

            <strong class="amount">
              {{ formatCurrency(debt.remainingAmount) }}
            </strong>
          </div>
        </section>

        <!-- ! Later payments -->
        <section v-if="laterDebts.length > 0">
          <h2>Later</h2>

          <div
            v-for="debt in laterDebts"
            :key="debt.id"
            class="debt-card"
            @click="openDebtDetails(debt)"
          >
            <div
              class="status-indicator"
              :class="getDebtColorClass(debt)"
            ></div>

            <div class="date-box">
              <strong>
                {{ getDay(debt.dueDate!) }}
              </strong>

              <span>
                {{ getMonth(debt.dueDate!) }}
              </span>
            </div>

            <div class="debt-info">
              <strong>
                {{ debt.name }}
              </strong>

              <span>
                {{ debt.person || "No person" }}
              </span>

              <small>
                Due
                {{ formatDate(debt.dueDate!) }}
              </small>
            </div>

            <strong class="amount">
              {{ formatCurrency(debt.remainingAmount) }}
            </strong>
          </div>
        </section>
      </div>
    </ion-content>

    <!-- ! Debt details modal -->
    <ion-modal :is-open="showDetailsModal" @didDismiss="closeDebtDetails">
      <ion-header>
        <ion-toolbar>
          <ion-title> Debt Details </ion-title>

          <ion-buttons slot="end">
            <ion-button @click="closeDebtDetails"> Close </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <div v-if="selectedDebt" class="details-container">
          <!-- ! Debt name -->
          <div class="details-header">
            <div
              class="large-status-indicator"
              :class="getDebtColorClass(selectedDebt)"
            ></div>

            <div>
              <h2>
                {{ selectedDebt.name }}
              </h2>

              <p>
                {{ selectedDebt.person || "No person" }}
              </p>
            </div>
          </div>

          <!-- ! Balance -->
          <div class="balance-box">
            <span> Remaining Balance </span>

            <strong>
              {{ formatCurrency(selectedDebt.remainingAmount) }}
            </strong>
          </div>

          <!-- ! Details -->
          <div class="details-list">
            <div class="detail-row">
              <span>Original Amount</span>

              <strong>
                {{ formatCurrency(selectedDebt.originalAmount) }}
              </strong>
            </div>

            <div class="detail-row">
              <span>Direction</span>

              <strong>
                {{ selectedDebt.direction === "owe" ? "I Owe" : "Owes Me" }}
              </strong>
            </div>

            <div class="detail-row">
              <span>Type</span>

              <strong>
                {{ formatDebtType(selectedDebt.type) }}
              </strong>
            </div>

            <div class="detail-row">
              <span>Due Date</span>

              <strong>
                {{
                  selectedDebt.dueDate
                    ? formatDate(selectedDebt.dueDate)
                    : "No due date"
                }}
              </strong>
            </div>

            <div class="detail-row">
              <span>Status</span>

              <strong>
                {{ selectedDebt.status }}
              </strong>
            </div>
          </div>

          <!-- ! Notes -->
          <div v-if="selectedDebt.notes" class="notes-box">
            <span>Notes</span>

            <p>
              {{ selectedDebt.notes }}
            </p>
          </div>

          <!-- ! Payment history -->
          <div v-if="selectedDebt.payments.length > 0" class="payment-history">
            <h3>Payment History</h3>

            <div
              v-for="payment in selectedDebt.payments"
              :key="payment.id"
              class="payment-row"
            >
              <div>
                <strong>
                  {{ formatCurrency(payment.amount) }}
                </strong>

                <small>
                  {{ formatDateTime(payment.paidAt) }}
                </small>
              </div>

              <span v-if="payment.note">
                {{ payment.note }}
              </span>
            </div>
          </div>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonDatetime,
  IonCard,
  IonCardContent,
  IonModal,
  IonButtons,
  IonButton,
} from "@ionic/vue";

import { useDebtStore } from "@/stores/debt.store";

import type { Debt } from "@/models/debt";

const debtStore = useDebtStore();

// ! Selected calendar date.
const selectedDate = ref(new Date().toISOString());

// ! Selected debt for details.
const selectedDebt = ref<Debt | null>(null);

const showDetailsModal = ref(false);

// ! Load debts.
onMounted(() => {
  debtStore.loadDebts();
});

// ! Get all debts that have due dates.
const scheduledDebts = computed(() => {
  return debtStore.debts
    .filter((debt: Debt) => !!debt.dueDate)
    .sort(
      (a: Debt, b: Debt) =>
        new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime(),
    );
});

// ! Debts scheduled for selected date.
const selectedDateDebts = computed(() => {
  const selected = getDateKey(selectedDate.value);

  return scheduledDebts.value.filter(
    (debt: Debt) => getDateKey(debt.dueDate!) === selected,
  );
});

// ! Upcoming debts within 7 days.
const upcomingDebts = computed(() => {
  const today = startOfDay(new Date());

  const nextWeek = new Date(today);

  nextWeek.setDate(today.getDate() + 7);

  return scheduledDebts.value.filter((debt: Debt) => {
    if (debt.status === "completed") {
      return false;
    }

    const dueDate = startOfDay(new Date(debt.dueDate!));

    return dueDate >= today && dueDate <= nextWeek;
  });
});

// ! Debts due after 7 days.
const laterDebts = computed(() => {
  const today = startOfDay(new Date());

  const nextWeek = new Date(today);

  nextWeek.setDate(today.getDate() + 7);

  return scheduledDebts.value.filter((debt: Debt) => {
    if (debt.status === "completed") {
      return false;
    }

    return startOfDay(new Date(debt.dueDate!)) > nextWeek;
  });
});

// ! Generate calendar date colors.
const highlightedDates = computed(() => {
  return scheduledDebts.value.map((debt: Debt) => {
    return {
      date: getDateKey(debt.dueDate!),
      textColor: getCalendarColor(debt),
      // backgroundColor: getCalendarColor(debt),
    };
  });
});

// ! Handle calendar date selection.
function handleDateChange(event: CustomEvent): void {
  selectedDate.value = event.detail.value;
}

// ! Open debt details.
function openDebtDetails(debt: Debt): void {
  selectedDebt.value = debt;

  showDetailsModal.value = true;
}

// ! Close details modal.
function closeDebtDetails(): void {
  showDetailsModal.value = false;

  selectedDebt.value = null;
}

// ! Determine debt color.
function getDebtColorClass(debt: Debt): string {
  if (debt.status === "completed") {
    return "completed";
  }

  if (!debt.dueDate) {
    return "none";
  }

  const today = startOfDay(new Date());

  const dueDate = startOfDay(new Date(debt.dueDate));

  if (dueDate < today) {
    return "overdue";
  }

  const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);

  if (daysUntil <= 7) {
    return "soon";
  }

  return "later";
}

// ! Calendar color.
function getCalendarColor(debt: Debt): string {
  const type = getDebtColorClass(debt);

  if (type === "overdue") {
    return "#dc3545";
  }

  if (type === "soon") {
    return "#f59f00";
  }

  if (type === "later") {
    return "#0d6efd";
  }

  if (type === "completed") {
    return "#198754";
  }

  return "#999999";
}

// ! Status text.
function getDebtStatusText(debt: Debt): string {
  if (debt.status === "completed") {
    return "Completed";
  }

  const type = getDebtColorClass(debt);

  if (type === "overdue") {
    return "Overdue";
  }

  if (type === "soon") {
    return "Due soon";
  }

  return "Upcoming";
}

// ! Get date key.
function getDateKey(date: string): string {
  const value = new Date(date);

  const year = value.getFullYear();

  const month = String(value.getMonth() + 1).padStart(2, "0");

  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ! Start date at midnight.
function startOfDay(date: Date): Date {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
}

// ! Format currency.
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

// ! Format date.
function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

// ! Format long date.
function formatLongDate(date: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

// ! Format date and time.
function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

// ! Get day number.
function getDay(date: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    day: "2-digit",
  }).format(new Date(date));
}

// ! Get month.
function getMonth(date: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
  })
    .format(new Date(date))
    .toUpperCase();
}

// ! Format debt type.
function formatDebtType(type: Debt["type"]): string {
  if (type === "one_time") {
    return "One Time";
  }

  if (type === "recurring") {
    return "Recurring";
  }

  return "No Due Date";
}
</script>

<style scoped>
.page-container {
  padding: 12px 16px 100px;
}

.calendar-card {
  margin: 0 0 20px;
  border-radius: 20px;
  box-shadow: none;
  border: 1px solid #eeeeee;
}

ion-datetime {
  width: 100%;
  --background: transparent;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 4px 4px;
  border-top: 1px solid #eeeeee;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;

  font-size: 11px;
  color: #666;
}

.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.legend-dot.overdue {
  background: #dc3545;
}

.legend-dot.soon {
  background: #f59f00;
}

.legend-dot.later {
  background: #0d6efd;
}

.legend-dot.completed {
  background: #198754;
}

.selected-date-section {
  margin-bottom: 28px;
}

.selected-date-section h2,
.no-date-debts h2,
section h2 {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
}

.section-subtitle {
  margin: 4px 0 12px;
  color: #999;
  font-size: 12px;
}

.no-date-debts {
  padding: 20px 4px 28px;
}

.no-date-debts p {
  margin-top: 6px;
  color: #999;
  font-size: 13px;
}

section {
  margin-bottom: 28px;
}

section h2 {
  margin-bottom: 12px;
}

.debt-card {
  position: relative;

  display: flex;
  align-items: center;
  gap: 12px;

  padding: 14px;
  margin-bottom: 10px;

  background: white;
  border: 1px solid #eeeeee;
  border-radius: 16px;

  cursor: pointer;
}

.status-indicator {
  width: 4px;
  height: 44px;

  position: absolute;
  left: 0;

  border-radius: 0 4px 4px 0;
}

.status-indicator.overdue {
  background: #dc3545;
}

.status-indicator.soon {
  background: #f59f00;
}

.status-indicator.later {
  background: #0d6efd;
}

.status-indicator.completed {
  background: #198754;
}

.date-box {
  width: 48px;
  min-width: 48px;

  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 8px 4px;

  border-radius: 12px;
  background: #f3f3f3;
}

.date-box strong {
  font-size: 20px;
  line-height: 1;
}

.date-box span {
  margin-top: 4px;
  font-size: 9px;
  font-weight: 700;
  color: #777;
}

.debt-info {
  flex: 1;
  min-width: 0;

  display: flex;
  flex-direction: column;
  gap: 3px;
}

.debt-info strong {
  font-size: 15px;
}

.debt-info span {
  font-size: 12px;
  color: #777;
}

.debt-info small {
  font-size: 11px;
  color: #999;
}

.amount {
  font-size: 14px;
  white-space: nowrap;
}

.details-container {
  padding: 24px 16px 40px;
}

.details-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.details-header h2 {
  margin: 0;
  font-size: 24px;
}

.details-header p {
  margin: 4px 0 0;
  color: #777;
}

.large-status-indicator {
  width: 12px;
  height: 48px;
  border-radius: 8px;
}

.large-status-indicator.overdue {
  background: #dc3545;
}

.large-status-indicator.soon {
  background: #f59f00;
}

.large-status-indicator.later {
  background: #0d6efd;
}

.large-status-indicator.completed {
  background: #198754;
}

.balance-box {
  display: flex;
  flex-direction: column;
  gap: 6px;

  padding: 20px;
  margin-bottom: 20px;

  border-radius: 18px;

  background: #171717;
  color: white;
}

.balance-box span {
  font-size: 13px;
  opacity: 0.7;
}

.balance-box strong {
  font-size: 28px;
}

.details-list {
  border: 1px solid #eeeeee;
  border-radius: 16px;
  overflow: hidden;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;

  padding: 14px 16px;

  border-bottom: 1px solid #eeeeee;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row span {
  color: #777;
  font-size: 13px;
}

.detail-row strong {
  font-size: 13px;
  text-align: right;
}

.notes-box {
  margin-top: 20px;
  padding: 16px;

  border-radius: 16px;
  background: #f7f7f7;
}

.notes-box span {
  font-size: 12px;
  color: #777;
}

.notes-box p {
  margin: 6px 0 0;
  font-size: 14px;
}

.payment-history {
  margin-top: 28px;
}

.payment-history h3 {
  margin-bottom: 12px;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;

  padding: 12px 0;

  border-bottom: 1px solid #eeeeee;
}

.payment-row div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.payment-row strong {
  font-size: 14px;
}

.payment-row small,
.payment-row > span {
  font-size: 11px;
  color: #777;
}
</style>

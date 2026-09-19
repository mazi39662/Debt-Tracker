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
        <!-- ! Calendar section -->
        <section class="calendar-section">
          <div class="section-heading">
            <div>
              <span class="eyebrow">PAYMENT SCHEDULE</span>
              <h1>When are you paying?</h1>
            </div>

            <button class="today-button" type="button" @click="goToToday">
              Today
            </button>
          </div>

          <!-- ! Themed calendar -->
          <div class="calendar-card">
            <div class="calendar-top-bar">
              <div class="calendar-month-label">
                <div class="calendar-icon">
                  <ion-icon :icon="calendarOutline" />
                </div>

                <div>
                  <span>YOUR SCHEDULE</span>
                  <strong>{{ selectedMonthLabel }}</strong>
                </div>
              </div>

              <div class="calendar-badge">
                <span>{{ scheduledDebts.length }}</span>
                <small>scheduled</small>
              </div>
            </div>

            <div class="calendar-divider" />

            <ion-datetime
              v-model="selectedDate"
              presentation="date"
              :highlighted-dates="highlightedDates"
              :show-default-buttons="false"
              @ionChange="handleDateChange"
            />

            <div class="calendar-footer">
              <div class="calendar-status">
                <span class="calendar-status-dot" />
                <span>Tap a date to view payments</span>
              </div>
            </div>
          </div>

          <!-- ! Calendar legend -->
          <div class="legend">
            <div class="legend-item">
              <span class="legend-dot overdue" />
              <span>Overdue</span>
            </div>

            <div class="legend-item">
              <span class="legend-dot soon" />
              <span>Due soon</span>
            </div>

            <div class="legend-item">
              <span class="legend-dot later" />
              <span>Later</span>
            </div>

            <div class="legend-item">
              <span class="legend-dot completed" />
              <span>Completed</span>
            </div>
          </div>
        </section>

        <!-- ! Selected date -->
        <section class="selected-date-section">
          <div class="date-heading">
            <div>
              <span class="eyebrow">
                {{ selectedDateDebts.length > 0 ? "SCHEDULED" : "NO PAYMENTS" }}
              </span>

              <h2>
                {{ formatLongDate(selectedDate) }}
              </h2>
            </div>

            <div v-if="selectedDateDebts.length > 0" class="payment-count">
              {{ selectedDateDebts.length }}
              {{ selectedDateDebts.length === 1 ? "payment" : "payments" }}
            </div>
          </div>

          <!-- ! Selected date debts -->
          <div v-if="selectedDateDebts.length > 0" class="debt-list">
            <div
              v-for="debt in selectedDateDebts"
              :key="debt.id"
              class="debt-card"
              @click="openDebtDetails(debt)"
            >
              <div class="status-indicator" :class="getDebtColorClass(debt)" />

              <div class="date-box" :class="getDebtColorClass(debt)">
                <strong>
                  {{ getDay(debt.dueDate!) }}
                </strong>

                <span>
                  {{ getMonth(debt.dueDate!) }}
                </span>
              </div>

              <div class="debt-info">
                <div class="debt-title-row">
                  <strong>{{ debt.name }}</strong>

                  <ion-icon
                    :icon="chevronForwardOutline"
                    class="card-chevron"
                  />
                </div>

                <span>
                  {{ debt.person || "No person" }}
                </span>

                <small :class="getDebtColorClass(debt)">
                  {{ getDebtStatusText(debt) }}
                </small>
              </div>

              <div class="amount-container">
                <strong class="amount">
                  {{ formatCurrency(debt.remainingAmount) }}
                </strong>

                <span>remaining</span>
              </div>
            </div>
          </div>

          <!-- ! Empty selected date -->
          <div v-else class="empty-date-card">
            <div class="empty-date-icon">
              <ion-icon :icon="calendarOutline" />
            </div>

            <div>
              <strong>No payments scheduled</strong>
              <p>Nothing is due on this date.</p>
            </div>
          </div>
        </section>

        <!-- ! Upcoming -->
        <section v-if="upcomingDebts.length > 0" class="schedule-section">
          <div class="section-title-row">
            <div>
              <span class="eyebrow">NEXT 7 DAYS</span>
              <h2>Upcoming</h2>
            </div>

            <span class="section-count">
              {{ upcomingDebts.length }}
            </span>
          </div>

          <div class="debt-list">
            <div
              v-for="debt in upcomingDebts"
              :key="debt.id"
              class="debt-card"
              @click="openDebtDetails(debt)"
            >
              <div class="status-indicator" :class="getDebtColorClass(debt)" />

              <div class="date-box" :class="getDebtColorClass(debt)">
                <strong>
                  {{ getDay(debt.dueDate!) }}
                </strong>

                <span>
                  {{ getMonth(debt.dueDate!) }}
                </span>
              </div>

              <div class="debt-info">
                <div class="debt-title-row">
                  <strong>{{ debt.name }}</strong>

                  <ion-icon
                    :icon="chevronForwardOutline"
                    class="card-chevron"
                  />
                </div>

                <span>
                  {{ debt.person || "No person" }}
                </span>

                <small> Due {{ formatDate(debt.dueDate!) }} </small>
              </div>

              <div class="amount-container">
                <strong class="amount">
                  {{ formatCurrency(debt.remainingAmount) }}
                </strong>

                <span>remaining</span>
              </div>
            </div>
          </div>
        </section>

        <!-- ! Later -->
        <section v-if="laterDebts.length > 0" class="schedule-section">
          <div class="section-title-row">
            <div>
              <span class="eyebrow">7+ DAYS AWAY</span>
              <h2>Later</h2>
            </div>

            <span class="section-count">
              {{ laterDebts.length }}
            </span>
          </div>

          <div class="debt-list">
            <div
              v-for="debt in laterDebts"
              :key="debt.id"
              class="debt-card"
              @click="openDebtDetails(debt)"
            >
              <div class="status-indicator" :class="getDebtColorClass(debt)" />

              <div class="date-box" :class="getDebtColorClass(debt)">
                <strong>
                  {{ getDay(debt.dueDate!) }}
                </strong>

                <span>
                  {{ getMonth(debt.dueDate!) }}
                </span>
              </div>

              <div class="debt-info">
                <div class="debt-title-row">
                  <strong>{{ debt.name }}</strong>

                  <ion-icon
                    :icon="chevronForwardOutline"
                    class="card-chevron"
                  />
                </div>

                <span>
                  {{ debt.person || "No person" }}
                </span>

                <small> Due {{ formatDate(debt.dueDate!) }} </small>
              </div>

              <div class="amount-container">
                <strong class="amount">
                  {{ formatCurrency(debt.remainingAmount) }}
                </strong>

                <span>remaining</span>
              </div>
            </div>
          </div>
        </section>

        <!-- ! No scheduled debts -->
        <div v-if="scheduledDebts.length === 0" class="empty-calendar-state">
          <div class="empty-calendar-icon">
            <ion-icon :icon="calendarOutline" />
          </div>

          <h2>No scheduled payments</h2>

          <p>Debts with due dates will appear on your calendar.</p>
        </div>
      </div>
    </ion-content>

    <!-- ! Debt details modal -->
    <ion-modal :is-open="showDetailsModal" @didDismiss="closeDebtDetails">
      <ion-header>
        <ion-toolbar>
          <ion-title>Debt Details</ion-title>

          <ion-buttons slot="end">
            <ion-button @click="closeDebtDetails"> Close </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <div v-if="selectedDebt" class="details-container">
          <!-- ! Debt header -->
          <div class="details-header">
            <div
              class="large-status-indicator"
              :class="getDebtColorClass(selectedDebt)"
            />

            <div>
              <span class="eyebrow">
                {{ getDebtStatusText(selectedDebt) }}
              </span>

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
            <span>Remaining Balance</span>

            <strong>
              {{ formatCurrency(selectedDebt.remainingAmount) }}
            </strong>

            <div class="balance-progress">
              <div
                class="balance-progress-fill"
                :style="{
                  width: `${getPaymentProgress(selectedDebt)}%`,
                }"
              />
            </div>

            <small> {{ getPaymentProgress(selectedDebt) }}% paid </small>
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
                {{
                  selectedDebt.status === "completed" ? "Completed" : "Active"
                }}
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
            <div class="payment-history-heading">
              <div>
                <span class="eyebrow">TRANSACTIONS</span>
                <h3>Payment History</h3>
              </div>

              <span class="history-count">
                {{ selectedDebt.payments.length }}
              </span>
            </div>

            <div
              v-for="payment in selectedDebt.payments"
              :key="payment.id"
              class="payment-row"
            >
              <div class="payment-row-icon">
                <ion-icon :icon="checkmarkOutline" />
              </div>

              <div class="payment-row-info">
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
  IonModal,
  IonButtons,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/vue";

import {
  calendarOutline,
  chevronForwardOutline,
  checkmarkOutline,
} from "ionicons/icons";

import { useDebtStore } from "@/stores/debt.store";
import type { Debt } from "@/models/debt";

// ! Access the debt store.
const debtStore = useDebtStore();

// ! Selected calendar date.
const selectedDate = ref(new Date().toISOString());

// ! Selected debt for details.
const selectedDebt = ref<Debt | null>(null);

// ! Controls details modal visibility.
const showDetailsModal = ref(false);

// ! Load saved debts.
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

// ! Get all debts with due dates.
const scheduledDebts = computed(() => {
  return debtStore.debts
    .filter((debt: Debt) => !!debt.dueDate)
    .sort(
      (a: Debt, b: Debt) =>
        new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime(),
    );
});

// ! Current calendar month label.
const selectedMonthLabel = computed(() => {
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    year: "numeric",
  }).format(new Date(selectedDate.value));
});

// ! Debts scheduled for selected date.
const selectedDateDebts = computed(() => {
  const selected = getDateKey(selectedDate.value);

  return scheduledDebts.value.filter(
    (debt: Debt) => getDateKey(debt.dueDate!) === selected,
  );
});

// ! Upcoming debts within the next 7 days.
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

// ! Debts due after the next 7 days.
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

// ! Generate calendar highlighted dates.
const highlightedDates = computed(() => {
  return scheduledDebts.value.map((debt: Debt) => ({
    date: getDateKey(debt.dueDate!),
    textColor: getCalendarColor(debt),
  }));
});

// ! Handle calendar date selection.
function handleDateChange(event: CustomEvent): void {
  if (event.detail.value) {
    selectedDate.value = event.detail.value;
  }
}

// ! Jump calendar back to today.
function goToToday(): void {
  selectedDate.value = new Date().toISOString();
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

// ! Determine debt status color.
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

// ! Get calendar text color.
function getCalendarColor(debt: Debt): string {
  const type = getDebtColorClass(debt);

  if (type === "overdue") {
    return "#DC3545";
  }

  if (type === "soon") {
    return "#F59E0B";
  }

  if (type === "later") {
    return "#2563EB";
  }

  if (type === "completed") {
    return "#10B981";
  }

  return "#737373";
}

// ! Get readable status text.
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

// ! Get YYYY-MM-DD date key.
function getDateKey(date: string): string {
  const value = new Date(date);

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ! Start a date at midnight.
function startOfDay(date: Date): Date {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
}

// ! Calculate how much of the debt has been paid.
function getPaymentProgress(debt: Debt): number {
  if (debt.originalAmount <= 0) {
    return 0;
  }

  const paid = debt.originalAmount - debt.remainingAmount;

  return Math.min(
    100,
    Math.max(0, Math.round((paid / debt.originalAmount) * 100)),
  );
}

// ! Format currency.
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

// ! Format short date.
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

// ! Get month abbreviation.
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
ion-content {
  --background: var(--app-background);
}

/* ! ============================= */
/* ! PAGE */
/* ! ============================= */

.page-container {
  padding: 16px 16px 100px;
}

/* ! ============================= */
/* ! HEADINGS */
/* ! ============================= */

.calendar-section {
  margin-bottom: 30px;
}

.section-heading,
.date-heading,
.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-heading {
  margin-bottom: 12px;
}

.eyebrow {
  display: block;
  margin-bottom: 4px;
  color: var(--app-sage-dark);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.section-heading h1,
.date-heading h2,
.section-title-row h2 {
  margin: 0;
  color: var(--app-text);
  font-weight: 800;
}

.section-heading h1 {
  color: var(--app-sage-dark);
  font-size: 21px;
}

.date-heading h2,
.section-title-row h2 {
  font-size: 19px;
}

/* ! ============================= */
/* ! TODAY BUTTON */
/* ! ============================= */

.today-button {
  height: 34px;
  padding: 0 13px;
  border: 1px solid var(--app-border);
  border-radius: 10px;
  background: var(--app-surface);
  color: var(--app-sage-dark);
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.15s ease;
}

.today-button:active {
  transform: scale(0.96);
  background: var(--app-sage-light);
}

/* ! ============================= */
/* ! MAIN CALENDAR */
/* ! NOTE: Calendar intentionally stays LIGHT in dark mode */
/* ! ============================= */

.calendar-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #d9e7b5;
  border-radius: 22px;
  background: linear-gradient(180deg, #fbfff4 0%, #ffffff 52%, #ffffff 100%);
  box-shadow:
    0 8px 30px rgba(63, 98, 18, 0.08),
    0 1px 3px rgba(31, 41, 55, 0.04);
}

.calendar-card::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, #3f6212, #84cc16, #a3e635);
}

/* ! Calendar header */

.calendar-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 17px 17px 14px;
}

.calendar-month-label {
  display: flex;
  align-items: center;
  gap: 10px;
}

.calendar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border: 1px solid #d9e7b5;
  border-radius: 11px;
  background: var(--app-sage-light);
}

.calendar-icon ion-icon {
  color: var(--app-sage-dark);
  font-size: 19px;
}

.calendar-month-label span {
  display: block;
  margin-bottom: 2px;
  color: var(--app-text-muted);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1px;
}

.calendar-month-label strong {
  display: block;
  color: var(--app-text);
  font-size: 14px;
  font-weight: 800;
}

.calendar-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  min-height: 40px;
  padding: 5px 8px;
  border: 1px solid #d9e7b5;
  border-radius: 11px;
  background: #f7fee7;
}

.calendar-badge span {
  color: var(--app-sage-dark);
  font-size: 15px;
  font-weight: 900;
  line-height: 1;
}

.calendar-badge small {
  margin-top: 3px;
  color: var(--app-text-muted);
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.calendar-divider {
  height: 1px;
  margin: 0 15px;
  background: #e8eedc;
}

/* ! ============================= */
/* ! IONIC CALENDAR */
/* ! ============================= */

.calendar-card ion-datetime {
  width: 100%;
  padding: 8px 8px 2px;
  --background: transparent;
  --title-color: var(--app-text);
  --wheel-highlight-background: var(--app-sage-light);
  --wheel-fade-background-rgb: 255, 255, 255;
  --ion-color-primary: var(--app-sage-dark);
  --ion-color-primary-rgb: 63, 98, 18;
  color: black;
}

/* ! ============================= */
/* ! CALENDAR FOOTER */
/* ! ============================= */

.calendar-footer {
  margin: 0 14px 12px;
  padding: 9px 11px;
  border: 1px solid #e8eedc;
  border-radius: 10px;
  background: #fafdf4;
}

.calendar-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: var(--app-text-muted);
  font-size: 9px;
  font-weight: 600;
}

.calendar-status-dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--app-sage);
  box-shadow: 0 0 0 3px var(--app-sage-light);
}

/* ! ============================= */
/* ! LEGEND */
/* ! ============================= */

.legend {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 14px;
  margin-top: 10px;
  padding: 13px 14px;
  border: 1px solid var(--app-border);
  border-radius: 14px;
  background: var(--app-surface);
  box-shadow: 0 3px 12px rgba(31, 41, 55, 0.03);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 600;
}

.legend-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
}

.legend-dot.overdue {
  background: var(--ion-color-danger);
  box-shadow: 0 0 0 3px #fee2e2;
}

.legend-dot.soon {
  background: var(--ion-color-warning);
  box-shadow: 0 0 0 3px #fef3c7;
}

.legend-dot.later {
  background: var(--ion-color-info);
  box-shadow: 0 0 0 3px #dbeafe;
}

.legend-dot.completed {
  background: var(--ion-color-success);
  box-shadow: 0 0 0 3px #d1fae5;
}

/* ! ============================= */
/* ! SELECTED DATE */
/* ! ============================= */

.selected-date-section {
  margin-bottom: 30px;
}

.date-heading {
  margin-bottom: 12px;
}

.payment-count,
.section-count,
.history-count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  padding: 0 8px;
  border-radius: 8px;
  background: var(--app-sage-light);
  color: var(--app-sage-dark);
  font-size: 10px;
  font-weight: 800;
}

/* ! ============================= */
/* ! DEBT LIST */
/* ! ============================= */

.debt-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.debt-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 76px;
  padding: 12px 13px 12px 14px;
  overflow: hidden;
  border: 1px solid var(--app-border);
  border-radius: 16px;
  background: var(--app-surface);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.debt-card:active {
  transform: scale(0.985);
  box-shadow: 0 5px 16px rgba(31, 41, 55, 0.07);
}

/* ! Status indicator */

.status-indicator {
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 0;
  width: 4px;
  border-radius: 0 4px 4px 0;
}

.status-indicator.overdue {
  background: var(--ion-color-danger);
}

.status-indicator.soon {
  background: var(--ion-color-warning);
}

.status-indicator.later {
  background: var(--ion-color-info);
}

.status-indicator.completed {
  background: var(--ion-color-success);
}

/* ! ============================= */
/* ! DATE BOX */
/* ! ============================= */

.date-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 46px;
  min-width: 46px;
  height: 50px;
  border-radius: 12px;
  background: var(--app-surface-soft);
}

.date-box strong {
  font-size: 19px;
  line-height: 1;
}

.date-box span {
  margin-top: 4px;
  color: var(--app-text-muted);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.date-box.overdue {
  background: #fef2f2;
  color: var(--ion-color-danger);
}

.date-box.soon {
  background: #fffbeb;
  color: var(--ion-color-warning);
}

.date-box.later {
  background: #eff6ff;
  color: var(--ion-color-info);
}

.date-box.completed {
  background: #ecfdf5;
  color: var(--ion-color-success);
}

/* ! ============================= */
/* ! DEBT INFO */
/* ! ============================= */

.debt-info {
  flex: 1;
  min-width: 0;
}

.debt-title-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.debt-info strong {
  min-width: 0;
  overflow: hidden;
  color: var(--app-text);
  font-size: 14px;
  font-weight: 750;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.debt-info > span {
  display: block;
  margin-top: 3px;
  overflow: hidden;
  color: var(--app-text-muted);
  font-size: 11px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.debt-info small {
  display: block;
  margin-top: 4px;
  color: var(--app-text-muted);
  font-size: 10px;
}

.debt-info small.overdue {
  color: var(--ion-color-danger);
  font-weight: 700;
}

.debt-info small.soon {
  color: var(--ion-color-warning);
  font-weight: 700;
}

.debt-info small.completed {
  color: var(--ion-color-success);
  font-weight: 700;
}

.card-chevron {
  flex-shrink: 0;
  color: var(--app-text-muted);
  font-size: 15px;
}

/* ! ============================= */
/* ! AMOUNT */
/* ! ============================= */

.amount-container {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: flex-end;
}

.amount {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.amount-container span {
  margin-top: 3px;
  color: var(--app-text-muted);
  font-size: 9px;
}

/* ! ============================= */
/* ! EMPTY SELECTED DATE */
/* ! ============================= */

.empty-date-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 17px;
  border: 1px dashed var(--app-border);
  border-radius: 16px;
  background: var(--app-surface);
}

.empty-date-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 12px;
  background: var(--app-surface-soft);
}

.empty-date-icon ion-icon {
  color: var(--app-text-muted);
  font-size: 20px;
}

.empty-date-card strong {
  display: block;
  color: var(--app-text);
  font-size: 13px;
}

.empty-date-card p {
  margin: 3px 0 0;
  color: var(--app-text-muted);
  font-size: 11px;
}

/* ! ============================= */
/* ! UPCOMING / LATER */
/* ! ============================= */

.schedule-section {
  margin-bottom: 30px;
}

.section-title-row {
  align-items: center;
  margin-bottom: 12px;
}

/* ! ============================= */
/* ! EMPTY CALENDAR */
/* ! ============================= */

.empty-calendar-state {
  margin-top: 20px;
  padding: 34px 20px;
  text-align: center;
  border: 1px dashed var(--app-border);
  border-radius: 18px;
  background: var(--app-surface);
}

.empty-calendar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  margin: 0 auto 12px;
  border-radius: 16px;
  background: var(--app-surface-soft);
}

.empty-calendar-icon ion-icon {
  color: var(--app-text-muted);
  font-size: 26px;
}

.empty-calendar-state h2 {
  margin: 0;
  color: var(--app-text);
  font-size: 17px;
}

.empty-calendar-state p {
  max-width: 260px;
  margin: 6px auto 0;
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.5;
}

/* ! ============================= */
/* ! DETAILS MODAL */
/* ! ============================= */

ion-modal {
  --background: var(--app-surface);
}

ion-modal ion-toolbar {
  --background: var(--app-surface);
  --color: var(--app-text);
}

ion-modal ion-content {
  --background: var(--app-background);
}

.details-container {
  padding: 24px 16px 40px;
}

.details-header {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 22px;
}

.large-status-indicator {
  width: 6px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 6px;
}

.large-status-indicator.overdue {
  background: var(--ion-color-danger);
}

.large-status-indicator.soon {
  background: var(--ion-color-warning);
}

.large-status-indicator.later {
  background: var(--ion-color-info);
}

.large-status-indicator.completed {
  background: var(--ion-color-success);
}

.details-header h2 {
  margin: 0;
  color: var(--app-text);
  font-size: 23px;
  font-weight: 800;
}

.details-header p {
  margin: 4px 0 0;
  color: var(--app-text-muted);
  font-size: 13px;
}

/* ! ============================= */
/* ! BALANCE BOX */
/* ! ============================= */

.balance-box {
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 18px;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  color: #ffffff;
  box-shadow: 0 8px 20px rgba(31, 41, 55, 0.12);
}

.balance-box > span {
  display: block;
  margin-bottom: 5px;
  font-size: 12px;
  opacity: 0.7;
}

.balance-box > strong {
  display: block;
  font-size: 28px;
  font-weight: 800;
}

.balance-progress {
  height: 5px;
  margin-top: 16px;
  overflow: hidden;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
}

.balance-progress-fill {
  height: 100%;
  border-radius: inherit;
  background: #84cc16;
}

.balance-box small {
  display: block;
  margin-top: 7px;
  font-size: 10px;
  opacity: 0.65;
}

/* ! ============================= */
/* ! DETAILS LIST */
/* ! ============================= */

.details-list {
  overflow: hidden;
  border: 1px solid var(--app-border);
  border-radius: 16px;
  background: var(--app-surface);
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 15px;
  border-bottom: 1px solid var(--app-border);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row span {
  color: var(--app-text-muted);
  font-size: 12px;
}

.detail-row strong {
  color: var(--app-text);
  font-size: 12px;
  text-align: right;
}

/* ! ============================= */
/* ! NOTES */
/* ! ============================= */

.notes-box {
  margin-top: 18px;
  padding: 15px;
  border-radius: 15px;
  background: var(--app-surface-soft);
}

.notes-box span {
  color: var(--app-text-muted);
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.notes-box p {
  margin: 6px 0 0;
  color: var(--app-text);
  font-size: 13px;
  line-height: 1.5;
}

/* ! ============================= */
/* ! PAYMENT HISTORY */
/* ! ============================= */

.payment-history {
  margin-top: 26px;
}

.payment-history-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.payment-history h3 {
  margin: 0;
  color: var(--app-text);
  font-size: 17px;
  font-weight: 800;
}

.payment-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid var(--app-border);
}

.payment-row:last-child {
  border-bottom: none;
}

.payment-row-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 10px;
  background: var(--app-success-soft);
}

.payment-row-icon ion-icon {
  color: var(--ion-color-success);
  font-size: 16px;
}

.payment-row-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.payment-row-info strong {
  color: var(--app-text);
  font-size: 13px;
}

.payment-row-info small,
.payment-row > span {
  color: var(--app-text-muted);
  font-size: 10px;
}

.payment-row > span {
  max-width: 110px;
  overflow: hidden;
  text-align: right;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ! ================================================= */
/* ! DARK MODE */
/* ! Calendar follows the app dark theme */
/* ! ================================================= */

:global(html.dark) .calendar-card {
  border-color: #30392d;
  background: linear-gradient(180deg, #1c251b 0%, #171d17 52%, #171d17 100%);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

:global(html.dark) .calendar-card::before {
  background: linear-gradient(90deg, #84cc16, #a3e635, #bef264);
}

:global(html.dark) .calendar-top-bar,
:global(html.dark) .calendar-footer,
:global(html.dark) .calendar-badge,
:global(html.dark) .calendar-icon,
:global(html.dark) .calendar-divider {
  border-color: #30392d;
}

:global(html.dark) .calendar-icon,
:global(html.dark) .calendar-badge {
  background: #252e24;
}

:global(html.dark) .calendar-badge small,
:global(html.dark) .calendar-month-label span,
:global(html.dark) .calendar-status,
:global(html.dark) .calendar-month-label strong,
:global(html.dark) .calendar-status-dot {
  color: var(--app-text);
}

:global(html.dark) .calendar-footer {
  border-color: #30392d;
  background: #171d17;
}

:global(html.dark) .calendar-status {
  color: var(--app-text-muted);
}

/* ! ============================= */
/* ! DARK LEGEND */
/* ! ============================= */

:global(html.dark) .legend {
  background: #1a2118;
  border-color: #30392d;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.18);
}

:global(html.dark) .legend-item {
  color: #a8b0a3;
}

:global(html.dark) .legend-dot.overdue {
  box-shadow: 0 0 0 3px #3a2020;
}

:global(html.dark) .legend-dot.soon {
  box-shadow: 0 0 0 3px #3d3218;
}

:global(html.dark) .legend-dot.later {
  box-shadow: 0 0 0 3px #1e3048;
}

:global(html.dark) .legend-dot.completed {
  box-shadow: 0 0 0 3px #153c2e;
}

/* ! ============================= */
/* ! DARK DATE BOXES */
/* ! ============================= */

:global(html.dark) .date-box {
  background: #252e24;
}

:global(html.dark) .date-box.overdue {
  background: #3a2020;
}

:global(html.dark) .date-box.soon {
  background: #3d3218;
}

:global(html.dark) .date-box.later {
  background: #1e3048;
}

:global(html.dark) .date-box.completed {
  background: #153c2e;
}

/* ! ============================= */
/* ! DARK DEBT CARDS */
/* ! ============================= */

:global(html.dark) .debt-card {
  background: #1a2118;
  border-color: #30392d;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

:global(html.dark) .debt-card:active {
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.25);
}

/* ! ============================= */
/* ! DARK EMPTY STATES */
/* ! ============================= */

:global(html.dark) .empty-date-card,
:global(html.dark) .empty-calendar-state {
  background: #1a2118;
  border-color: #30392d;
}

:global(html.dark) .empty-date-icon,
:global(html.dark) .empty-calendar-icon {
  background: #252e24;
}

/* ! ============================= */
/* ! DARK BALANCE */
/* ! ============================= */

:global(html.dark) .balance-box {
  background: linear-gradient(135deg, #202820 0%, #293329 100%);
  border: 1px solid #34402f;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

:global(html.dark) .balance-progress {
  background: rgba(255, 255, 255, 0.12);
}

:global(html.dark) .balance-progress-fill {
  background: #a3e635;
}

/* ! ============================= */
/* ! DARK DETAILS */
/* ! ============================= */

:global(html.dark) .details-list {
  background: #1a2118;
  border-color: #30392d;
}

:global(html.dark) .detail-row {
  border-color: #30392d;
}

:global(html.dark) .notes-box {
  background: #252e24;
}

/* ! ============================= */
/* ! DARK PAYMENT HISTORY */
/* ! ============================= */

:global(html.dark) .payment-row {
  border-color: #30392d;
}

/* ! ============================= */
/* ! SMALL SCREENS */
/* ! ============================= */

@media (max-width: 360px) {
  .page-container {
    padding-right: 12px;
    padding-left: 12px;
  }

  .calendar-top-bar {
    padding-right: 13px;
    padding-left: 13px;
  }

  .calendar-icon {
    width: 34px;
    height: 34px;
  }

  .calendar-month-label strong {
    font-size: 13px;
  }

  .debt-card {
    gap: 8px;
    padding-right: 10px;
    padding-left: 12px;
  }

  .date-box {
    width: 42px;
    min-width: 42px;
  }

  .amount {
    font-size: 12px;
  }
}
</style>

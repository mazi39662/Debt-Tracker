<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Debt Tracker</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="home-container">
        <!-- Header / Welcome -->
        <section class="welcome-section">
          <p class="eyebrow">YOUR DEBT</p>

          <h1>Stay on track.</h1>

          <p class="subtitle">Keep paying. Watch it disappear.</p>
        </section>

        <!-- Debt Meter -->
        <ion-card class="debt-meter-card">
          <ion-card-content>
            <div class="meter-header">
              <div>
                <p class="meter-label">REMAINING DEBT</p>

                <h2>
                  {{ formatCurrency(totalDebt) }}
                </h2>
              </div>

              <div class="meter-icon">
                <ion-icon :icon="walletOutline" />
              </div>
            </div>

            <div class="meter-container">
              <div
                class="meter-fill"
                :style="{ width: `${remainingPercentage}%` }"
              ></div>
            </div>

            <div class="meter-footer">
              <span> {{ Math.round(paidPercentage) }}% paid </span>

              <span> {{ Math.round(remainingPercentage) }}% remaining </span>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Summary -->
        <section class="summary-section">
          <div class="summary-card">
            <div class="summary-icon owe">
              <ion-icon :icon="arrowForward" />
            </div>

            <p>I OWE</p>

            <h3>
              {{ formatCurrency(totalOwed) }}
            </h3>
          </div>

          <div class="summary-card">
            <div class="summary-icon owed">
              <ion-icon :icon="arrowForward" />
            </div>

            <p>OWED TO ME</p>

            <h3>
              {{ formatCurrency(totalOwedToMe) }}
            </h3>
          </div>
        </section>

        <!-- Add Debt -->
        <ion-button @click="openAddDebt" expand="block" class="add-debt-button">
          <ion-icon slot="start" :icon="add" />

          Add Debt
        </ion-button>

        <!-- Upcoming Payments -->
        <section class="section">
          <div class="section-header">
            <div>
              <p class="section-eyebrow">UPCOMING</p>

              <h2>Next payments</h2>
            </div>

            <ion-icon :icon="calendarOutline" />
          </div>

          <!-- Upcoming debt list -->
          <div v-if="upcomingDebts.length > 0" class="upcoming-list">
            <div
              v-for="debt in upcomingDebts"
              :key="debt.id"
              class="upcoming-card"
            >
              <div class="upcoming-info">
                <h3>{{ debt.name }}</h3>

                <p>
                  {{ debt.person || "No person specified" }}
                </p>

                <span>
                  {{ formatDate(debt.dueDate) }}
                </span>
              </div>

              <strong>
                {{ formatCurrency(debt.remainingAmount) }}
              </strong>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="empty-state">
            <ion-icon :icon="checkmarkCircle" />

            <h3>No upcoming payments</h3>

            <p>You're all caught up for now.</p>
          </div>
        </section>

        <!-- Recent Activity -->
        <section class="section">
          <div class="section-header">
            <div>
              <p class="section-eyebrow">ACTIVITY</p>

              <h2>Recent payments</h2>
            </div>
          </div>

          <div class="empty-state">
            <ion-icon :icon="walletOutline" />

            <h3>No payments yet</h3>

            <p>Your payment activity will appear here.</p>
          </div>
        </section>
      </div>
    </ion-content>
    <AddDebtModal :is-open="showAddDebt" @close="closeAddDebt" />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
} from "@ionic/vue";

import {
  add,
  arrowForward,
  calendarOutline,
  checkmarkCircle,
  walletOutline,
} from "ionicons/icons";

import { useDebtStore } from "@/stores/debt.store";
import type { Debt } from "@/models/debt";
import { useRouter } from "vue-router";

// !  Components
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

const debtStore = useDebtStore();

onMounted(() => {
  debtStore.loadDebts();
});

const router = useRouter();

function goToDebts(): void {
  router.push("/tabs/debts");
}

function goToCalendar(): void {
  router.push("/tabs/calendar");
}

/**
 * ! Total amount the user currently owes.
 */
const totalOwed = computed<number>(() => {
  return debtStore.debts
    .filter(
      (debt: Debt) => debt.direction === "owe" && debt.status === "active",
    )
    .reduce((total: number, debt: Debt) => total + debt.remainingAmount, 0);
});

/**
 * ! Total amount other people owe the user.
 */
const totalOwedToMe = computed<number>(() => {
  return debtStore.debts
    .filter(
      (debt: Debt) =>
        debt.direction === "owed_to_me" && debt.status === "active",
    )
    .reduce((total: number, debt: Debt) => total + debt.remainingAmount, 0);
});

/**
 * ! Total active debt the user owes.
 */
const totalDebt = computed<number>(() => {
  return totalOwed.value;
});

/**
 * ! Original amount of all debts.
 */
const totalOriginalDebt = computed<number>(() => {
  return debtStore.debts
    .filter((debt: Debt) => debt.direction === "owe")
    .reduce((total: number, debt: Debt) => total + debt.originalAmount, 0);
});

/**
 * ! Percentage of debt already paid.
 */
const paidPercentage = computed<number>(() => {
  if (totalOriginalDebt.value <= 0) {
    return 0;
  }

  const paid = totalOriginalDebt.value - totalDebt.value;

  return Math.min(100, Math.max(0, (paid / totalOriginalDebt.value) * 100));
});

/**
 * ! Percentage of debt still remaining.
 */
const remainingPercentage = computed<number>(() => {
  if (totalOriginalDebt.value <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, (totalDebt.value / totalOriginalDebt.value) * 100),
  );
});

/**
 * ! Get the next three upcoming debts.
 */
const upcomingDebts = computed<Debt[]>(() => {
  return debtStore.debts
    .filter(
      (debt: Debt) =>
        debt.status === "active" && debt.direction === "owe" && !!debt.dueDate,
    )
    .sort(
      (a: Debt, b: Debt) =>
        new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime(),
    )
    .slice(0, 3);
});

/**
 * ! Format number as Philippine Peso.
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * ! Format date for display.
 */
function formatDate(date?: string): string {
  if (!date) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}
</script>

<style scoped>
.home-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 24px 16px 40px;
}

.welcome-section {
  margin-bottom: 24px;
}

.eyebrow,
.section-eyebrow,
.meter-label {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #777;
}

.welcome-section h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  color: #171717;
}

.subtitle {
  margin: 6px 0 0;
  color: #777;
  font-size: 15px;
}

.debt-meter-card {
  margin: 0 0 16px;
  border-radius: 24px;
  background: #171717;
  color: white;
  box-shadow: none;
}

.debt-meter-card ion-card-content {
  padding: 22px;
}

.meter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meter-header h2 {
  margin: 4px 0 0;
  font-size: 30px;
  font-weight: 800;
}

.meter-label {
  color: #aaa;
}

.meter-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 21px;
}

.meter-container {
  height: 12px;
  margin-top: 28px;
  overflow: hidden;
  border-radius: 999px;
  background: #333;
}

.meter-fill {
  height: 100%;
  border-radius: inherit;
  background: #f5c542;
  transition: width 0.4s ease;
}

.meter-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  color: #aaa;
  font-size: 12px;
}

.summary-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.summary-card {
  padding: 18px;
  border-radius: 20px;
  background: white;
  border: 1px solid #eee;
}

.summary-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  border-radius: 10px;
  background: #f5f5f5;
}

.summary-icon ion-icon {
  font-size: 18px;
}

.summary-card p {
  margin: 0 0 5px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #888;
}

.summary-card h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
}

.add-debt-button {
  --border-radius: 16px;
  --background: #171717;
  --background-activated: #333;
  height: 52px;
  margin: 0 0 30px;
  font-weight: 700;
}

.section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-header h2 {
  margin: 0;
  font-size: 21px;
  font-weight: 800;
  color: #171717;
}

.section-header > ion-icon {
  font-size: 22px;
  color: #777;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upcoming-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 18px;
  background: white;
  border: 1px solid #eee;
}

.upcoming-info {
  min-width: 0;
}

.upcoming-info h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.upcoming-info p {
  margin: 3px 0;
  color: #777;
  font-size: 13px;
}

.upcoming-info span {
  color: #999;
  font-size: 11px;
}

.upcoming-card strong {
  white-space: nowrap;
  font-size: 14px;
}

.empty-state {
  padding: 28px 20px;
  text-align: center;
  border-radius: 20px;
  background: white;
  border: 1px solid #eee;
}

.empty-state ion-icon {
  font-size: 32px;
  color: #aaa;
}

.empty-state h3 {
  margin: 10px 0 4px;
  font-size: 15px;
}

.empty-state p {
  margin: 0;
  color: #888;
  font-size: 13px;
}

@media (max-width: 400px) {
  .summary-card h3 {
    font-size: 16px;
  }

  .welcome-section h1 {
    font-size: 28px;
  }
}
</style>

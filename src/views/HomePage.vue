<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content
          pulling-text="Pull to refresh"
          refreshing-text="Refreshing..."
        />
      </ion-refresher>

      <div class="home-container">
        <!-- ! Header / Welcome -->
        <section class="welcome-section">
          <p class="eyebrow">YOUR DEBT</p>

          <h1 class="welcome-title">Stay on track.</h1>

          <p class="subtitle">Keep paying. Watch it disappear.</p>
        </section>

        <!-- ! Debt Meter -->
        <ion-card class="debt-meter-card">
          <ion-card-content>
            <div class="meter-header">
              <div>
                <p class="meter-label">REMAINING DEBT</p>

                <h2>
                  {{ formatCurrency(animatedTotalDebt) }}
                </h2>
              </div>

              <div class="meter-icon">
                <ion-icon :icon="walletOutline" />
              </div>
            </div>

            <!-- ! Debt progress -->
            <div class="meter-container">
              <div
                class="meter-fill"
                :style="{
                  width: `${remainingPercentage}%`,
                }"
              ></div>
            </div>

            <div class="meter-footer">
              <span> {{ Math.round(animatedPaidPercentage) }}% paid </span>

              <span>
                {{ Math.round(animatedRemainingPercentage) }}% remaining
              </span>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- ! Summary -->
        <section class="summary-section">
          <!-- ! Money user owes -->
          <div class="summary-card">
            <div class="summary-icon owe">
              <ion-icon :icon="arrowUpRightBox" />
            </div>

            <p>I OWE</p>

            <h3>
              {{ formatCurrency(animatedTotalOwed) }}
            </h3>
          </div>

          <!-- ! Money owed to user -->
          <div class="summary-card">
            <div class="summary-icon owed">
              <ion-icon :icon="arrowDownLeftBox" />
            </div>

            <p>OWED TO ME</p>

            <h3>
              {{ formatCurrency(animatedTotalOwedToMe) }}
            </h3>
          </div>
        </section>

        <!-- ! Add Debt -->
        <ion-button expand="block" class="add-debt-button" @click="openAddDebt">
          <ion-icon slot="start" :icon="add" />

          Add Debt
        </ion-button>

        <!-- ! Upcoming Payments -->
        <section class="section">
          <div class="section-header">
            <div>
              <p class="section-eyebrow">UPCOMING</p>

              <h2>Next payments</h2>
            </div>

            <ion-icon :icon="calendarOutline" />
          </div>

          <!-- ! Upcoming debt list -->
          <div v-if="upcomingDebts.length > 0" class="upcoming-list">
            <div
              v-for="debt in upcomingDebts"
              :key="debt.id"
              class="upcoming-card"
            >
              <div class="upcoming-info">
                <h3>
                  {{ debt.name }}
                </h3>

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

          <!-- ! Empty state -->
          <div v-else class="empty-state">
            <ion-icon :icon="checkmarkCircle" />

            <h3>No upcoming payments</h3>

            <p>You're all caught up for now.</p>
          </div>
        </section>

        <!-- ! Recent Activity -->
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

    <!-- ! Add Debt modal -->
    <AddDebtModal :is-open="showAddDebt" @close="closeAddDebt" />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";

import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/vue";

import {
  add,
  arrowUpRightBox,
  arrowDownLeftBox,
  calendarOutline,
  checkmarkCircle,
  walletOutline,
} from "ionicons/icons";

import { useDebtStore } from "@/stores/debt.store";

import type { Debt } from "@/models/debt";

import AddDebtModal from "@/components/debt/AddDebtModal.vue";

const debtStore = useDebtStore();

/* ! Add Debt modal state */
const showAddDebt = ref(false);

/**
 * ! Open the Add Debt modal.
 */
function openAddDebt(): void {
  showAddDebt.value = true;
}

/**
 * ! Close the Add Debt modal.
 */
function closeAddDebt(): void {
  showAddDebt.value = false;
}

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
 * ! Load saved debts when the page mounts.
 */
onMounted(() => {
  debtStore.loadDebts();
});

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

/* ! Animated dashboard values */
const animatedTotalDebt = ref(0);

const animatedTotalOwed = ref(0);

const animatedTotalOwedToMe = ref(0);

const animatedPaidPercentage = ref(0);

const animatedRemainingPercentage = ref(0);

/**
 * ! Animate a number from its
 * ! current value to the target value.
 */
function animateNumber(
  target: number,
  output: { value: number },
  duration = 900,
): void {
  const startValue = output.value;
  const difference = target - startValue;
  const startTime = performance.now();

  // ? Nothing to animate.
  if (difference === 0) {
    output.value = target;
    return;
  }

  function update(currentTime: number): void {
    const elapsed = currentTime - startTime;

    const progress = Math.min(elapsed / duration, 1);

    // ! Fast at the beginning, then slows down smoothly.
    // ! Cubic ease-out: starts quickly and gently settles.
    const easedProgress = 1 - Math.pow(1 - progress, 4);

    output.value = startValue + difference * easedProgress;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      output.value = target;
    }
  }

  requestAnimationFrame(update);
}

/**
 * ! Animate total remaining debt.
 */
watch(
  totalDebt,
  (value) => {
    animateNumber(value, animatedTotalDebt);
  },
  {
    immediate: true,
  },
);

/**
 * ! Animate user's total debt.
 */
watch(
  totalOwed,
  (value) => {
    animateNumber(value, animatedTotalOwed);
  },
  {
    immediate: true,
  },
);

/**
 * ! Animate money owed to the user.
 */
watch(
  totalOwedToMe,
  (value) => {
    animateNumber(value, animatedTotalOwedToMe);
  },
  {
    immediate: true,
  },
);

/**
 * ! Animate paid percentage.
 */
watch(
  paidPercentage,
  (value) => {
    animateNumber(value, animatedPaidPercentage);
  },
  {
    immediate: true,
  },
);

/**
 * ! Animate remaining percentage.
 */
watch(
  remainingPercentage,
  (value) => {
    animateNumber(value, animatedRemainingPercentage);
  },
  {
    immediate: true,
  },
);

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

/* ! Welcome section */
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

  color: var(--app-text-muted);
}

.welcome-section .eyebrow {
  color: var(--app-sage-dark);

  font-size: 12px;

  letter-spacing: 1.5px;
}

.welcome-title {
  margin: 0;

  font-size: 32px;
  font-weight: 800;

  color: var(--app-sage-dark);
}

.subtitle {
  margin: 6px 0 0;

  color: var(--app-text-muted);

  font-size: 15px;
}

/* ! Debt meter */
.debt-meter-card {
  margin: 0 0 16px;

  border-radius: 24px;

  background: var(--app-text);

  color: #ffffff;

  box-shadow: none;
}

.debt-meter-card {
  margin: 0 0 16px;
  border-radius: 24px;
  background: #1f2937;
  color: #ffffff;
  box-shadow: none;
}

html.dark .debt-meter-card {
  background: #202820;
  color: var(--app-text);
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
  color: #a3a3a3;
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

/* ! Debt progress meter */
.meter-container {
  height: 12px;
  margin-top: 28px;
  overflow: hidden;
  border-radius: 999px;
  background: #374151;
}

html.dark .meter-container {
  background: #374151;
}

.meter-fill {
  height: 100%;

  border-radius: inherit;

  background: var(--app-sage);

  transition: width 0.4s ease;
}

.meter-footer {
  display: flex;

  justify-content: space-between;

  margin-top: 10px;

  color: #a3a3a3;

  font-size: 12px;
}

/* ! Summary cards */
.summary-section {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 12px;

  margin-bottom: 16px;
}

.summary-card {
  padding: 18px;

  border-radius: 20px;

  background: var(--app-surface);

  border: 1px solid var(--app-border);
}
html.dark .summary-card,
html.dark .upcoming-card,
html.dark .empty-state {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
}

.summary-icon {
  width: 34px;
  height: 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 14px;

  border-radius: 10px;
}

.summary-icon.owe {
  background: #fef2f2;
  color: var(--ion-color-danger);
}

html.dark .summary-icon.owe {
  background: #3a2020;
  color: var(--app-danger);
}

.summary-icon.owed {
  background: var(--app-sage-light);

  color: var(--app-sage);
}

.summary-icon ion-icon {
  font-size: 18px;
}

.summary-card p {
  margin: 0 0 5px;

  font-size: 10px;
  font-weight: 700;

  letter-spacing: 1px;

  color: var(--app-text-muted);
}

.summary-card h3 {
  margin: 0;

  font-size: 18px;
  font-weight: 800;

  color: var(--app-text);
}

/* ! Add debt button */
.add-debt-button {
  --border-radius: 16px;

  --background: var(--app-sage);

  --background-activated: var(--app-sage-dark);

  height: 52px;

  margin: 0 0 30px;

  font-weight: 700;
}

/* ! General section */
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

  color: var(--app-text);
}

.section-header > ion-icon {
  font-size: 22px;

  color: var(--app-text-muted);
}

/* ! Upcoming payments */
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

  background: var(--app-surface);

  border: 1px solid var(--app-border);
}

.upcoming-info {
  min-width: 0;
}

.upcoming-info h3 {
  margin: 0;

  font-size: 15px;
  font-weight: 700;

  color: var(--app-text);
}

.upcoming-info p {
  margin: 3px 0;

  color: var(--app-text-muted);

  font-size: 13px;
}

.upcoming-info span {
  color: var(--app-text-muted);

  font-size: 11px;
}

.upcoming-card strong {
  white-space: nowrap;

  font-size: 14px;

  color: var(--app-text);
}

/* ! Empty state */
.empty-state {
  padding: 28px 20px;

  text-align: center;

  border-radius: 20px;

  background: var(--app-surface);

  border: 1px solid var(--app-border);

  box-shadow: 0 4px 14px rgba(31, 41, 55, 0.05);
}

.empty-state ion-icon {
  font-size: 32px;

  color: var(--app-text-muted);
}

.empty-state h3 {
  margin: 10px 0 4px;

  font-size: 15px;
  font-weight: 700;

  color: var(--app-text);
}

.empty-state p {
  margin: 0;

  color: var(--app-text-muted);

  font-size: 13px;
}

/* ! Mobile adjustments */
@media (max-width: 400px) {
  .summary-card h3 {
    font-size: 16px;
  }

  .welcome-section h1 {
    font-size: 28px;
  }
}
</style>

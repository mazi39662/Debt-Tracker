<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>My Debts</ion-title>

        <ion-buttons slot="end">
          <ion-button @click="goToMore" aria-label="Back to More">
            <ion-icon :icon="receiptOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="page-container">
        <!-- ! Empty state -->
        <div v-if="debtStore.debts.length === 0" class="empty-state">
          <h2>No debts yet</h2>

          <p>Add your first debt to start tracking.</p>
        </div>

        <!-- ! Debt list -->
        <div
          v-for="debt in debtStore.debts"
          :key="debt.id"
          class="debt-card"
          @pointerdown="startLongPress(debt.id)"
          @pointerup="cancelLongPress"
          @pointerleave="cancelLongPress"
          @pointercancel="cancelLongPress"
        >
          <!-- ! Debt information -->
          <div class="debt-info">
            <strong>
              {{ debt.name }}
            </strong>

            <span>
              {{ debt.person || "No person" }}
            </span>

            <small
              :class="{
                completed: debt.status === 'completed',
              }"
            >
              {{ debt.status }}
            </small>

            <!-- ! Due date -->
            <span v-if="debt.dueDate" class="due-date">
              Due:
              {{ formatDate(debt.dueDate) }}
            </span>
          </div>

          <!-- ! Balance and actions -->
          <div class="debt-actions">
            <strong class="balance">
              {{ formatCurrency(debt.remainingAmount) }}
            </strong>

            <!-- ! Record payment -->
            <ion-button
              v-if="debt.status === 'active' && debt.remainingAmount > 0"
              size="small"
              fill="solid"
              @click.stop="openPaymentModal(debt.id)"
            >
              Pay
            </ion-button>

            <!-- ! Delete debt -->
            <ion-button
              fill="clear"
              color="danger"
              @click.stop="deleteDebt(debt.id)"
            >
              <ion-icon :icon="trashOutline" />
            </ion-button>
          </div>
        </div>

        <!-- ! Long press hint -->
        <p v-if="debtStore.debts.length > 0" class="edit-hint">
          Long press a debt to edit it.
        </p>
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
import { onMounted, onBeforeUnmount, ref } from "vue";
import { useRouter } from "vue-router";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  alertController,
  IonButtons,
} from "@ionic/vue";

import { trashOutline, receiptOutline } from "ionicons/icons";

import { useDebtStore } from "@/stores/debt.store";

import RecordPaymentModal from "@/components/debt/RecordPaymentModal.vue";

import EditDebtModal from "@/components/debt/EditDebtModal.vue";

const router = useRouter();

function goToMore(): void {
  router.push("/tabs/payment-history");
}

const debtStore = useDebtStore();

const showPaymentModal = ref(false);

const showEditModal = ref(false);

const selectedDebtId = ref<string | null>(null);

let longPressTimer: ReturnType<typeof setTimeout> | null = null;

// ! Load saved debts.
onMounted(() => {
  debtStore.loadDebts();
});

// ! Start long press timer.
function startLongPress(debtId: string): void {
  cancelLongPress();

  longPressTimer = setTimeout(() => {
    selectedDebtId.value = debtId;

    showEditModal.value = true;

    longPressTimer = null;
  }, 700);
}

// ! Cancel long press.
function cancelLongPress(): void {
  if (longPressTimer) {
    clearTimeout(longPressTimer);

    longPressTimer = null;
  }
}

// ! Open payment modal.
function openPaymentModal(debtId: string): void {
  cancelLongPress();

  selectedDebtId.value = debtId;

  showPaymentModal.value = true;
}

// ! Close payment modal.
function closePaymentModal(): void {
  showPaymentModal.value = false;

  selectedDebtId.value = null;
}

// ! Close edit modal.
function closeEditModal(): void {
  showEditModal.value = false;

  selectedDebtId.value = null;
}

// ! Delete debt.
async function deleteDebt(id: string): Promise<void> {
  cancelLongPress();

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
        },
      },
    ],
  });

  await alert.present();
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

// ! Clean up timer.
onBeforeUnmount(() => {
  cancelLongPress();
});
</script>

<style scoped>
.page-container {
  padding: 20px 16px 100px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #777;
}

.debt-card {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 16px;
  margin-bottom: 12px;

  background: white;
  border: 1px solid #eeeeee;
  border-radius: 18px;

  user-select: none;
  -webkit-user-select: none;
}

.debt-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  min-width: 0;
}

.debt-info strong {
  font-size: 16px;
}

.debt-info span {
  font-size: 13px;
  color: #777;
}

.debt-info small {
  width: fit-content;

  padding: 3px 7px;

  border-radius: 6px;

  background: #fff3cd;
  color: #856404;

  font-size: 10px;
  text-transform: uppercase;
}

.debt-info small.completed {
  background: #d1e7dd;
  color: #0f5132;
}

.due-date {
  font-size: 12px !important;
  color: #555 !important;
}

.debt-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.balance {
  font-size: 15px;
}

.edit-hint {
  margin-top: 20px;
  text-align: center;
  color: #999;
  font-size: 12px;
}
</style>

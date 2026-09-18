<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleClose">
    <ion-header>
      <ion-toolbar>
        <ion-title>Record Payment</ion-title>

        <ion-buttons slot="end">
          <ion-button @click="handleClose"> Close </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="modal-container">
        <h2>Make a Payment</h2>

        <p class="subtitle">
          {{ debt?.name }}
        </p>

        <!-- ! Show current remaining balance -->
        <div class="balance-card">
          <span>Remaining Balance</span>

          <strong>
            {{ formatCurrency(debt?.remainingAmount ?? 0) }}
          </strong>
        </div>

        <ion-list>
          <!-- ! Payment amount -->
          <ion-item>
            <ion-input
              v-model.number="amount"
              type="number"
              label="Payment Amount"
              label-placement="stacked"
              placeholder="0.00"
              min="0"
              :max="debt?.remainingAmount"
            />
          </ion-item>

          <!-- ! Optional payment note -->
          <ion-item>
            <ion-textarea
              v-model="note"
              label="Note"
              label-placement="stacked"
              placeholder="Optional note..."
              :auto-grow="true"
            />
          </ion-item>
        </ion-list>

        <!-- ! Record payment -->
        <ion-button expand="block" class="payment-button" @click="handleSubmit">
          Record Payment
        </ion-button>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonTextarea,
  toastController,
} from "@ionic/vue";

import { useDebtStore } from "@/stores/debt.store";

const props = defineProps<{
  isOpen: boolean;
  debtId: string | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const debtStore = useDebtStore();

const amount = ref<number>(0);
const note = ref<string>("");

// ! Get the selected debt from the store.
const debt = computed(() => {
  if (!props.debtId) {
    return undefined;
  }

  return debtStore.getDebtById(props.debtId);
});

// ! Reset the form whenever a different debt is selected.
watch(
  () => props.debtId,
  () => {
    amount.value = 0;
    note.value = "";
  },
);

// ! Record the payment.
async function handleSubmit(): Promise<void> {
  // ? Make sure a debt is selected.
  if (!debt.value) {
    return;
  }

  // ? Validate payment amount.
  if (!amount.value || amount.value <= 0) {
    const toast = await toastController.create({
      message: "Enter a valid payment amount.",
      duration: 2000,
      position: "bottom",
    });

    await toast.present();

    return;
  }

  // ? Prevent payment from exceeding the balance.
  if (amount.value > debt.value.remainingAmount) {
    const toast = await toastController.create({
      message: "Payment cannot exceed the remaining balance.",
      duration: 2000,
      position: "bottom",
    });

    await toast.present();

    return;
  }

  // ! Save the payment through Pinia.
  debtStore.recordPayment(
    debt.value.id,
    amount.value,
    note.value.trim() || undefined,
  );

  // ! Show success message.
  const toast = await toastController.create({
    message: "Payment recorded successfully.",
    duration: 1500,
    position: "bottom",
  });

  await toast.present();

  // ! Reset and close.
  resetForm();
  emit("close");
}

// ! Close the modal.
function handleClose(): void {
  resetForm();
  emit("close");
}

// ! Reset form values.
function resetForm(): void {
  amount.value = 0;
  note.value = "";
}

// ! Format Philippine currency.
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}
</script>

<style scoped>
.modal-container {
  padding: 24px 16px 40px;
}

h2 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
}

.subtitle {
  margin: 0 0 20px;
  color: #777;
  font-size: 14px;
}

.balance-card {
  display: flex;
  flex-direction: column;
  gap: 6px;

  padding: 18px;
  margin-bottom: 20px;

  border-radius: 16px;
  background: #171717;
  color: white;
}

.balance-card span {
  font-size: 13px;
  opacity: 0.7;
}

.balance-card strong {
  font-size: 26px;
}

ion-list {
  background: transparent;
}

ion-item {
  --background: #ffffff;
  --border-color: #eeeeee;

  margin-bottom: 8px;

  border-radius: 12px;
}

.payment-button {
  margin-top: 24px;
  height: 50px;
}
</style>

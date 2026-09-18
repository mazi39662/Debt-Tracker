<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleClose">
    <ion-header>
      <ion-toolbar>
        <ion-title>Add Debt</ion-title>

        <ion-buttons slot="end">
          <ion-button @click="handleClose"> Close </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="modal-container">
        <h2>Add a New Debt</h2>

        <p class="subtitle">Enter the details of the debt you want to track.</p>

        <ion-list>
          <!-- ! Debt name -->
          <ion-item>
            <ion-input
              v-model="form.name"
              label="Debt Name"
              label-placement="stacked"
              placeholder="e.g. Car Loan"
            />
          </ion-item>

          <!-- ! Person or company -->
          <ion-item>
            <ion-input
              v-model="form.person"
              label="Person / Company"
              label-placement="stacked"
              placeholder="e.g. Juan"
            />
          </ion-item>

          <!-- ! Debt direction -->
          <ion-item>
            <ion-select
              v-model="form.direction"
              label="Direction"
              label-placement="stacked"
            >
              <ion-select-option value="owe"> I Owe </ion-select-option>

              <ion-select-option value="owed_to_me">
                Owes Me
              </ion-select-option>
            </ion-select>
          </ion-item>

          <!-- ! Debt amount -->
          <ion-item>
            <ion-input
              v-model.number="form.amount"
              type="number"
              label="Amount"
              label-placement="stacked"
              placeholder="0.00"
              min="0"
            />
          </ion-item>

          <!-- ! Debt type -->
          <ion-item>
            <ion-select
              v-model="form.type"
              label="Debt Type"
              label-placement="stacked"
            >
              <ion-select-option value="one_time"> One Time </ion-select-option>

              <ion-select-option value="recurring">
                Recurring
              </ion-select-option>

              <ion-select-option value="no_due_date">
                No Due Date
              </ion-select-option>
            </ion-select>
          </ion-item>

          <!-- ! Due date -->
          <ion-item
            v-if="form.type !== 'no_due_date'"
            button
            detail
            @click="showDatePicker = true"
          >
            <ion-label>
              <div class="field-label">Due Date</div>

              <div
                :class="{
                  placeholder: !form.dueDate,
                }"
              >
                {{
                  form.dueDate ? formatDate(form.dueDate) : "Select due date"
                }}
              </div>
            </ion-label>
          </ion-item>

          <!-- ! Notes -->
          <ion-item>
            <ion-textarea
              v-model="form.notes"
              label="Notes"
              label-placement="stacked"
              placeholder="Optional notes..."
              :auto-grow="true"
            />
          </ion-item>
        </ion-list>

        <!-- ! Date picker -->
        <ion-modal
          :is-open="showDatePicker"
          @didDismiss="showDatePicker = false"
        >
          <ion-header>
            <ion-toolbar>
              <ion-title>Select Due Date</ion-title>

              <ion-buttons slot="end">
                <ion-button @click="showDatePicker = false"> Done </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>

          <ion-content>
            <ion-datetime
              v-model="form.dueDate"
              presentation="date"
              :min="today"
            />
          </ion-content>
        </ion-modal>

        <!-- ! Save debt -->
        <ion-button expand="block" class="save-button" @click="handleSubmit">
          Add Debt
        </ion-button>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";

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
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonLabel,
  IonDatetime,
  toastController,
} from "@ionic/vue";

import { useDebtStore } from "@/stores/debt.store";

import type { DebtDirection, DebtType } from "@/models/debt";

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const debtStore = useDebtStore();

const showDatePicker = ref(false);

// ! Today's date for the date picker.
const today = new Date().toISOString();

// ! Form data.
const form = reactive<{
  name: string;
  person: string;
  direction: DebtDirection;
  amount: number;
  type: DebtType;
  dueDate: string;
  notes: string;
}>({
  name: "",
  person: "",
  direction: "owe",
  amount: 0,
  type: "one_time",
  dueDate: "",
  notes: "",
});

// ! Save a new debt.
async function handleSubmit(): Promise<void> {
  // ? Validate required fields.
  if (!form.name.trim() || form.amount <= 0) {
    const toast = await toastController.create({
      message: "Please enter a debt name and valid amount.",
      duration: 2000,
      position: "bottom",
    });

    await toast.present();

    return;
  }

  const now = new Date().toISOString();

  // ! Create debt.
  debtStore.addDebt({
    id: crypto.randomUUID(),

    name: form.name.trim(),

    person: form.person.trim() || undefined,

    direction: form.direction,

    type: form.type,

    originalAmount: form.amount,

    remainingAmount: form.amount,

    dueDate:
      form.type === "no_due_date" ? undefined : form.dueDate || undefined,

    status: "active",

    notes: form.notes.trim() || undefined,

    payments: [],

    createdAt: now,

    updatedAt: now,
  });

  // ! Success message.
  const toast = await toastController.create({
    message: "Debt added successfully.",
    duration: 1500,
    position: "bottom",
  });

  await toast.present();

  resetForm();
  emit("close");
}

// ! Close modal.
function handleClose(): void {
  resetForm();
  emit("close");
}

// ! Reset form.
function resetForm(): void {
  form.name = "";
  form.person = "";
  form.direction = "owe";
  form.amount = 0;
  form.type = "one_time";
  form.dueDate = "";
  form.notes = "";

  showDatePicker.value = false;
}

// ! Format date for display.
function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
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
  margin: 0 0 24px;
  color: #777;
  font-size: 14px;
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

.field-label {
  margin-bottom: 5px;
  font-size: 12px;
  color: #666;
}

.placeholder {
  color: #999;
}

.save-button {
  margin-top: 24px;
  height: 50px;
}
</style>

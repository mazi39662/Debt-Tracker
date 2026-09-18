<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleClose">
    <ion-header>
      <ion-toolbar>
        <ion-title>Edit Debt</ion-title>

        <ion-buttons slot="end">
          <ion-button @click="handleClose"> Close </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="modal-container">
        <h2>Edit Debt</h2>

        <p class="subtitle">Update the details of this debt.</p>

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

          <!-- ! Person -->
          <ion-item>
            <ion-input
              v-model="form.person"
              label="Person / Company"
              label-placement="stacked"
            />
          </ion-item>

          <!-- ! Direction -->
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

          <!-- ! Original amount -->
          <ion-item>
            <ion-input
              v-model.number="form.originalAmount"
              type="number"
              label="Original Amount"
              label-placement="stacked"
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
            <ion-datetime v-model="form.dueDate" presentation="date" />
          </ion-content>
        </ion-modal>

        <!-- ! Save changes -->
        <ion-button expand="block" class="save-button" @click="handleSubmit">
          Save Changes
        </ion-button>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

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

const props = defineProps<{
  isOpen: boolean;
  debtId: string | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const debtStore = useDebtStore();

const showDatePicker = ref(false);

const form = reactive<{
  name: string;
  person: string;
  direction: DebtDirection;
  originalAmount: number;
  type: DebtType;
  dueDate: string;
  notes: string;
}>({
  name: "",
  person: "",
  direction: "owe",
  originalAmount: 0,
  type: "one_time",
  dueDate: "",
  notes: "",
});

// ! Get selected debt.
const debt = computed(() => {
  if (!props.debtId) {
    return undefined;
  }

  return debtStore.getDebtById(props.debtId);
});

// ! Load debt data when modal opens.
watch(
  () => [props.isOpen, props.debtId],
  () => {
    if (props.isOpen && debt.value) {
      form.name = debt.value.name;

      form.person = debt.value.person || "";

      form.direction = debt.value.direction;

      form.originalAmount = debt.value.originalAmount;

      form.type = debt.value.type;

      form.dueDate = debt.value.dueDate || "";

      form.notes = debt.value.notes || "";
    }
  },
  {
    immediate: true,
  },
);

// ! Save edited debt.
async function handleSubmit(): Promise<void> {
  if (!debt.value) {
    return;
  }

  // ? Validate required fields.
  if (!form.name.trim() || form.originalAmount <= 0) {
    return;
  }

  // ! Preserve the amount already paid.
  const paidAmount = debt.value.originalAmount - debt.value.remainingAmount;

  const newRemaining = Math.max(0, form.originalAmount - paidAmount);

  // ! Update debt.
  debtStore.updateDebt({
    ...debt.value,

    name: form.name.trim(),

    person: form.person.trim() || undefined,

    direction: form.direction,

    type: form.type,

    originalAmount: form.originalAmount,

    remainingAmount: newRemaining,

    dueDate:
      form.type === "no_due_date" ? undefined : form.dueDate || undefined,

    status: newRemaining === 0 ? "completed" : "active",

    notes: form.notes.trim() || undefined,
  });

  // ! Success message.
  const toast = await toastController.create({
    message: "Debt updated successfully.",
    duration: 1500,
    position: "bottom",
  });

  await toast.present();

  emit("close");
}

// ! Close modal.
function handleClose(): void {
  showDatePicker.value = false;

  emit("close");
}

// ! Format date.
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

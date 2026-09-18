<template>
  <form class="debt-form" @submit.prevent="handleSubmit">
    <ion-item>
      <ion-input
        v-model="form.name"
        label="Debt Name"
        label-placement="stacked"
        placeholder="e.g. Car Loan"
        required
      />
    </ion-item>

    <ion-item>
      <ion-input
        v-model="form.person"
        label="Person / Company"
        label-placement="stacked"
        placeholder="e.g. Juan"
      />
    </ion-item>

    <ion-item>
      <ion-select
        v-model="form.direction"
        label="Direction"
        label-placement="stacked"
      >
        <ion-select-option value="owe"> I Owe </ion-select-option>

        <ion-select-option value="owed_to_me"> Owes Me </ion-select-option>
      </ion-select>
    </ion-item>

    <ion-item>
      <ion-input
        v-model.number="form.amount"
        type="number"
        label="Amount"
        label-placement="stacked"
        placeholder="0.00"
        min="0"
        required
      />
    </ion-item>

    <ion-item>
      <ion-select
        v-model="form.type"
        label="Debt Type"
        label-placement="stacked"
      >
        <ion-select-option value="one_time"> One Time </ion-select-option>

        <ion-select-option value="recurring"> Recurring </ion-select-option>

        <ion-select-option value="no_due_date"> No Due Date </ion-select-option>
      </ion-select>
    </ion-item>

    <ion-item v-if="form.type !== 'no_due_date'">
      <ion-input
        v-model="form.dueDate"
        type="date"
        label="Due Date"
        label-placement="stacked"
      />
    </ion-item>

    <ion-item>
      <ion-textarea
        v-model="form.notes"
        label="Notes"
        label-placement="stacked"
        placeholder="Optional notes..."
        :auto-grow="true"
      />
    </ion-item>

    <ion-button expand="block" type="submit" class="save-button">
      {{ submitText }}
    </ion-button>
  </form>
</template>

<script setup lang="ts">
import { reactive } from "vue";

import {
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonButton,
} from "@ionic/vue";

import type { DebtDirection, DebtType } from "@/models/debt";

const props = withDefaults(
  defineProps<{
    submitText?: string;
  }>(),
  {
    submitText: "Add Debt",
  },
);

const emit = defineEmits<{
  submit: [
    data: {
      name: string;
      person: string;
      direction: DebtDirection;
      type: DebtType;
      amount: number;
      dueDate?: string;
      notes: string;
    },
  ];
}>();

const form = reactive({
  name: "",
  person: "",
  direction: "owe" as DebtDirection,
  type: "one_time" as DebtType,
  amount: 0,
  dueDate: "",
  notes: "",
});

// ! Submit the form data to the parent page.
function handleSubmit(): void {
  if (!form.name.trim() || form.amount <= 0) {
    return;
  }

  emit("submit", {
    name: form.name.trim(),
    person: form.person.trim(),
    direction: form.direction,
    type: form.type,
    amount: form.amount,
    dueDate:
      form.type === "no_due_date" ? undefined : form.dueDate || undefined,
    notes: form.notes.trim(),
  });
}
</script>

<style scoped>
.debt-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.save-button {
  margin-top: 16px;
}
</style>

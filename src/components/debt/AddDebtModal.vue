<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleClose">
    <ion-header class="modal-header">
      <ion-toolbar>
        <ion-title>Add Debt</ion-title>

        <ion-buttons slot="end">
          <ion-button class="close-button" @click="handleClose">
            <ion-icon :icon="closeOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="modal-container">
        <!-- ! Header -->
        <div class="form-header">
          <div class="header-icon">
            <ion-icon :icon="walletOutline" />
          </div>

          <div>
            <h2>Add a New Debt</h2>
            <p>Track what you owe or what others owe you.</p>
          </div>
        </div>

        <!-- ! Basic information -->
        <div class="section">
          <div class="section-title">
            <span>Basic Information</span>
          </div>

          <div class="form-card">
            <!-- ! Debt name -->
            <ion-item lines="none">
              <ion-icon
                slot="start"
                :icon="documentTextOutline"
                class="field-icon"
              />

              <ion-input
                v-model="form.name"
                label="Debt Name"
                label-placement="stacked"
                placeholder="e.g. Car Loan"
              />
            </ion-item>

            <!-- ! Person or company -->
            <ion-item lines="none">
              <ion-icon slot="start" :icon="personOutline" class="field-icon" />

              <ion-input
                v-model="form.person"
                label="Person / Company"
                label-placement="stacked"
                placeholder="e.g. Juan"
              />
            </ion-item>
          </div>
        </div>

        <!-- ! Debt direction -->
        <div class="section">
          <div class="section-title">
            <span>Debt Direction</span>
          </div>

          <div class="direction-grid">
            <button
              type="button"
              class="direction-option"
              :class="{ active: form.direction === 'owe' }"
              @click="form.direction = 'owe'"
            >
              <div class="option-icon owe">
                <ion-icon :icon="arrowUpOutline" />
              </div>

              <div class="option-content">
                <strong>I Owe</strong>
                <span>Money I need to pay</span>
              </div>

              <ion-icon
                v-if="form.direction === 'owe'"
                :icon="checkmarkCircle"
                class="check-icon"
              />
            </button>

            <button
              type="button"
              class="direction-option"
              :class="{ active: form.direction === 'owed_to_me' }"
              @click="form.direction = 'owed_to_me'"
            >
              <div class="option-icon owed">
                <ion-icon :icon="arrowDownOutline" />
              </div>

              <div class="option-content">
                <strong>Owes Me</strong>
                <span>Money I should receive</span>
              </div>

              <ion-icon
                v-if="form.direction === 'owed_to_me'"
                :icon="checkmarkCircle"
                class="check-icon"
              />
            </button>
          </div>
        </div>

        <!-- ! Amount -->
        <div class="section">
          <div class="section-title">
            <span>Amount</span>
          </div>

          <div class="amount-card">
            <span class="currency">₱</span>

            <ion-input
              v-model.number="form.amount"
              type="number"
              inputmode="decimal"
              placeholder="0.00"
              min="0"
              class="amount-input"
            />
          </div>
        </div>

        <!-- ! Debt type -->
        <div class="section">
          <div class="section-title">
            <span>Payment Schedule</span>
          </div>

          <div class="type-grid">
            <button
              type="button"
              class="type-option"
              :class="{ active: form.type === 'one_time' }"
              @click="form.type = 'one_time'"
            >
              <ion-icon :icon="calendarOutline" />

              <span>One Time</span>

              <ion-icon
                v-if="form.type === 'one_time'"
                :icon="checkmarkCircle"
                class="type-check"
              />
            </button>

            <button
              type="button"
              class="type-option"
              :class="{ active: form.type === 'recurring' }"
              @click="form.type = 'recurring'"
            >
              <ion-icon :icon="repeatOutline" />

              <span>Recurring</span>

              <ion-icon
                v-if="form.type === 'recurring'"
                :icon="checkmarkCircle"
                class="type-check"
              />
            </button>

            <button
              type="button"
              class="type-option"
              :class="{ active: form.type === 'no_due_date' }"
              @click="form.type = 'no_due_date'"
            >
              <ion-icon :icon="infiniteOutline" />

              <span>No Due Date</span>

              <ion-icon
                v-if="form.type === 'no_due_date'"
                :icon="checkmarkCircle"
                class="type-check"
              />
            </button>
          </div>
        </div>

        <!-- ! Due date -->
        <div v-if="form.type !== 'no_due_date'" class="section">
          <div class="section-title">
            <span>Due Date</span>
          </div>

          <button
            type="button"
            class="date-card"
            @click="showDatePicker = true"
          >
            <div class="date-icon">
              <ion-icon :icon="calendarNumberOutline" />
            </div>

            <div class="date-content">
              <span>Payment due</span>

              <strong :class="{ placeholder: !form.dueDate }">
                {{
                  form.dueDate ? formatDate(form.dueDate) : "Select due date"
                }}
              </strong>
            </div>

            <ion-icon :icon="chevronForwardOutline" class="date-arrow" />
          </button>
        </div>

        <!-- ! Notes -->
        <div class="section">
          <div class="section-title">
            <span>Additional Notes</span>
            <small>Optional</small>
          </div>

          <div class="notes-card">
            <ion-textarea
              v-model="form.notes"
              placeholder="Add any details you want to remember..."
              :auto-grow="true"
              :rows="3"
            />
          </div>
        </div>

        <!-- ! Save debt -->
        <ion-button expand="block" class="save-button" @click="handleSubmit">
          <ion-icon slot="start" :icon="addCircleOutline" />
          Add Debt
        </ion-button>

        <p class="secure-note">
          <ion-icon :icon="lockClosedOutline" />
          Your debt information is stored locally on your device.
        </p>
      </div>

      <!-- ! Date picker -->
      <ion-modal
        :is-open="showDatePicker"
        class="date-picker-modal"
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
  IonTextarea,
  IonIcon,
  IonDatetime,
  toastController,
} from "@ionic/vue";

import {
  walletOutline,
  closeOutline,
  documentTextOutline,
  personOutline,
  arrowUpOutline,
  arrowDownOutline,
  checkmarkCircle,
  calendarOutline,
  repeatOutline,
  infiniteOutline,
  calendarNumberOutline,
  chevronForwardOutline,
  addCircleOutline,
  lockClosedOutline,
} from "ionicons/icons";

import { useDebtStore } from "@/stores/debt.store";
import type { DebtDirection, DebtType } from "@/models/debt";
import { generateId } from "@/utils/id";

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const debtStore = useDebtStore();

const showDatePicker = ref(false);

const today = new Date().toISOString();

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
    id: generateId(),
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
/* ! ============================= */
/* ! MODAL */
/* ! ============================= */

ion-modal {
  --background: var(--ion-background-color);
  --border-radius: 24px 24px 0 0;
}

.modal-header ion-toolbar {
  --background: var(--ion-background-color);
  --color: var(--ion-text-color);
  --border-width: 0;
}

.modal-header ion-title {
  color: var(--ion-text-color);
  font-size: 18px;
  font-weight: 700;
}

.close-button {
  --color: var(--ion-color-medium);
}

/* ! ============================= */
/* ! CONTAINER */
/* ! ============================= */

.modal-container {
  padding: 8px 16px 40px;
  max-width: 620px;
  margin: 0 auto;

  background: var(--ion-background-color);
  color: var(--ion-text-color);
}

/* ! ============================= */
/* ! HEADER */
/* ! ============================= */

.form-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 4px 26px;
}

.header-icon {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 15px;

  background: var(--ion-color-primary);
  color: #ffffff;
}

.header-icon ion-icon {
  font-size: 25px;
}

.form-header h2 {
  margin: 0 0 4px;

  color: var(--ion-text-color);

  font-size: 22px;
  font-weight: 750;
}

.form-header p {
  margin: 0;

  color: var(--ion-color-medium);

  font-size: 13px;
  line-height: 1.4;
}

/* ! ============================= */
/* ! SECTIONS */
/* ! ============================= */

.section {
  margin-bottom: 22px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin: 0 4px 9px;

  color: var(--ion-color-medium);

  font-size: 12px;
  font-weight: 750;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.section-title small {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
}

/* ! ============================= */
/* ! INPUT CARD */
/* ! ============================= */

.form-card {
  overflow: hidden;

  border: 1px solid var(--ion-color-step-150);
  border-radius: 16px;
}

.form-card ion-item {
  --background: transparent;
  --color: var(--ion-text-color);
  --border-color: var(--ion-color-step-150);

  --padding-start: 14px;
  --inner-padding-end: 14px;
  --min-height: 70px;
}

.form-card ion-item:last-child {
  --border-width: 0;
}

.form-card ion-input {
  --color: var(--ion-text-color);
  --placeholder-color: var(--ion-color-medium);
  --highlight-color-focused: var(--ion-color-primary);
  --background: var(--ion-item-background, var(--ion-background-color));
  --border-radius: 12px;
}

.form-card ion-input::part(label) {
  color: var(--ion-color-medium);
}

.field-icon {
  margin-right: 4px;

  color: var(--ion-color-medium);
  font-size: 20px;
}

/* ! ============================= */
/* ! DIRECTION */
/* ! ============================= */

.direction-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 9px;
}

.direction-option {
  position: relative;

  display: flex;
  align-items: center;

  width: 100%;
  padding: 13px;

  border: 1px solid var(--ion-color-step-150);
  border-radius: 16px;

  background: var(--ion-item-background, var(--ion-background-color));
  color: var(--ion-text-color);

  text-align: left;

  transition: 0.2s ease;
}

.direction-option.active {
  border-color: var(--ion-color-primary);

  background: rgba(var(--ion-color-primary-rgb), 0.08);
}

.option-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-right: 12px;

  border-radius: 13px;

  font-size: 20px;
}

.option-icon.owe {
  color: #d97706;
  background: rgba(217, 119, 6, 0.12);
}

.option-icon.owed {
  color: #16a34a;
  background: rgba(22, 163, 74, 0.12);
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.option-content strong {
  color: var(--ion-text-color);

  font-size: 14px;
  font-weight: 700;
}

.option-content span {
  color: var(--ion-color-medium);

  font-size: 12px;
}

.check-icon {
  margin-left: auto;

  color: var(--ion-color-primary);
  font-size: 22px;
}

/* ! ============================= */
/* ! AMOUNT */
/* ! ============================= */

.amount-card {
  display: flex;
  align-items: center;

  padding: 8px 18px;

  border: 1px solid var(--ion-color-step-150);
  border-radius: 16px;

  background: var(--ion-item-background, var(--ion-background-color));

  transition: border-color 0.2s ease;
}

.amount-card:focus-within {
  border-color: var(--ion-color-primary);
}

.currency {
  color: var(--ion-color-primary);

  font-size: 25px;
  font-weight: 700;
}

.amount-input {
  --color: var(--ion-text-color);
  --placeholder-color: var(--ion-color-medium);
  --padding-start: 10px;
  --padding-end: 0;

  font-size: 26px;
  font-weight: 750;
}

/* ! ============================= */
/* ! DEBT TYPE */
/* ! ============================= */

.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.type-option {
  position: relative;

  min-height: 76px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 7px;

  padding: 10px 5px;

  border: 1px solid var(--ion-color-step-150);
  border-radius: 15px;

  background: var(--ion-item-background, var(--ion-background-color));
  color: var(--ion-color-medium);

  font-size: 11px;
  font-weight: 650;

  transition: 0.2s ease;
}

.type-option ion-icon:first-child {
  font-size: 21px;
}

.type-option.active {
  color: var(--ion-color-primary);

  border-color: var(--ion-color-primary);

  background: rgba(var(--ion-color-primary-rgb), 0.08);
}

.type-check {
  position: absolute;
  top: 7px;
  right: 7px;

  color: var(--ion-color-primary);
  font-size: 15px;
}

/* ! ============================= */
/* ! DATE */
/* ! ============================= */

.date-card {
  width: 100%;

  display: flex;
  align-items: center;

  padding: 13px;

  border: 1px solid var(--ion-color-step-150);
  border-radius: 16px;

  background: var(--ion-item-background, var(--ion-background-color));
  color: var(--ion-text-color);

  text-align: left;
}

.date-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-right: 12px;

  border-radius: 13px;

  background: rgba(var(--ion-color-primary-rgb), 0.1);

  color: var(--ion-color-primary);

  font-size: 20px;
}

.date-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.date-content span {
  color: var(--ion-color-medium);

  font-size: 11px;
}

.date-content strong {
  color: var(--ion-text-color);

  font-size: 14px;
}

.date-content strong.placeholder {
  color: var(--ion-color-medium);
  font-weight: 500;
}

.date-arrow {
  margin-left: auto;

  color: var(--ion-color-medium);
}

/* ! ============================= */
/* ! NOTES */
/* ! ============================= */

.notes-card {
  padding: 4px 13px;

  border: 1px solid var(--ion-color-step-150);
  border-radius: 16px;

  background: var(--ion-item-background, var(--ion-background-color));
}

.notes-card ion-textarea {
  --color: var(--ion-text-color);
  --placeholder-color: var(--ion-color-medium);

  --padding-top: 10px;
  --padding-bottom: 10px;

  font-size: 14px;
}

/* ! ============================= */
/* ! SAVE */
/* ! ============================= */

.save-button {
  --border-radius: 15px;
  --color: #ffffff;

  height: 54px;

  margin: 8px 0 0;

  font-size: 15px;
  font-weight: 700;
}

.secure-note {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 5px;

  margin: 13px 0 0;

  color: var(--ion-color-medium);

  font-size: 11px;
  text-align: center;
}

.secure-note ion-icon {
  font-size: 13px;
}

/* ! ============================= */
/* ! DATE PICKER */
/* ! ============================= */

.date-picker-modal {
  --background: var(--ion-background-color);
}

.date-picker-modal ion-toolbar {
  --background: var(--ion-background-color);
  --color: var(--ion-text-color);
}

.date-picker-modal ion-content {
  --background: var(--ion-background-color);
}

.date-picker-modal ion-datetime {
  --background: var(--ion-background-color);
  --ion-color-step-50: var(--ion-color-step-50);
  color: var(--ion-text-color);
}

/* ! ============================= */
/* ! DARK MODE */
/* ! ============================= */

@media (prefers-color-scheme: dark) {
  .option-icon.owe {
    color: #fbbf24;
    background: rgba(251, 191, 36, 0.12);
  }

  .option-icon.owed {
    color: #4ade80;
    background: rgba(74, 222, 128, 0.12);
  }

  .direction-option.active,
  .type-option.active {
    background: rgba(var(--ion-color-primary-rgb), 0.12);
  }
}
</style>

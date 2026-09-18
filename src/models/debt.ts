export type DebtDirection = "owe" | "owed_to_me";

export type DebtType = "one_time" | "recurring" | "no_due_date";

export type DebtStatus = "active" | "completed";

export type RecurrenceFrequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "yearly"
  | "custom";

export interface DebtRecurrence {
  frequency: RecurrenceFrequency;
  interval?: number;
  nextDueDate: string;
  endDate?: string;
}

export interface DebtPayment {
  id: string;
  amount: number;
  paidAt: string;
  note?: string;
}

export interface Debt {
  id: string;

  name: string;
  person?: string;

  direction: DebtDirection;
  type: DebtType;

  originalAmount: number;
  remainingAmount: number;

  dueDate?: string;

  recurrence?: DebtRecurrence;

  payments: DebtPayment[];

  status: DebtStatus;

  notes?: string;

  createdAt: string;
  updatedAt: string;
}

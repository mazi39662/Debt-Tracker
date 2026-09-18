import type { Debt } from "@/models/debt";

const DEBTS_KEY = "debt_tracker_debts";

export const storageService = {
  // ! Get all debts from localStorage.
  getDebts(): Debt[] {
    const data = localStorage.getItem(DEBTS_KEY);

    // ? No saved data yet.
    if (!data) {
      return [];
    }

    try {
      return JSON.parse(data) as Debt[];
    } catch (error) {
      console.error("Failed to parse debts:", error);

      return [];
    }
  },

  // ! Save all debts to localStorage.
  saveDebts(debts: Debt[]): void {
    localStorage.setItem(DEBTS_KEY, JSON.stringify(debts));
  },

  // ! Delete all saved debts.
  clearDebts(): void {
    localStorage.removeItem(DEBTS_KEY);
  },
};

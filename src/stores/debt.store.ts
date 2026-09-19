import { computed, ref } from "vue";
import { defineStore } from "pinia";

import type { Debt, DebtPayment } from "@/models/debt";

import { storageService } from "@/services/storage.service";

export const useDebtStore = defineStore("debt", () => {
  const debts = ref<Debt[]>([]);

  // ! Load all debts from localStorage.
  function loadDebts(): void {
    const savedDebts = storageService.getDebts();

    // ! Make sure every debt has a payments array.
    debts.value = savedDebts.map((debt) => ({
      ...debt,
      payments: debt.payments ?? [],
    }));

    // ! Save migrated debt data.
    storageService.saveDebts(debts.value);
  }

  // ! Create a new debt.
  function addDebt(debt: Debt): void {
    // ! Always initialize payment history.
    debt.payments = debt.payments ?? [];

    debts.value.push(debt);

    storageService.saveDebts(debts.value);
  }

  // ! Read a single debt.
  function getDebtById(id: string): Debt | undefined {
    return debts.value.find((debt) => debt.id === id);
  }

  // ! Update an existing debt.
  function updateDebt(updatedDebt: Debt): void {
    const index = debts.value.findIndex((debt) => debt.id === updatedDebt.id);

    // ? Stop if the debt does not exist.
    if (index === -1) {
      return;
    }

    debts.value[index] = {
      ...updatedDebt,
      payments: updatedDebt.payments ?? [],
      updatedAt: new Date().toISOString(),
    };

    storageService.saveDebts(debts.value);
  }

  // ! Delete a debt.
  function deleteDebt(id: string): void {
    debts.value = debts.value.filter((debt) => debt.id !== id);

    storageService.saveDebts(debts.value);
  }

  // ! Record a payment.
  function recordPayment(debtId: string, amount: number, note?: string): void {
    const debt = getDebtById(debtId);

    // ? Invalid debt.
    if (!debt) {
      return;
    }

    // ? Invalid payment amount.
    if (amount <= 0) {
      return;
    }

    // ! Make sure payment history exists.
    if (!debt.payments) {
      debt.payments = [];
    }

    // ! Prevent payment from exceeding the balance.
    const paymentAmount = Math.min(amount, debt.remainingAmount);

    const payment: DebtPayment = {
      id: crypto.randomUUID(),
      amount: paymentAmount,
      paidAt: new Date().toISOString(),
      note,
    };

    // ! Add payment to this debt's history.
    debt.payments.push(payment);

    // ! Reduce remaining balance.
    debt.remainingAmount = Math.max(0, debt.remainingAmount - paymentAmount);

    // ! Mark debt completed when fully paid.
    if (debt.remainingAmount === 0) {
      debt.status = "completed";
    }

    debt.updatedAt = new Date().toISOString();

    // ! Persist payment history.
    storageService.saveDebts(debts.value);
  }

  // ! Delete a single payment from a debt.
  function deletePayment(debtId: string, paymentId: string): void {
    const debt = getDebtById(debtId);

    // ? Stop if the debt does not exist.
    if (!debt) {
      return;
    }

    const payment = debt.payments?.find((item) => item.id === paymentId);

    // ? Stop if the payment does not exist.
    if (!payment) {
      return;
    }

    // ! Remove the payment from payment history.
    debt.payments = debt.payments.filter((item) => item.id !== paymentId);

    // ! Restore the payment amount to the remaining debt balance.
    debt.remainingAmount = Math.min(
      debt.originalAmount,
      debt.remainingAmount + payment.amount,
    );

    // ! A debt with a restored balance becomes active again.
    if (debt.remainingAmount > 0) {
      debt.status = "active";
    }

    debt.updatedAt = new Date().toISOString();

    // ! Save the updated debt data.
    storageService.saveDebts(debts.value);
  }

  // ! Delete multiple payments at once.
  function deletePayments(
    paymentsToDelete: Array<{
      debtId: string;
      paymentId: string;
    }>,
  ): void {
    paymentsToDelete.forEach(({ debtId, paymentId }) => {
      const debt = getDebtById(debtId);

      // ? Skip if the debt does not exist.
      if (!debt) {
        return;
      }

      const payment = debt.payments?.find((item) => item.id === paymentId);

      // ? Skip if the payment does not exist.
      if (!payment) {
        return;
      }

      // ! Remove the payment.
      debt.payments = debt.payments.filter((item) => item.id !== paymentId);

      // ! Restore the payment amount to the debt.
      debt.remainingAmount = Math.min(
        debt.originalAmount,
        debt.remainingAmount + payment.amount,
      );

      // ! Reopen the debt if it now has a remaining balance.
      if (debt.remainingAmount > 0) {
        debt.status = "active";
      }

      debt.updatedAt = new Date().toISOString();
    });

    // ! Save once after all payments have been removed.
    storageService.saveDebts(debts.value);
  }

  // ! Get every payment from every debt.
  const paymentHistory = computed(() => {
    return debts.value
      .flatMap((debt) => {
        // ? Skip debts without payments.
        if (!debt.payments || debt.payments.length === 0) {
          return [];
        }

        return debt.payments.map((payment) => ({
          ...payment,
          debtId: debt.id,
          debtName: debt.name,
          person: debt.person,
          direction: debt.direction,
        }));
      })
      .sort(
        (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime(),
      );
  });

  // ! Total amount the user currently owes.
  const totalOwed = computed(() => {
    return debts.value
      .filter((debt) => debt.direction === "owe" && debt.status === "active")
      .reduce((total, debt) => total + debt.remainingAmount, 0);
  });

  // ! Total amount other people owe the user.
  const totalOwedToMe = computed(() => {
    return debts.value
      .filter(
        (debt) => debt.direction === "owed_to_me" && debt.status === "active",
      )
      .reduce((total, debt) => total + debt.remainingAmount, 0);
  });

  return {
    debts,

    totalOwed,
    totalOwedToMe,
    paymentHistory,

    loadDebts,
    addDebt,
    getDebtById,
    updateDebt,
    deleteDebt,
    recordPayment,
    deletePayment,
    deletePayments,
  };
});

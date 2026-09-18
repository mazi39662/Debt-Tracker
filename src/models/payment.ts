export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

export interface Bill {
    _id: string;
    userId: string;
    name: string;
    amount: number;
    dueDate: Date;
    recurrence: BillRecurrence;
    category: string;
    isAutoPay: boolean;
    reminderDays: number[];
    lastPaidDate?: Date;
    nextDueDate: Date;
    isActive: boolean;
    createdAt: Date;
}
export interface BillRecurrence {
    type: 'monthly' | 'weekly' | 'yearly' | 'custom';
    interval: number;
    endDate?: Date;
}
export interface BillData {
    name: string;
    amount: number;
    dueDate: Date;
    recurrence: BillRecurrence;
    category: string;
    isAutoPay?: boolean;
    reminderDays?: number[];
}
export interface BillPayment {
    _id: string;
    billId: string;
    userId: string;
    amount: number;
    paidDate: Date;
    transactionId?: string;
    method: PaymentMethod;
    notes?: string;
}
export type PaymentMethod = 'auto' | 'manual' | 'detected';
export interface UpcomingBill {
    billId: string;
    name: string;
    amount: number;
    dueDate: Date;
    daysUntilDue: number;
    isOverdue: boolean;
    category: string;
}
//# sourceMappingURL=bill.types.d.ts.map
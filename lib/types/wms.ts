export interface Batch {
  id: string;
  batchCode: string;
  expirationDate: string;
  quantity: number;
  createdAt: string;
}

export interface Product {
  id: string;
  internalCode: string;
  name: string;
  unitWeight?: number;
  createdAt: string;
  batches: Batch[];
  totalQuantity?: number;
  lastEntry?: string;
}

export interface MovementLog {
  id: string;
  type: "ENTRADA" | "SAÍDA";
  quantity: number;
  reason: string | null;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    internalCode?: string;
  };
}

export type BatchExpiryStatus = "ok" | "expiring" | "expired";

export function getBatchExpiryStatus(
  expirationDate: Date | string,
  daysWarning = 30
): BatchExpiryStatus {
  const exp = typeof expirationDate === "string" ? new Date(expirationDate) : expirationDate;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expDay = new Date(exp);
  expDay.setHours(0, 0, 0, 0);
  if (expDay < now) return "expired";
  const warn = new Date(now);
  warn.setDate(warn.getDate() + daysWarning);
  if (expDay <= warn) return "expiring";
  return "ok";
}

const STORAGE_KEY = "wms_warehouse_max_capacity";
const DEFAULT_MAX = 10000;

export function getWarehouseMaxCapacity(): number {
  if (typeof window === "undefined") return DEFAULT_MAX;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_MAX;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX;
  } catch {
    return DEFAULT_MAX;
  }
}

export function setWarehouseMaxCapacity(value: number): void {
  if (typeof window === "undefined") return;
  const n = Math.max(1, Math.floor(value));
  localStorage.setItem(STORAGE_KEY, String(n));
}

export { DEFAULT_MAX as WAREHOUSE_DEFAULT_MAX };

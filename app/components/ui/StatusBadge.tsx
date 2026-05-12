import type { BatchExpiryStatus } from "@/lib/types/wms";

interface StatusBadgeProps {
  status: BatchExpiryStatus | "entrada" | "saida";
  label?: string;
}

const styles: Record<string, string> = {
  ok: "border-[#009B8F]/30 bg-[#009B8F]/10 text-[#006b63]",
  expiring:
    "border-[#F59E0B]/35 bg-amber-50 text-amber-900",
  expired: "border-[#E11D48]/30 bg-rose-50 text-[#BE123C]",
  entrada: "border-[#009B8F]/30 bg-[#009B8F]/10 text-[#006b63]",
  saida: "border-[#E11D48]/30 bg-rose-50 text-[#BE123C]",
};

const defaultLabels: Record<string, string> = {
  ok: "OK",
  expiring: "Vencendo",
  expired: "Vencido",
  entrada: "Entrada",
  saida: "Saída",
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const text = label ?? defaultLabels[status] ?? status;
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${styles[status] ?? "border-[#D8E0EA] bg-slate-50 text-[#475569]"}`}
    >
      {text}
    </span>
  );
}

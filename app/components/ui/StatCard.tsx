import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  accent?: "teal" | "sky" | "amber" | "rose";
}

const accentMap = {
  teal: "text-[#009B8F]",
  sky: "text-[#0EA5E9]",
  amber: "text-[#F59E0B]",
  rose: "text-[#E11D48]",
};

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "teal",
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-[#D8E0EA] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
            {label}
          </p>
          <p
            className={`mt-2 text-3xl font-semibold tabular-nums tracking-tight ${accentMap[accent]}`}
          >
            {value}
          </p>
          {hint ? (
            <p className="mt-2 text-xs text-[#475569]">{hint}</p>
          ) : null}
        </div>
        {Icon ? (
          <div className="rounded-lg border border-[#D8E0EA] bg-[#F6F8FB] p-2.5 text-[#475569]">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        ) : null}
      </div>
    </div>
  );
}

"use client";

type OperationalStatus = "ok" | "attention" | "offline";

const statusConfig: Record<
  OperationalStatus,
  { label: string; dot: string; ring: string }
> = {
  ok: {
    label: "Operacional",
    dot: "bg-[#009B8F]",
    ring: "ring-[#009B8F]/40",
  },
  attention: {
    label: "Atenção",
    dot: "bg-[#F59E0B]",
    ring: "ring-[#F59E0B]/40",
  },
  offline: {
    label: "Indisponível",
    dot: "bg-slate-500",
    ring: "ring-slate-500/30",
  },
};

interface HeaderProps {
  title: string;
  subtitle?: string;
  status?: OperationalStatus;
}

export default function Header({
  title,
  subtitle,
  status = "ok",
}: HeaderProps) {
  const cfg = statusConfig[status];

  return (
    <header className="flex flex-col gap-4 border-b border-[#D8E0EA] bg-[#0F172A] px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-slate-700/80 bg-slate-900/50 px-4 py-2.5">
        <span
          className={`relative flex h-2.5 w-2.5 shrink-0 rounded-full ${cfg.dot} ring-2 ${cfg.ring}`}
          aria-hidden
        />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-300">Status</span>
          <span className="font-medium text-white">{cfg.label}</span>
        </div>
      </div>
    </header>
  );
}

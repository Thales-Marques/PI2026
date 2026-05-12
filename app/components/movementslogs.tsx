"use client";

interface Log {
  id: string;
  type: "ENTRADA" | "SAÍDA";
  quantity: number;
  reason: string | null;
  createdAt: string;
  product?: {
    name: string;
  };
}

export default function MovementLogs({ logs }: { logs: Log[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#D8E0EA] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#D8E0EA] bg-[#F6F8FB] px-4 py-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
          Histórico recente
        </h2>
        <span className="text-[10px] text-[#475569]">Últimos 50 eventos</span>
      </div>

      <div className="max-h-96 overflow-y-auto bg-white font-mono text-[11px]">
        {logs.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#475569]">
            Nenhuma movimentação registrada.
          </p>
        ) : (
          logs.map((log) => {
            let style =
              "border-l-[#D8E0EA] bg-white text-[#0F172A]";

            if (
              log.reason?.includes("Registro Inicial") ||
              log.reason?.includes("FIFO")
            ) {
              style = "border-l-[#0EA5E9] bg-sky-50/80 text-[#0F172A]";
            } else if (log.type === "ENTRADA") {
              style = "border-l-[#009B8F] bg-[#009B8F]/8 text-[#0F172A]";
            } else if (log.type === "SAÍDA") {
              style = "border-l-[#E11D48] bg-rose-50/80 text-[#0F172A]";
            }

            return (
              <div
                key={log.id}
                className={`flex items-center justify-between border-b border-[#E8EEF4] border-l-4 px-3 py-2.5 transition-colors hover:bg-[#F6F8FB] ${style}`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="shrink-0 font-semibold text-[#475569]">
                    {new Date(log.createdAt).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-semibold uppercase tracking-wide text-[11px]">
                      {log.product?.name ?? "Item desconhecido"}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] italic text-[#475569]">
                      {log.reason ?? "—"}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 pl-2">
                  <span className="text-[9px] font-semibold uppercase text-[#475569]">
                    {log.type}
                  </span>
                  <span className="w-12 text-right text-sm font-semibold tabular-nums">
                    {log.type === "ENTRADA" ? "+" : "−"}
                    {log.quantity}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

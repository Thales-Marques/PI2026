"use client";

import { useCallback, useEffect, useState } from "react";
import MovementScanner from "@/app/components/movementscanner";
import MovementLogs from "@/app/components/movementslogs";
import type { MovementLog } from "@/lib/types/wms";

export default function FluxoPage() {
  const [logs, setLogs] = useState<MovementLog[]>([]);
  const [banner, setBanner] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/movements");
      if (res.ok) setLogs(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <MovementScanner
          onAction={refresh}
          onNotify={(type, text) => {
            setBanner({ type, text });
            if (type === "ok") {
              window.setTimeout(() => setBanner(null), 4000);
            }
          }}
        />
        {banner ? (
          <div
            role="status"
            className={`rounded-xl border px-4 py-3 text-sm ${
              banner.type === "ok"
                ? "border-[#009B8F]/30 bg-[#009B8F]/10 text-[#006b63]"
                : "border-[#E11D48]/30 bg-rose-50 text-[#BE123C]"
            }`}
          >
            {banner.text}
          </div>
        ) : null}
      </div>
      <div className="lg:col-span-3">
        <MovementLogs logs={logs} />
      </div>
    </div>
  );
}

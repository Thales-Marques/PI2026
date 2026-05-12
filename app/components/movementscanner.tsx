"use client";

import { useState } from "react";

interface MovementScannerProps {
  onAction: () => void;
  onNotify?: (type: "ok" | "err", message: string) => void;
}

export default function MovementScanner({
  onAction,
  onNotify,
}: MovementScannerProps) {
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);

  const notify = (type: "ok" | "err", message: string) => {
    if (onNotify) {
      onNotify(type, message);
      return;
    }
    if (type === "err") window.alert(message);
  };

  const handleMovement = async (type: "ENTRADA" | "SAÍDA") => {
    if (!barcode.trim()) return;

    setLoading(true);
    try {
      let quantity = 1;
      let sku = barcode.trim();

      if (barcode.includes("x") || barcode.includes("X")) {
        const parts = barcode.toLowerCase().split("x");
        quantity = parseInt(parts[0], 10);
        sku = parts[1]?.trim() ?? "";

        if (Number.isNaN(quantity) || !sku) {
          notify(
            "err",
            "Formato inválido. Use: QuantidadexSKU (ex.: 12x789451)."
          );
          setLoading(false);
          return;
        }
      }

      const response = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku,
          quantity,
          type,
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (response.ok) {
        setBarcode("");
        onAction();
        notify(
          "ok",
          type === "ENTRADA"
            ? `Entrada registrada: +${quantity} un.`
            : `Saída registrada: −${quantity} un.`
        );
      } else {
        notify("err", result.error ?? "Erro ao processar movimentação.");
      }
    } catch {
      notify("err", "Erro de conexão com o terminal.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleMovement("ENTRADA");
    }
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-[#0F172A] p-6 shadow-lg">
      <div className="mb-4 flex items-center gap-2">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#009B8F] opacity-40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#009B8F]" />
        </span>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Terminal / scanner
        </h2>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Bipe ou digite 12xSKU…"
            className="w-full rounded-xl border-2 border-slate-700 bg-slate-900/80 p-4 font-mono text-lg text-[#34D399] outline-none transition placeholder:text-slate-600 focus:border-[#009B8F]"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            disabled={loading}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase text-slate-600">
            Aguardando
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleMovement("ENTRADA")}
            disabled={loading}
            className="rounded-xl bg-[#009B8F] py-3.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#008577] disabled:opacity-50"
          >
            {loading ? "…" : "Entrada"}
          </button>

          <button
            type="button"
            onClick={() => handleMovement("SAÍDA")}
            disabled={loading}
            className="rounded-xl bg-[#E11D48] py-3.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#BE123C] disabled:opacity-50"
          >
            {loading ? "…" : "Saída"}
          </button>
        </div>

        <p className="text-center text-[10px] leading-relaxed text-slate-500">
          Enter confirma como entrada. Múltiplas unidades:{" "}
          <span className="font-mono text-slate-400">quantidadexSKU</span>.
          Saída usa FIFO pela validade mais próxima.
        </p>
      </div>
    </div>
  );
}

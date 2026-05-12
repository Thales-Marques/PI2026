"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Package, Boxes, Scale } from "lucide-react";
import StatCard from "@/app/components/ui/StatCard";
import MovementLogs from "@/app/components/movementslogs";
import StockChart from "@/app/components/stockchart";
import type { Product, MovementLog } from "@/lib/types/wms";
import { getBatchExpiryStatus } from "@/lib/types/wms";
import {
  getWarehouseMaxCapacity,
  WAREHOUSE_DEFAULT_MAX,
} from "@/lib/warehouse-storage";

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<MovementLog[]>([]);
  const [maxCap, setMaxCap] = useState(WAREHOUSE_DEFAULT_MAX);

  const load = useCallback(async () => {
    try {
      const [resP, resL] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/movements"),
      ]);
      if (resP.ok) setProducts(await resP.json());
      if (resL.ok) setLogs(await resL.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    setMaxCap(getWarehouseMaxCapacity());
    load();
  }, [load]);

  const stats = useMemo(() => {
    let totalQty = 0;
    let batchCount = 0;
    let expired = 0;
    let expiring = 0;
    let totalWeightKg = 0;

    for (const p of products) {
      const w = p.unitWeight ?? 0;
      for (const b of p.batches ?? []) {
        batchCount += 1;
        totalQty += b.quantity;
        totalWeightKg += b.quantity * w;
        const st = getBatchExpiryStatus(b.expirationDate);
        if (st === "expired") expired += 1;
        else if (st === "expiring") expiring += 1;
      }
    }

    const pct =
      maxCap > 0 ? Math.min(100, (totalQty / maxCap) * 100) : 0;

    return {
      itemCount: products.length,
      totalQty,
      batchCount,
      expired,
      expiring,
      totalWeightKg,
      pct,
    };
  }, [products, maxCap]);

  const alerts: string[] = [];
  if (stats.expired > 0) {
    alerts.push(`${stats.expired} lote(s) com validade vencida — priorize baixa ou segregação.`);
  }
  if (stats.expiring > 0) {
    alerts.push(`${stats.expiring} lote(s) com validade nos próximos 30 dias.`);
  }
  if (stats.pct >= 90) {
    alerts.push("Ocupação do armazém acima de 90% — avalie expansão ou saídas.");
  } else if (stats.pct >= 75) {
    alerts.push("Ocupação elevada (≥75%) — monitore capacidade.");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Itens cadastrados"
          value={stats.itemCount}
          icon={Package}
          accent="sky"
        />
        <StatCard
          label="Quantidade em estoque"
          value={stats.totalQty}
          hint="Soma de todos os lotes"
          accent="teal"
        />
        <StatCard
          label="Lotes"
          value={stats.batchCount}
          icon={Boxes}
          accent="sky"
        />
        <StatCard
          label="Peso estimado (kg)"
          value={
            stats.totalWeightKg > 0
              ? stats.totalWeightKg.toFixed(1)
              : "—"
          }
          hint="Quantidade × peso unitário"
          icon={Scale}
          accent="teal"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-[#D8E0EA] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#0F172A]">
              Capacidade do armazém
            </h2>
            <p className="mt-1 text-xs text-[#475569]">
              Limite configurado em Armazém (local). Ocupação:{" "}
              <span className="font-medium text-[#0EA5E9]">
                {stats.pct.toFixed(1)}%
              </span>{" "}
              ({stats.totalQty} / {maxCap} un.)
            </p>
            <div className="mt-4 max-w-xs">
              <StockChart totalItems={stats.totalQty} maxCapacity={maxCap} />
            </div>
          </div>

          <div className="rounded-xl border border-[#D8E0EA] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#0F172A]">
              Lotes por validade
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-[#D8E0EA] bg-[#F6F8FB] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase text-[#475569]">
                  Vencidos
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#E11D48]">
                  {stats.expired}
                </p>
              </div>
              <div className="rounded-lg border border-[#D8E0EA] bg-[#F6F8FB] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase text-[#475569]">
                  Vencendo (30d)
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#F59E0B]">
                  {stats.expiring}
                </p>
              </div>
              <div className="rounded-lg border border-[#D8E0EA] bg-[#F6F8FB] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase text-[#475569]">
                  OK
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#009B8F]">
                  {Math.max(0, stats.batchCount - stats.expired - stats.expiring)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#D8E0EA] bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
              <AlertTriangle className="h-4 w-4 text-[#F59E0B]" aria-hidden />
              Alertas operacionais
            </h2>
            {alerts.length === 0 ? (
              <p className="text-sm text-[#475569]">
                Nenhum alerta crítico no momento.
              </p>
            ) : (
              <ul className="list-inside list-disc space-y-2 text-sm text-[#475569]">
                {alerts.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="min-h-0">
          <MovementLogs logs={logs} />
        </div>
      </div>
    </div>
  );
}

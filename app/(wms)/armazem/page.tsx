"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import StatCard from "@/app/components/ui/StatCard";
import StockChart from "@/app/components/stockchart";
import type { Product } from "@/lib/types/wms";
import {
  getWarehouseMaxCapacity,
  setWarehouseMaxCapacity,
  WAREHOUSE_DEFAULT_MAX,
} from "@/lib/warehouse-storage";

export default function ArmazemPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [maxCap, setMaxCap] = useState(WAREHOUSE_DEFAULT_MAX);
  const [deltaInput, setDeltaInput] = useState("500");

  const loadProducts = useCallback(async () => {
    const res = await fetch("/api/products");
    if (res.ok) setProducts(await res.json());
  }, []);

  useEffect(() => {
    setMaxCap(getWarehouseMaxCapacity());
    loadProducts();
  }, [loadProducts]);

  const usedUnits = useMemo(
    () =>
      products.reduce(
        (acc, p) =>
          acc + (p.batches ?? []).reduce((a, b) => a + b.quantity, 0),
        0
      ),
    [products]
  );

  const totalWeightKg = useMemo(() => {
    let t = 0;
    for (const p of products) {
      const w = p.unitWeight ?? 0;
      for (const b of p.batches ?? []) t += b.quantity * w;
    }
    return t;
  }, [products]);

  const pct = maxCap > 0 ? Math.min(100, (usedUnits / maxCap) * 100) : 0;

  const adjust = (delta: number) => {
    const next = Math.max(usedUnits, maxCap + delta);
    setMaxCap(next);
    setWarehouseMaxCapacity(next);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Capacidade máxima (un.)"
          value={maxCap}
          hint="Persistido no navegador (localStorage) — conceito demonstrativo."
          accent="sky"
        />
        <StatCard
          label="Capacidade utilizada"
          value={usedUnits}
          hint={`${pct.toFixed(1)}% do limite`}
          accent="teal"
        />
      </div>

      <div className="rounded-xl border border-[#D8E0EA] bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#0F172A]">Ocupação</h2>
        <p className="mt-1 text-xs text-[#475569]">
          O mínimo ajustável é igual ao estoque atual ({usedUnits} un.), para
          não sugerir capacidade abaixo do já armazenado.
        </p>
        <div className="mt-6 max-w-sm">
          <StockChart totalItems={usedUnits} maxCapacity={maxCap} />
        </div>
        <div className="mt-6 grid gap-3 border-t border-[#E8EEF4] pt-6 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase text-[#475569]">
              Peso total estimado
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#0F172A]">
              {totalWeightKg > 0 ? `${totalWeightKg.toFixed(1)} kg` : "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase text-[#475569]">
              Margem livre
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#0EA5E9]">
              {Math.max(0, maxCap - usedUnits)} un.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#D8E0EA] bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#0F172A]">
          Ajustar capacidade
        </h2>
        <p className="mt-1 text-xs text-[#475569]">
          Incremento/decremento em unidades. Valor padrão sugerido: 500.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#475569]">
              Passo (un.)
            </label>
            <input
              type="number"
              min={1}
              className="w-32 rounded-lg border border-[#D8E0EA] px-3 py-2 text-sm outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
              value={deltaInput}
              onChange={(e) => setDeltaInput(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="rounded-lg bg-[#009B8F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008577]"
            onClick={() => {
              const d = Number.parseInt(deltaInput, 10);
              if (Number.isFinite(d) && d > 0) adjust(d);
            }}
          >
            Aumentar capacidade
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#D8E0EA] bg-white px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F6F8FB]"
            onClick={() => {
              const d = Number.parseInt(deltaInput, 10);
              if (Number.isFinite(d) && d > 0) adjust(-d);
            }}
          >
            Diminuir capacidade
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#D8E0EA] px-4 py-2 text-sm text-[#475569] hover:bg-[#F6F8FB]"
            onClick={() => {
              const next = Math.max(usedUnits, WAREHOUSE_DEFAULT_MAX);
              setMaxCap(next);
              setWarehouseMaxCapacity(next);
            }}
          >
            Restaurar padrão (10k)
          </button>
        </div>
      </div>
    </div>
  );
}

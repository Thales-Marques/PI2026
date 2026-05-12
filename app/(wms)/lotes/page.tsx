"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableTd,
  DataTableTh,
} from "@/app/components/ui/DataTable";
import StatusBadge from "@/app/components/ui/StatusBadge";
import type { Product } from "@/lib/types/wms";
import { getBatchExpiryStatus } from "@/lib/types/wms";

type Row = {
  batchId: string;
  batchCode: string;
  sku: string;
  itemName: string;
  quantity: number;
  expirationDate: string;
  status: ReturnType<typeof getBatchExpiryStatus>;
  productId: string;
  unitWeight: number;
};

export default function LotesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/products");
    if (res.ok) setProducts(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    const out: Row[] = [];
    for (const p of products) {
      const w = p.unitWeight ?? 0;
      for (const b of p.batches ?? []) {
        out.push({
          batchId: b.id,
          batchCode: b.batchCode,
          sku: p.internalCode,
          itemName: p.name,
          quantity: b.quantity,
          expirationDate: b.expirationDate,
          status: getBatchExpiryStatus(b.expirationDate),
          productId: p.id,
          unitWeight: w,
        });
      }
    }
    return out.sort(
      (a, b) =>
        new Date(a.expirationDate).getTime() -
        new Date(b.expirationDate).getTime()
    );
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.batchCode.toLowerCase().includes(q) ||
        r.sku.toLowerCase().includes(q) ||
        r.itemName.toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <input
        type="search"
        placeholder="Buscar por lote, SKU ou nome do item..."
        className="w-full rounded-xl border border-[#D8E0EA] bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DataTable>
        <table className="w-full min-w-[720px] border-collapse text-left">
          <DataTableHead>
            <DataTableTh>Lote</DataTableTh>
            <DataTableTh>SKU</DataTableTh>
            <DataTableTh>Item</DataTableTh>
            <DataTableTh className="text-right">Qtd</DataTableTh>
            <DataTableTh className="text-right">Peso lote (kg)</DataTableTh>
            <DataTableTh>Validade</DataTableTh>
            <DataTableTh>Status</DataTableTh>
            <DataTableTh className="text-center">Item</DataTableTh>
          </DataTableHead>
          <DataTableBody>
            {filtered.map((r) => {
              const lotWeight =
                r.unitWeight > 0
                  ? (r.quantity * r.unitWeight).toFixed(2)
                  : "—";
              return (
                <DataTableRow
                  key={r.batchId}
                  className={
                    r.status === "expired"
                      ? "bg-rose-50/40"
                      : r.status === "expiring"
                        ? "bg-amber-50/30"
                        : ""
                  }
                >
                  <DataTableTd className="font-mono text-sm font-medium">
                    {r.batchCode}
                  </DataTableTd>
                  <DataTableTd className="font-mono text-sm text-[#009B8F]">
                    {r.sku}
                  </DataTableTd>
                  <DataTableTd className="font-medium">{r.itemName}</DataTableTd>
                  <DataTableTd className="text-right tabular-nums">
                    {r.quantity}
                  </DataTableTd>
                  <DataTableTd className="text-right tabular-nums text-[#475569]">
                    {lotWeight}
                  </DataTableTd>
                  <DataTableTd className="text-[#475569]">
                    {format(new Date(r.expirationDate), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </DataTableTd>
                  <DataTableTd>
                    <StatusBadge status={r.status} />
                  </DataTableTd>
                  <DataTableTd className="text-center">
                    <Link
                      href={`/itens?produto=${r.productId}`}
                      className="text-xs font-semibold text-[#0EA5E9] hover:underline"
                    >
                      Ver item
                    </Link>
                  </DataTableTd>
                </DataTableRow>
              );
            })}
          </DataTableBody>
        </table>
      </DataTable>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-[#475569]">
          Nenhum lote encontrado para o filtro atual.
        </p>
      ) : null}
    </div>
  );
}

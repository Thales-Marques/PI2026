"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BatchModal from "@/app/components/batchmodal";
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableTd,
  DataTableTh,
} from "@/app/components/ui/DataTable";
import type { Product, BatchExpiryStatus } from "@/lib/types/wms";
import { getBatchExpiryStatus } from "@/lib/types/wms";

function ItensPageInner() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("produto");

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  const [formData, setFormData] = useState({
    internalCode: "",
    name: "",
    batchCode: "",
    expirationDate: "",
    quantity: "",
    unitWeight: "",
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) setProducts(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!highlightId) return;
    const el = rowRefs.current[highlightId];
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [highlightId, products]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const inName = p.name.toLowerCase().includes(q);
      const inSku = p.internalCode.toLowerCase().includes(q);
      const inBatch = (p.batches ?? []).some((b) =>
        b.batchCode.toLowerCase().includes(q)
      );
      return inName || inSku || inBatch;
    });
  }, [products, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          internalCode: formData.internalCode,
          batchCode: formData.batchCode,
          expirationDate: formData.expirationDate,
          quantity: formData.quantity,
          unitWeight:
            formData.unitWeight === "" ? undefined : formData.unitWeight,
        }),
      });

      if (res.ok) {
        setFormData({
          internalCode: "",
          name: "",
          batchCode: "",
          expirationDate: "",
          quantity: "",
          unitWeight: "",
        });
        setFormFeedback({ type: "ok", text: "Cadastro registrado com sucesso." });
        await refresh();
      } else {
        setFormFeedback({
          type: "err",
          text: "Não foi possível concluir o cadastro.",
        });
      }
    } catch {
      setFormFeedback({ type: "err", text: "Falha de conexão com o servidor." });
    }
  };

  const deleteProduct = async (id: string) => {
    if (!id) return;
    if (!confirm("Remover este item e todos os seus lotes?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        await refresh();
        setFormFeedback({ type: "ok", text: "Item removido." });
      } else {
        let message = "Não foi possível excluir.";
        try {
          const err = await res.json();
          if (err?.error) message = err.error;
        } catch {
          message = `Erro ${res.status}`;
        }
        setFormFeedback({ type: "err", text: message });
      }
    } catch {
      setFormFeedback({ type: "err", text: "Falha de conexão ao excluir." });
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
      <div className="lg:w-[380px] lg:shrink-0">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-[#D8E0EA] bg-white p-6 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-[#0F172A]">
            Novo item / lote
          </h2>
          <p className="text-xs text-[#475569]">
            O POST existente é mantido: cria ou atualiza o produto pelo SKU e
            adiciona um lote.
          </p>

          {formFeedback ? (
            <div
              role="status"
              className={`rounded-lg border px-3 py-2 text-sm ${
                formFeedback.type === "ok"
                  ? "border-[#009B8F]/30 bg-[#009B8F]/10 text-[#006b63]"
                  : "border-[#E11D48]/30 bg-rose-50 text-[#BE123C]"
              }`}
            >
              {formFeedback.text}
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-xs font-medium text-[#475569]">
              SKU
            </label>
            <input
              required
              placeholder="Ex.: 789451"
              className="w-full rounded-lg border border-[#D8E0EA] bg-white px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
              value={formData.internalCode}
              onChange={(e) =>
                setFormData({ ...formData, internalCode: e.target.value })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#475569]">
              Nome do item
            </label>
            <input
              required
              placeholder="Descrição"
              className="w-full rounded-lg border border-[#D8E0EA] px-3 py-2.5 text-sm placeholder:text-slate-400 outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#475569]">
              Código do lote
            </label>
            <input
              required
              placeholder="Lote"
              className="w-full rounded-lg border border-[#D8E0EA] px-3 py-2.5 text-sm placeholder:text-slate-400 outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
              value={formData.batchCode}
              onChange={(e) =>
                setFormData({ ...formData, batchCode: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#475569]">
                Validade
              </label>
              <input
                type="date"
                required
                className="w-full rounded-lg border border-[#D8E0EA] px-3 py-2.5 text-sm outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
                value={formData.expirationDate}
                onChange={(e) =>
                  setFormData({ ...formData, expirationDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#475569]">
                Quantidade
              </label>
              <input
                type="number"
                min={1}
                required
                placeholder="0"
                className="w-full rounded-lg border border-[#D8E0EA] px-3 py-2.5 text-sm placeholder:text-slate-400 outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#475569]">
              Peso unitário (kg)
            </label>
            <input
              type="number"
              min={0}
              step="0.001"
              placeholder="0 opcional"
              className="w-full rounded-lg border border-[#D8E0EA] px-3 py-2.5 text-sm placeholder:text-slate-400 outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
              value={formData.unitWeight}
              onChange={(e) =>
                setFormData({ ...formData, unitWeight: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-[#009B8F] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#008577]"
          >
            Confirmar cadastro
          </button>
        </form>
      </div>

      <div className="min-w-0 flex-1 space-y-4">
        <div>
          <input
            type="search"
            placeholder="Buscar por nome, SKU ou lote..."
            className="w-full rounded-xl border border-[#D8E0EA] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder:text-slate-400 shadow-sm outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <DataTable>
          <table className="w-full min-w-[520px] table-fixed border-collapse text-left">
            <DataTableHead>
              <DataTableTh className="w-[22%]">SKU</DataTableTh>
              <DataTableTh>Item</DataTableTh>
              <DataTableTh className="w-[18%]">Saldo</DataTableTh>
              <DataTableTh className="w-[14%] text-center">Lotes</DataTableTh>
              <DataTableTh className="w-[120px] text-center">Ações</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {filtered.map((p) => {
                const worst = (p.batches ?? []).reduce<BatchExpiryStatus>(
                  (acc, b) => {
                    const s = getBatchExpiryStatus(b.expirationDate);
                    if (s === "expired") return "expired";
                    if (s === "expiring" && acc !== "expired") return "expiring";
                    return acc;
                  },
                  "ok"
                );
                const rowHighlight = highlightId === p.id;
                return (
                  <DataTableRow
                    key={p.id}
                    ref={(el) => {
                      rowRefs.current[p.id] = el;
                    }}
                    className={`cursor-pointer ${
                      rowHighlight
                        ? "bg-[#0EA5E9]/10 ring-1 ring-inset ring-[#0EA5E9]/30"
                        : ""
                    } ${
                      worst === "expired"
                        ? "bg-rose-50/50"
                        : worst === "expiring"
                          ? "bg-amber-50/40"
                          : ""
                    }`}
                    onDoubleClick={() => {
                      setSelectedProduct(p);
                      setModalOpen(true);
                    }}
                  >
                    <DataTableTd className="font-mono text-sm font-medium text-[#009B8F]">
                      {p.internalCode}
                    </DataTableTd>
                    <DataTableTd className="font-medium">
                      {p.name}
                    </DataTableTd>
                    <DataTableTd className="tabular-nums">
                      {p.totalQuantity ?? 0}{" "}
                      <span className="text-xs text-[#475569]">un</span>
                    </DataTableTd>
                    <DataTableTd className="text-center text-[#475569]">
                      {p.batches?.length ?? 0}
                    </DataTableTd>
                    <DataTableTd className="text-center">
                      <button
                        type="button"
                        className="text-xs font-medium text-[#0EA5E9] hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(p);
                          setModalOpen(true);
                        }}
                      >
                        Detalhes
                      </button>
                      <span className="mx-2 text-[#D8E0EA]">|</span>
                      <Link
                        href="/lotes"
                        className="text-xs font-medium text-[#475569] hover:text-[#0F172A]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Lotes
                      </Link>
                      <span className="mx-2 text-[#D8E0EA]">|</span>
                      <button
                        type="button"
                        className="text-xs font-medium text-[#E11D48] hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProduct(p.id);
                        }}
                      >
                        Excluir
                      </button>
                    </DataTableTd>
                  </DataTableRow>
                );
              })}
            </DataTableBody>
          </table>
        </DataTable>
        <p className="text-xs text-[#475569]">
          Dica: duplo clique na linha para ver lotes e validades.
        </p>
      </div>

      <BatchModal
        product={selectedProduct}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

export default function ItensPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-[#D8E0EA] bg-white p-8 text-center text-sm text-[#475569]">
          Carregando…
        </div>
      }
    >
      <ItensPageInner />
    </Suspense>
  );
}

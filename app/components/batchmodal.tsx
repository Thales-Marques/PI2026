"use client";

interface Batch {
  id: string;
  batchCode: string;
  expirationDate: string;
  quantity: number;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  internalCode: string;
  batches: Batch[];
}

interface BatchModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BatchModal({
  product,
  isOpen,
  onClose,
}: BatchModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200">
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-[#0F172A] p-6 text-white">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Detalhes do estoque
            </h2>
            <p className="mt-1 font-mono text-sm text-slate-300">
              {product.name} · SKU {product.internalCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-2xl text-slate-300 transition hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Lista de Lotes */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {product.batches && product.batches.length > 0 ? (
              product.batches.map((batch) => {
                const isExpired =
                  new Date(batch.expirationDate) < new Date();

                return (
                  <div
                    key={batch.id}
                    className="flex items-center justify-between rounded-xl border border-[#D8E0EA] border-l-4 border-l-[#009B8F] bg-[#F6F8FB] p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-[#009B8F]/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#006b63]">
                          Lote {batch.batchCode}
                        </span>
                        <span className="text-gray-400 text-[10px]">
                          Registrado em:{" "}
                          {new Date(batch.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p
                        className={`text-sm font-semibold ${
                          isExpired ? "text-[#E11D48]" : "text-[#0F172A]"
                        }`}
                      >
                        Validade:{" "}
                        {new Date(
                          batch.expirationDate
                        ).toLocaleDateString("pt-BR")}
                        {isExpired && " (VENCIDO)"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-gray-800">
                        {batch.quantity}
                      </span>
                      <span className="text-xs text-gray-500 ml-1 italic">
                        unid.
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 italic">
                Nenhum lote encontrado para este produto.
              </p>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 bg-gray-100 border-t flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#0F172A] px-6 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-800"
          >
            Fechar Relatório
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";

import { usePathname } from "next/navigation";
import AppLayout from "./AppLayout";

const routeMeta: Record<
  string,
  {
    title: string;
    subtitle?: string;
    status?: "ok" | "attention" | "offline";
  }
> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Indicadores e alertas do armazém",
  },
  "/itens": {
    title: "Cadastro de itens",
    subtitle: "SKU, lotes e peso unitário",
  },
  "/lotes": {
    title: "Visão de lotes",
    subtitle: "Validade, quantidade e status",
  },
  "/armazem": {
    title: "Gerenciamento do armazém",
    subtitle: "Capacidade e ocupação",
  },
  "/fluxo": {
    title: "Controle de fluxo",
    subtitle: "Entrada, saída e histórico",
  },
};

export default function WmsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const meta = routeMeta[pathname] ?? {
    title: "WMS Logistics",
    subtitle: "Gestão de estoque",
  };

  return (
    <AppLayout
      headerTitle={meta.title}
      headerSubtitle={meta.subtitle}
      headerStatus={meta.status ?? "ok"}
    >
      {children}
    </AppLayout>
  );
}

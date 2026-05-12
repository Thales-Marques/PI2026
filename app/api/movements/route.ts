import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sku, quantity, type } = body;

    if (!sku || typeof sku !== "string") {
      return NextResponse.json({ error: "SKU inválido" }, { status: 400 });
    }

    const qtyChange = Number(quantity);
    if (!Number.isFinite(qtyChange) || qtyChange <= 0) {
      return NextResponse.json(
        { error: "Quantidade inválida" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { internalCode: String(sku).trim() },
      include: { batches: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produto não cadastrado" },
        { status: 404 }
      );
    }

    if (product.batches.length === 0) {
      return NextResponse.json(
        { error: "Produto sem lotes ativos" },
        { status: 400 }
      );
    }

    if (type === "ENTRADA") {
      const targetBatch = [...product.batches].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )[0];

      const movement = await prisma.$transaction(async (tx) => {
        await tx.batch.update({
          where: { id: targetBatch.id },
          data: { quantity: { increment: qtyChange } },
        });
        return tx.movement.create({
          data: {
            type: "ENTRADA",
            quantity: qtyChange,
            productId: product.id,
            reason: `Bip Terminal: Alterado no Lote ${targetBatch.batchCode}`,
          },
        });
      });

      return NextResponse.json(movement, { status: 201 });
    }

    if (type === "SAÍDA") {
      const batchesWithStock = product.batches
        .filter((b) => b.quantity > 0)
        .sort(
          (a, b) => a.expirationDate.getTime() - b.expirationDate.getTime()
        );

      const totalAvailable = batchesWithStock.reduce(
        (acc, b) => acc + b.quantity,
        0
      );

      if (totalAvailable < qtyChange) {
        return NextResponse.json(
          {
            error: `Estoque insuficiente. Disponível: ${totalAvailable}`,
          },
          { status: 400 }
        );
      }

      const movement = await prisma.$transaction(async (tx) => {
        let remaining = qtyChange;
        const touched: string[] = [];

        for (const batch of batchesWithStock) {
          if (remaining <= 0) break;
          const take = Math.min(batch.quantity, remaining);
          if (take <= 0) continue;

          await tx.batch.update({
            where: { id: batch.id },
            data: { quantity: { decrement: take } },
          });
          touched.push(`${batch.batchCode} (${take} un.)`);
          remaining -= take;
        }

        if (remaining > 0) {
          throw new Error("Inconsistência ao aplicar FIFO");
        }

        return tx.movement.create({
          data: {
            type: "SAÍDA",
            quantity: qtyChange,
            productId: product.id,
            reason: `Saída FIFO (validade mais próxima): ${touched.join("; ")}`,
          },
        });
      });

      return NextResponse.json(movement, { status: 201 });
    }

    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  } catch (error) {
    console.error("Erro na movimentação:", error);
    return NextResponse.json(
      { error: "Falha ao processar movimento" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const logs = await prisma.movement.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao carregar logs" },
      { status: 500 }
    );
  }
}

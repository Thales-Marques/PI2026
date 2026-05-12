import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      internalCode,
      expirationDate,
      quantity,
      batchCode,
      unitWeight,
    } = body;

    const weight =
      unitWeight === undefined || unitWeight === null || unitWeight === ""
        ? undefined
        : Number(unitWeight);

    // 1. Cria o produto ou apenas o identifica se já existir
    const product = await prisma.product.upsert({
      where: { internalCode },
      update: {
        name,
        ...(weight !== undefined && !Number.isNaN(weight) ? { unitWeight: weight } : {}),
      },
      create: {
        name,
        internalCode,
        unitWeight: weight !== undefined && !Number.isNaN(weight) ? weight : 0,
      },
    });

    // 2. Cria o Lote específico para esta entrada
    await prisma.batch.create({
      data: {
        batchCode: String(batchCode),
        expirationDate: new Date(expirationDate),
        quantity: Number(quantity),
        productId: product.id,
      },
    });

    // 3. Registra no Histórico de Movimentações
    await prisma.movement.create({
      data: {
        type: "ENTRADA",
        quantity: Number(quantity),
        reason: `Lote ${batchCode} - Registro Inicial`,
        productId: product.id,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao processar lote" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const products = await prisma.product.findMany({
    include: { batches: true },
  });

  // Formata os dados para a tabela principal (Soma quantidades)
  const formatted = products.map((p) => ({
    ...p,
    totalQuantity: p.batches.reduce((acc, b) => acc + b.quantity, 0),
    // Pega a data de registro do lote mais recente
    lastEntry:
      p.batches.length > 0
        ? new Date(
            Math.max(...p.batches.map((b) => b.createdAt.getTime()))
          )
        : p.createdAt,
  }));

  return NextResponse.json(formatted);
}
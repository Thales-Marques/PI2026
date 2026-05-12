import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = rawId?.trim();

    if (!id) {
      return NextResponse.json(
        { error: "ID do produto não foi fornecido." },
        { status: 400 }
      );
    }

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "ID do produto inválido." },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.movement.deleteMany({ where: { productId: id } });
      await tx.batch.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });

    return NextResponse.json({
      message:
        "Produto excluído com sucesso. Lotes e movimentações relacionados foram removidos.",
    });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    return NextResponse.json(
      {
        error:
          "Não foi possível concluir a exclusão. Tente novamente ou contate o suporte.",
      },
      { status: 500 }
    );
  }
}

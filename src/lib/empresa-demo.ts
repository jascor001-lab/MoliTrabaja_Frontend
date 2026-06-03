import { prisma } from "@/lib/db";

/** Empresa demo del seed para el panel (primera empresa registrada). */
export async function getEmpresaDemo() {
  const empresa = await prisma.empresa.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!empresa) {
    throw new Error(
      "No hay empresas en la base de datos. Ejecuta: npm run db:seed"
    );
  }

  return empresa;
}

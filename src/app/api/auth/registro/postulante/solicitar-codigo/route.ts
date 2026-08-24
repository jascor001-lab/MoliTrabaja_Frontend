import { NextRequest, NextResponse } from "next/server";

import { BackendError, backendFetch } from "@/lib/backend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await backendFetch("/auth/registro/postulante/solicitar-codigo", {
      method: "POST",
      token: null,
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof BackendError ? e.status : 500;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo enviar el código" },
      { status }
    );
  }
}

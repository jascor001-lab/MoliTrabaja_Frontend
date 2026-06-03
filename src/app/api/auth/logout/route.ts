import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { clearSessionCookieOptions, destroySession } from "@/lib/auth";

export async function POST() {
  await destroySession();
  cookies().set(clearSessionCookieOptions());
  return NextResponse.json({ ok: true });
}

export const SESSION_COOKIE = "molitrabaja_session";
const SESSION_DAYS = 30;

function cookieEsSegura(): boolean {
  const raw = (process.env.COOKIE_SECURE ?? "").trim().toLowerCase();
  if (raw === "true" || raw === "1") return true;
  if (raw === "false" || raw === "0") return false;
  return false;
}

export function sessionCookieOptions(token: string) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: cookieEsSegura(),
    path: "/",
    maxAge,
  };
}

export function clearSessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: cookieEsSegura(),
    path: "/",
    maxAge: 0,
  };
}

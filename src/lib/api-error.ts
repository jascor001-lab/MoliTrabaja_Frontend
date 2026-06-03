/** Lee el cuerpo de una respuesta API y extrae mensaje de error legible. */
export async function readApiError(
  res: Response,
  fallback = "Error del servidor"
): Promise<string> {
  const text = await res.text();
  if (!text.trim()) {
    return `${fallback} (${res.status})`;
  }
  try {
    const data = JSON.parse(text) as { error?: string; message?: string };
    const msg = data.error ?? data.message;
    if (msg) {
      return msg.length > 280 ? `${msg.slice(0, 280)}…` : msg;
    }
  } catch {
    /* no JSON */
  }
  return text.length > 280 ? `${text.slice(0, 280)}…` : text;
}

export function FieldError({ error }: { error?: string | null }) {
  if (!error) return null;
  return <p className="text-xs text-red-600">{error}</p>;
}

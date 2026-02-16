import DashboardClient from "@/components/dashboard/DashboardClient";

async function safeFetch(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}

async function getDashboardData() {
  const base = "http://localhost:3005/Dashboard";

  const [
    percepcion,
    tiempo,
    servicios,
    empleados,
    atenciones,
    promedios
  ] = await Promise.all([
    safeFetch(`${base}/percepcion/ult30dias`),
    safeFetch(`${base}/tiempoespera/ult30dias`),
    safeFetch(`${base}/servicios/ult30dias`),
    safeFetch(`${base}/empleados/evaluacion?page=1`),
    safeFetch(`${base}/atenciones/ult5diashab`),
    safeFetch(`${base}/promediosmensuales?year=2026&month=2`)
  ]);

  return {
    percepcion: percepcion ?? {},
    tiempo: tiempo ?? {},
    servicios: servicios ?? {},
    empleados: empleados ?? {},
    atenciones: atenciones ?? [],
    promedios: promedios ?? {}
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardClient data={data} />;
}

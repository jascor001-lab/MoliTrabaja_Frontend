import DashboardClient from "@/components/dashboard/DashboardClient";

async function getDashboardData() {
  const base = "https://moliencuesta.munimolina.gob.pe/api/Dashboard";

 

  const [
    percepcion,
    tiempo,
    servicios,
    empleados,
    atenciones,
    promedios
  ] = await Promise.all([
    fetch(`${base}/percepcion/ult30dias`, { cache: "no-store" }).then(r => r.json()),
    fetch(`${base}/tiempoespera/ult30dias`, { cache: "no-store" }).then(r => r.json()),
    fetch(`${base}/servicios/ult30dias`, { cache: "no-store" }).then(r => r.json()),
    fetch(`${base}/empleados/evaluacion?page=1`, { cache: "no-store" }).then(r => r.json()),
    fetch(`${base}/atenciones/ult5diashab`, { cache: "no-store" }).then(r => r.json()),
    fetch(`${base}/promediosmensuales?year=2026&month=2`, { cache: "no-store" }).then(r => r.json()),
  ]);

  return {
    percepcion,
    tiempo,
    servicios,
    empleados,
    atenciones,
    promedios
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardClient data={data} />;
}

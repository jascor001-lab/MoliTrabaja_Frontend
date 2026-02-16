"use client";

import { useState } from "react";

export default function DashboardClient({ data }: any) {
  const [tab, setTab] = useState<"analitica" | "detalle">("analitica");

  if (!data) {
    return (
      <div className="p-10 text-center">
        Cargando datos...
      </div>
    );
  }

  return (
    <div className="bg-[#f3f5f7] min-h-screen">

      {/* HEADER */}
      <div className="p-6 md:p-10">
        <h1 className="text-xl md:text-2xl font-bold text-green-700">
          Análisis de Atención al ciudadano
        </h1>
        <p className="text-gray-500 text-sm md:text-base">
          Evaluación ciudadana del servicio presencial
        </p>
      </div>

      {/* MOBILE TABS */}
      <div className="md:hidden bg-green-700 flex text-white text-sm font-semibold">
        <button
          onClick={() => setTab("analitica")}
          className={`flex-1 py-3 ${tab === "analitica" ? "bg-green-800" : ""}`}
        >
          Analítica general
        </button>

        <button
          onClick={() => setTab("detalle")}
          className={`flex-1 py-3 ${tab === "detalle" ? "bg-green-800" : ""}`}
        >
          Detalle
        </button>
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:block p-10 space-y-10">

        <div className="grid grid-cols-3 gap-6">
          <KpiCard
            title="Nivel de satisfacción General"
            positive={data?.percepcion?.porcentaje_positivos ?? 0}
            negative={data?.percepcion?.porcentaje_bajos ?? 0}
          />

          <KpiCard
            title="Tiempo de Atención"
            positive={data?.tiempo?.porcentaje_altos ?? 0}
            negative={data?.tiempo?.porcentaje_bajos ?? 0}
          />

          <PromedioCard
            value={data?.promedios?.promedios?.percepcion ?? 0}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <ServiciosCard
            servicios={data?.servicios?.top_7_servicios ?? []}
          />
          <PercepcionCard
            percent={data?.percepcion?.porcentaje_positivos ?? 0}
          />
        </div>

        <EmpleadoCard empleados={data?.empleados ?? {}} />

        <div className="grid grid-cols-2 gap-6">
          <DiasCard dias={data?.atenciones ?? []} />
          <PreguntasCard
            data={data?.promedios?.promedios ?? {}}
          />
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="md:hidden p-4 space-y-6">

        {tab === "analitica" && (
          <>
            <MiniKpi
              title="Nivel de satisfacción General"
              positive={data?.percepcion?.porcentaje_positivos ?? 0}
              negative={data?.percepcion?.porcentaje_bajos ?? 0}
            />

            <MiniKpi
              title="Tiempo promedio de espera"
              positive={data?.tiempo?.porcentaje_altos ?? 0}
              negative={data?.tiempo?.porcentaje_bajos ?? 0}
            />
          </>
        )}

        {tab === "detalle" && (
          <>
            <ServiciosCard
              servicios={data?.servicios?.top_7_servicios ?? []}
            />
            <EmpleadoCard empleados={data?.empleados ?? {}} />
            <PreguntasCard
              data={data?.promedios?.promedios ?? {}}
            />
          </>
        )}
      </div>
    </div>
  );
}

/* ================= MINI KPI ================= */

function MiniKpi({ title, positive, negative }: any) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-2">
        {title}
      </h3>
      <p className="text-green-600 font-semibold">
        +{positive}%
      </p>
      <p className="text-orange-500 font-semibold">
        -{negative}%
      </p>
    </div>
  );
}

/* ================= SERVICIOS ================= */

function ServiciosCard({ servicios }: any) {
  const list = Array.isArray(servicios) ? servicios : [];
  const maxHeight = 170;

  if (list.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-400">
        No hay datos de servicios
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-8">
      <h3 className="text-center text-green-700 font-semibold mb-8">
        Servicios más solicitados
      </h3>

      <div className="flex justify-center">
        <div className="flex items-end gap-10 overflow-x-auto pb-4">

          {list.map((s: any) => {
            const porcentaje = Number(s.porcentaje);
            const altura = (porcentaje / 100) * maxHeight;

            const color =
              porcentaje >= 40
                ? "bg-green-600"
                : porcentaje >= 20
                ? "bg-yellow-400"
                : "bg-red-500";

            return (
              <div
                key={s.servicio}
                className="flex flex-col items-center min-w-[90px]"
              >
                <div className="mb-3 bg-gray-200 text-xs px-3 py-1 rounded-full">
                  {porcentaje}%
                </div>

                <div
                  className="w-14 bg-gray-200 rounded-t-2xl flex items-end"
                  style={{ height: maxHeight }}
                >
                  <div
                    className={`w-full rounded-t-2xl ${color}`}
                    style={{ height: altura }}
                  />
                </div>

                <div className="mt-3 text-xs text-center break-words">
                  {s.servicio?.replace(/_/g, " ")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================= EMPLEADOS ================= */

function EmpleadoCard({ empleados }: any) {
  const resultados = empleados?.resultados ?? [];

  if (!Array.isArray(resultados) || resultados.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-sm font-semibold text-gray-600 mb-4">
        Evaluación por empleado
      </h3>

      <table className="w-full text-sm">
        <tbody>
          {resultados.map((e: any) => (
            <tr key={e.empleado} className="border-b">
              <td className="py-2">{e.empleado}</td>
              <td className="py-2 text-green-600 font-semibold">
                {e.satisfaccion}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================= DIAS ================= */

function DiasCard({ dias }: any) {
  const list = Array.isArray(dias) ? dias : [];

  if (list.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-end h-40">
        {list.map((d: any) => (
          <div key={d.fecha} className="text-center w-12">
            <div
              className="bg-green-500 rounded-t"
              style={{ height: `${Number(d.cantidad) * 20}px` }}
            />
            <p className="text-xs mt-2">{d.dia}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= PREGUNTAS ================= */

function PreguntasCard({ data }: any) {
  const entries = Object.entries(data ?? {});

  if (entries.length === 0) return null;

  return (
    <div className="border-2 border-green-600 rounded-xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {entries.map(([key, value]: any) => {
          const rating = Math.round(Number(value) || 0);
          const decimal = Number(value || 0).toFixed(1);

          return (
            <div key={key} className="p-5 bg-gray-100 border-b">
              <h3 className="text-green-700 font-semibold text-sm mb-3">
                {key}
              </h3>

              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-lg ${
                      star <= rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>

              <div className="text-sm text-gray-600 mt-1">
                {decimal}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= KPI DONUT ================= */

function KpiCard({ title, positive, negative }: any) {
  const p = Number(positive);
  const n = Number(negative);

  const size = 180;
  const stroke = 26;
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const greenLength = (p / 100) * circumference;
  const yellowLength = (n / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gray-100 py-4">
        <h2 className="text-center font-bold text-green-700">
          {title}
        </h2>
      </div>

      <div className="bg-[#f7f7f7] px-8 py-6 flex justify-center">
        <svg width={size} height={size}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={stroke}
            fill="none"
          />

          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#1f7a3b"
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${greenLength} ${circumference}`}
            transform={`rotate(-90 ${center} ${center})`}
          />

          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#eab308"
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${yellowLength} ${circumference}`}
            strokeDashoffset={-greenLength}
            transform={`rotate(-90 ${center} ${center})`}
          />

          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-green-700 font-bold text-lg"
          >
            {p}%
          </text>
        </svg>
      </div>
    </div>
  );
}

/* ================= PROMEDIO ================= */

function PromedioCard({ value }: any) {
  const rating = Math.round(value);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center">
      <div className="text-4xl font-bold text-green-600">
        {value}
      </div>

      <div className="mt-3 flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-xl ${
              star <= rating
                ? "text-yellow-400"
                : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
}

/* ================= PERCEPCION CARD ================= */

function PercepcionCard({ percent }: any) {
  const p = Number(percent) || 0;

  const size = 180;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = (p / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

      {/* HEADER */}
      <div className="bg-gray-100 py-4">
        <h2 className="text-center text-lg font-bold text-green-700">
          Percepción general de Atención
        </h2>
      </div>

      {/* CONTENT */}
      <div className="bg-[#f7f7f7] px-8 py-6 flex items-center justify-center">

        <svg width={size} height={size}>
          
          {/* Fondo */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={stroke}
            fill="none"
          />

          {/* Progreso */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#16a34a"
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${progress} ${circumference}`}
            transform={`rotate(-90 ${center} ${center})`}
            strokeLinecap="round"
          />

          {/* Texto central */}
          <text
            x={center}
            y={center - 6}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-green-700 font-bold text-2xl"
          >
            {p}%
          </text>

          <text
            x={center}
            y={center + 20}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-500 text-xs"
          >
            Satisfacción
          </text>

        </svg>

      </div>
    </div>
  );
}


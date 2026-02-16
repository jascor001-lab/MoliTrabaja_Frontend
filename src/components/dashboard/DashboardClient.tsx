"use client";

import { useState } from "react";

export default function DashboardClient({ data }: any) {
  const [tab, setTab] = useState<"analitica" | "detalle">("analitica");

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
          className={`flex-1 py-3 ${
            tab === "analitica" ? "bg-green-800" : ""
          }`}
        >
          Analítica general
        </button>

        <button
          onClick={() => setTab("detalle")}
          className={`flex-1 py-3 ${
            tab === "detalle" ? "bg-green-800" : ""
          }`}
        >
          Detalle
        </button>
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:block p-10 space-y-10">

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-6">
          <KpiCard
            title="Nivel de satisfacción General"
            positive={data.percepcion.porcentaje_positivos}
            negative={data.percepcion.porcentaje_bajos}
          />

          <KpiCard
            title="Tiempo de Atención"
            positive={data.tiempo.porcentaje_altos}
            negative={data.tiempo.porcentaje_bajos}
          />

          <PromedioCard value={data.promedios.promedios.percepcion} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <ServiciosCard servicios={data.servicios.top_7_servicios} />
          <PercepcionCard percent={data.percepcion.porcentaje_positivos} />
        </div>

        <EmpleadoCard empleados={data.empleados} />

        <div className="grid grid-cols-2 gap-6">
          <DiasCard dias={data.atenciones} />
          <PreguntasCard data={data.promedios.promedios} />
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="md:hidden p-4 space-y-6">

        {tab === "analitica" && (
          <>
            <MiniKpi
              title="Nivel de satisfacción General"
              positive={data.percepcion.porcentaje_positivos}
              negative={data.percepcion.porcentaje_bajos}
            />

            <MiniKpi
              title="Tiempo promedio de espera"
              positive={data.tiempo.porcentaje_altos}
              negative={data.tiempo.porcentaje_bajos}
            />

            <MiniKpi
              title="Percepción general de Atención"
              positive={data.percepcion.porcentaje_positivos}
              negative={data.percepcion.porcentaje_bajos}
            />

            <MiniKpi
              title="Atención del personal"
              positive={data.percepcion.porcentaje_positivos}
              negative={data.percepcion.porcentaje_bajos}
            />
          </>
        )}

        {tab === "detalle" && (
          <>
            <ServiciosCard servicios={data.servicios.top_7_servicios} />
            <EmpleadoCard empleados={data.empleados} />
            <PreguntasCard data={data.promedios.promedios} />
          </>
        )}
      </div>
    </div>
  );
}



function MiniKpi({ title, positive, negative }: any) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-2">
        {title}
      </h3>

      <div className="text-sm">
        <p>
          Satisfacción alta (4–5):{" "}
          <span className="text-green-600 font-semibold">
            +{positive}%
          </span>
        </p>

        <p>
          Satisfacción baja (1–3):{" "}
          <span className="text-orange-500 font-semibold">
            -{negative}%
          </span>
        </p>
      </div>
    </div>
  );
}

function ServiciosCard({ servicios }: any) {
  const maxHeight = 170;

  return (
    <div className="bg-white rounded-2xl shadow-md p-8">

      <h3 className="text-center text-green-700 font-semibold mb-8">
        Servicios más solicitados
      </h3>

      <div className="flex justify-center">
        <div className="flex items-end gap-10 overflow-x-auto pb-4">

          {servicios.map((s: any) => {
            const porcentaje = Number(s.porcentaje);

            const mainColor =
              porcentaje >= 40
                ? "bg-green-600"
                : porcentaje >= 20
                ? "bg-yellow-400"
                : "bg-red-500";

            const altura = (porcentaje / 100) * maxHeight;

            return (
              <div
                key={s.servicio}
                className="flex flex-col items-center min-w-[90px]"
              >
                {/* Porcentaje */}
                <div className="mb-3 bg-gray-200 text-[11px] px-3 py-1 rounded-full">
                  {porcentaje}%
                </div>

                {/* Fondo gris */}
                <div
                  className="relative w-14 bg-gray-200 rounded-t-2xl flex items-end"
                  style={{ height: maxHeight }}
                >
                  <div
                    className={`w-full rounded-t-2xl ${mainColor} transition-all duration-500`}
                    style={{ height: altura }}
                  />
                </div>

                {/* Label */}
                <div className="mt-3 text-[12px] text-center leading-tight break-words px-1">
                  {formatServicioLabel(s.servicio)}
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}

function formatServicioLabel(label: string) {
  return label
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim();
}



function EmpleadoCard({ empleados }: any) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-sm font-semibold text-gray-600 mb-4">
        Evaluación por empleado - Últimos 30 días
      </h3>

      <table className="w-full text-sm">
        <thead className="text-gray-500 border-b">
          <tr>
            <th className="text-left py-2">Empleado</th>
            <th className="text-left py-2">Satisfacción</th>
          </tr>
        </thead>

        <tbody>
          {empleados.resultados.map((e: any) => (
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

function DiasCard({ dias }: any) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-sm font-semibold text-gray-600 mb-4">
        ¿Qué día recibiste la atención?
      </h3>

      <div className="flex justify-between items-end h-40">
        {dias.map((d: any) => (
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

function PreguntasCard({ data }: any) {
  const preguntasMap: any = {
    amabilidad: "¿Qué tan amable fue el trato?",
    claridad: "¿La información fue clara?",
    conocimiento: "¿El personal conocía el tema?",
    tiempoespera: "¿Cómo calificas el tiempo de espera?",
    tiempototal: "¿Qué tal el tiempo total de atención?",
    comodidad: "¿Cómo fue la comodidad del lugar?",
    facilidad: "¿Fue fácil ubicar la ventanilla?",
    percepcion: "En general, ¿qué tan satisfecho estás?"
  };

  const entries = Object.entries(data);

  return (
    <div className="border-2 border-green-600 rounded-xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {entries.map(([key, value]: any, index) => {
          const rating = Math.round(value);
          const decimal = Number(value).toFixed(1);

          return (
            <div
              key={key}
              className={`
                p-5 bg-gray-100
                ${index % 2 === 0 ? "md:border-r border-gray-300" : ""}
                ${index < entries.length - 2 ? "border-b border-gray-300" : ""}
              `}
            >
              <h3 className="text-green-700 font-semibold text-sm mb-3">
                {preguntasMap[key] || key}
              </h3>

              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-gray-800">
                  1
                </div>

                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${
                        star <= rating
                          ? "text-yellow-400"
                          : "text-gray-400"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <div className="text-sm text-gray-600">
                  {decimal}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PercepcionCard({ percent }: any) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center">
      <h3 className="text-sm font-semibold text-gray-600 mb-6">
        Percepción general de Atención
      </h3>

      <div className="relative w-36 h-36 mx-auto">
        <div className="w-full h-full rounded-full bg-green-500 opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-green-600">
            {percent}%
          </span>
        </div>
      </div>
    </div>
  );
}

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

      {/* HEADER */}
      <div className="bg-gray-100 py-4">
        <h2 className="text-center text-lg font-bold text-green-700">
          {title}
        </h2>
      </div>

      {/* CONTENT */}
      <div className="bg-[#f7f7f7] px-8 py-6 flex items-center justify-between">

        {/* LEFT TEXT */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-green-800">
            Promedio<br />general:
          </h3>

          <div className="text-sm space-y-1">
            <div>
              Satisfacción alta (4–5):{" "}
              <span className="text-green-600 font-semibold">
                {positive}%
              </span>
            </div>

            <div>
              Satisfacción baja (1–3):{" "}
              <span className="text-orange-500 font-semibold">
                {negative}%
              </span>
            </div>
          </div>
        </div>

        {/* DONUT */}
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

          {/* Verde */}
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

          {/* Amarillo */}
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

          {/* Texto central */}
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-green-700 font-bold text-lg"
          >
            {positive}%
          </text>
        </svg>
      </div>
    </div>
  );
}

function PromedioCard({ value }: any) {
  const rating = Math.round(value);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center">
      <h3 className="text-sm font-semibold text-gray-600 mb-4">
        Promedio mensual general
      </h3>

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

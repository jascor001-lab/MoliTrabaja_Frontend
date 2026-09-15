import { readFile } from "fs/promises";
import path from "path";

import type { CvParsed } from "@/types/postulacion";

const SKILL_KEYWORDS = [
  "React",
  "Next.js",
  "Nextjs",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "Java",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "MySQL",
  "Tailwind",
  "TailwindCSS",
  "HTML",
  "CSS",
  "Git",
  "Docker",
  "AWS",
  "Azure",
  "Excel",
  "Power BI",
  "PowerBI",
  "Comunicación",
  "Comunicacion efectiva",
  "Liderazgo",
  "Scrum",
  "Agile",
  "Inglés",
  "Ingles",
  "Atención al cliente",
  "Atencion al cliente",
  "AutoCAD",
  "SolidWorks",
  "SAP",
  "Marketing",
  "Ventas",
  "Contabilidad",
  "Administración",
  "Administracion",
  "Ingeniería de Sistemas",
  "Ingenieria de Sistemas",
  "Sistemas e Informática",
  "Sistemas e Informatica",
];

const EXPERIENCE_RE =
  /(\d{1,2})\+?\s*(?:años|anos|years|yr)\s*(?:de\s*)?(?:experiencia|experience)/gi;

export async function extraerTextoCv(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const ext = path.extname(fileName).toLowerCase();

  if (ext === ".txt") {
    return buffer.toString("utf-8");
  }

  if (ext === ".pdf") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
      const result = await pdfParse(buffer);
      return result.text ?? "";
    } catch {
      return buffer.toString("latin1");
    }
  }

  return buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r\táéíóúñÁÉÍÓÚÑ]/g, " ");
}

export function parsearCvTexto(
  texto: string,
  requisitosOferta: string[] = []
): CvParsed {
  const normalized = texto.toLowerCase();
  const skills = new Set<string>();

  for (const skill of SKILL_KEYWORDS) {
    if (normalized.includes(skill.toLowerCase())) {
      skills.add(skill.replace("Tailwind", "TailwindCSS"));
    }
  }

  for (const req of requisitosOferta) {
    if (req.length > 2 && normalized.includes(req.toLowerCase())) {
      skills.add(req);
    }
  }

  let experience_years = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(EXPERIENCE_RE.source, EXPERIENCE_RE.flags);
  while ((match = re.exec(texto)) !== null) {
    const years = Number(match[1]);
    if (years > experience_years) experience_years = years;
  }

  if (experience_years === 0 && /senior|sr\./i.test(texto)) experience_years = 5;
  if (experience_years === 0 && /junior|jr\./i.test(texto)) experience_years = 1;

  const education: string[] = [];
  if (/universidad|ingeniería|bachiller|título/i.test(texto)) {
    education.push("Educación superior");
  }
  if (/certificat|curso|diplomado/i.test(texto)) {
    education.push("Certificaciones / cursos");
  }

  const stack = Array.from(skills).slice(0, 20);

  return {
    stack,
    skills: stack,
    experience: { years: experience_years },
    experience_years,
    education,
  };
}

export async function parsearCvArchivo(
  diskPath: string,
  fileName: string,
  requisitosOferta: string[] = []
): Promise<CvParsed> {
  const fullPath = path.join(process.cwd(), "public", diskPath.replace(/^\//, ""));
  const buffer = await readFile(fullPath);
  const texto = await extraerTextoCv(buffer, fileName);
  return parsearCvTexto(texto, requisitosOferta);
}

export function calcularRankingFit(
  cv: CvParsed,
  requisitosOferta: string[]
): "High" | "Medium" | "Low" {
  if (requisitosOferta.length === 0) {
    return cv.skills.length >= 4 ? "High" : cv.skills.length >= 2 ? "Medium" : "Low";
  }
  const matchCount = requisitosOferta.filter((r) =>
    cv.skills.some((s) => s.toLowerCase() === r.toLowerCase())
  ).length;
  const ratio = matchCount / requisitosOferta.length;
  if (ratio >= 0.6) return "High";
  if (ratio >= 0.3) return "Medium";
  return "Low";
}

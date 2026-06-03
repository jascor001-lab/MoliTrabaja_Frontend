import { PrismaClient } from "@prisma/client";

import {
  CARRERAS_SEED,
  CONOCIMIENTOS_SEED,
  INSTITUCIONES_SEED,
} from "../src/lib/catalogos-seed-data";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

const DEMO_LOGO = "/logos/demo-empresa.png";
const DEMO_PASSWORD = "Demo1234";

const demoLogoJson = JSON.stringify([
  {
    name: "demo-empresa.png",
    path: DEMO_LOGO,
    size: 0,
    mimeType: "image/png",
  },
]);

async function seedCatalogos() {
  await prisma.tipoDoc.upsert({
    where: { abrev: "DNI" },
    update: {},
    create: { nombreCompleto: "Documento Nacional de Identidad", abrev: "DNI" },
  });
  await prisma.tipoDoc.upsert({
    where: { abrev: "CE" },
    update: {},
    create: { nombreCompleto: "Carné de Extranjería", abrev: "CE" },
  });

  const peru = await prisma.pais.upsert({
    where: { id: 1 },
    update: {},
    create: { nombre: "Perú", prefijoCelular: "+51" },
  });

  for (const nombre of CARRERAS_SEED) {
    await prisma.catalogoCarrera.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  for (const item of CONOCIMIENTOS_SEED) {
    await prisma.catalogoConocimiento.upsert({
      where: { nombre_grupo: { nombre: item.nombre, grupo: item.grupo } },
      update: {},
      create: item,
    });
  }

  for (const inst of INSTITUCIONES_SEED) {
    const exists = await prisma.catalogoInstitucion.findFirst({
      where: { nombre: inst.nombre },
    });
    if (!exists) {
      await prisma.catalogoInstitucion.create({ data: inst });
    }
  }

  return peru;
}

async function main() {
  await seedCatalogos();

  const empresa = await prisma.empresa.upsert({
    where: { ruc: "20123456789" },
    update: {
      logo: DEMO_LOGO,
      email: "demo@techmolina.pe",
      passwordHash: hashPassword(DEMO_PASSWORD),
      razonSocial: "TechMolina SAC",
      telefono: "999888777",
      paginaWeb: "https://www.techmolina.pe",
    },
    create: {
      nombre: "TechMolina SAC",
      razonSocial: "TechMolina SAC",
      ruc: "20123456789",
      email: "demo@techmolina.pe",
      passwordHash: hashPassword(DEMO_PASSWORD),
      rubro: "Tecnología e innovación",
      logo: DEMO_LOGO,
      telefono: "999888777",
      paginaWeb: "https://www.techmolina.pe",
      descripcion:
        "Empresa demo para el panel MoliTrabaja. Publica vacantes y gestiona convocatorias.",
    },
  });

  await prisma.contactoEmpresa.deleteMany({ where: { empresaId: empresa.id } });
  await prisma.contactoEmpresa.createMany({
    data: [
      {
        empresaId: empresa.id,
        nombres: "María",
        apellidoPaterno: "López",
        correo: "rrhh@techmolina.pe",
        celular: "999888777",
        esPrincipal: true,
        esGerente: false,
      },
      {
        empresaId: empresa.id,
        nombres: "Carlos",
        apellidoPaterno: "Mendoza",
        correo: "gerencia@techmolina.pe",
        celular: "988777666",
        esPrincipal: false,
        esGerente: true,
      },
    ],
  });

  const count = await prisma.ofertaLaboral.count({
    where: { empresaId: empresa.id },
  });

  if (count === 0) {
    const inicio = new Date();
    const fin = new Date();
    fin.setMonth(fin.getMonth() + 2);

    const direccion = await prisma.direccion.create({
      data: {
        direccionLiteral: "Av. Tecnológica 123, Molina, Lima",
        latitud: "-12.0464",
        longitud: "-77.0428",
      },
    });

    const carreras = await prisma.catalogoCarrera.findMany({
      where: { nombre: { in: ["Ingeniería de Sistemas", "Marketing"] } },
    });
    const conocimientos = await prisma.catalogoConocimiento.findMany({
      where: { nombre: { in: ["React", "TypeScript", "SQL", "Power BI"] } },
    });

    const oferta1 = await prisma.ofertaLaboral.create({
      data: {
        empresaId: empresa.id,
        direccionTrabajoId: direccion.id,
        titulo: "Desarrollador Frontend React",
        perfil: "Profesional con experiencia en desarrollo web moderno y trabajo en equipo.",
        descripcion:
          "FUNCIONES:\nDesarrollo de interfaces con React.\n\nBENEFICIOS:\nSeguro médico y horario flexible.",
        tipoContrato: "Indefinido",
        modalidad: "Hibrido",
        salario: "S/ 4,500 - S/ 6,000",
        logoArchivos: demoLogoJson,
        tipoPuesto: JSON.stringify(["Full Time"]),
        cantidadVacantes: 2,
        funciones: "Desarrollo de interfaces con React y Next.js.",
        beneficios: "Seguro médico, bonos por desempeño.",
      },
    });

    await prisma.cronograma.create({
      data: {
        ofertaId: oferta1.id,
        etapa: "Convocatoria",
        inicio,
        fin,
        responsable: "Carlos Mendoza",
      },
    });

    for (const c of carreras) {
      await prisma.ofertaCarrera.create({
        data: { ofertaId: oferta1.id, carreraId: c.id },
      });
    }
    for (const k of conocimientos.filter((k) =>
      ["React", "TypeScript"].includes(k.nombre)
    )) {
      await prisma.ofertaConocimiento.create({
        data: { ofertaId: oferta1.id, conocimientoId: k.id },
      });
    }

    const oferta2 = await prisma.ofertaLaboral.create({
      data: {
        empresaId: empresa.id,
        titulo: "Analista de Datos",
        perfil: "Analista orientado a resultados con dominio de SQL y visualización.",
        descripcion:
          "FUNCIONES:\nDashboards y reporting.\n\nBENEFICIOS:\nCapacitación continua.",
        tipoContrato: "Plazo fijo",
        modalidad: "Remoto",
        salario: "S/ 3,800 - S/ 5,200",
        logoArchivos: demoLogoJson,
        tipoPuesto: JSON.stringify(["Part Time", "Full Time"]),
        cantidadVacantes: 1,
        funciones: "Análisis de datos y reportes ejecutivos.",
        beneficios: "Trabajo remoto y capacitaciones.",
      },
    });

    await prisma.cronograma.create({
      data: {
        ofertaId: oferta2.id,
        etapa: "Convocatoria",
        inicio,
        fin: null,
        responsable: "María López",
      },
    });

    const sql = conocimientos.find((k) => k.nombre === "SQL");
    const pbi = conocimientos.find((k) => k.nombre === "Power BI");
    if (sql) {
      await prisma.ofertaConocimiento.create({
        data: { ofertaId: oferta2.id, conocimientoId: sql.id },
      });
    }
    if (pbi) {
      await prisma.ofertaConocimiento.create({
        data: { ofertaId: oferta2.id, conocimientoId: pbi.id },
      });
    }
  }

  console.log("Seed OK — empresa demo:", empresa.id);
  console.log("Login demo: demo@techmolina.pe / Demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

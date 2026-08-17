const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const BASE = "http://localhost:3002";

async function main() {
  const prisma = new PrismaClient();
  const post = await prisma.postulante.findFirst({
    include: { educaciones: true },
  });
  if (!post) {
    console.log("no postulante");
    return;
  }
  console.log("postulante:", post.correo, post.numeroDocumento);

  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipo: "postulante",
      email: post.correo,
      password: "Postulante1!",
    }),
  });
  const loginText = await loginRes.text();
  console.log("login status", loginRes.status, loginText.slice(0, 200));
  const setCookie = loginRes.headers.getSetCookie?.() ?? [];
  const cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
  console.log("cookie", cookie.slice(0, 80));

  const pdfPath = path.join(process.cwd(), "tmp-test.pdf");
  fs.writeFileSync(pdfPath, "%PDF-1.4 test");

  const fd = new FormData();
  fd.append("carreraId", "1");
  fd.append("tipoEstudio", "Universitario");
  fd.append("institucion", "UPSJB Test");
  fd.append("ordenMerito", "No aplica");
  fd.append("fechaIngreso", "2013-08-26");
  fd.append("fechaEgreso", "2018-12-15");
  fd.append("documento", new Blob([fs.readFileSync(pdfPath)], { type: "application/pdf" }), "test.pdf");

  const res = await fetch(`${BASE}/api/auth/perfil/postulante/educaciones`, {
    method: "POST",
    headers: { cookie },
    body: fd,
  });
  const text = await res.text();
  console.log("post status", res.status);
  console.log("post body", text || "(empty)");
  fs.unlinkSync(pdfPath);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

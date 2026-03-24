#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🧠 SGC DOCTOR v2.5 (CANONICAL FINAL CHECK)\n");

const ROOT = process.cwd();

const paths = {
  modules: path.join(ROOT, "docs/architecture/sgc-modules-full.txt"),
  prisma: path.join(ROOT, "sgc-backend/prisma/schema.prisma"),
  backend: path.join(ROOT, "sgc-backend"),
  index: path.join(ROOT, "sgc-backend/index.js"),
  frontend: path.join(ROOT, "user-crud-app/src"),
};

// -------------------------
// HELPERS
// -------------------------

const read = (p) => fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : "";

function normalizeRoute(route) {
  if (!route) return null;
  return route
    .replace(/^\//, "")
    .replace(/-/g, "_")
    .toLowerCase();
}

function scanFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  function walk(current) {
    if (current.includes("node_modules")) return;
    const files = fs.readdirSync(current);

    for (const file of files) {
      const full = path.join(current, file);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) walk(full);
      else if (file.endsWith(".tsx") || file.endsWith(".ts")) results.push(full);
    }
  }

  walk(dir);
  return results;
}

function getModuleType(code) {
  if (code.startsWith("5.4") || code.startsWith("5.5") || code.startsWith("7.")) return "MAESTRO";
  if (code.startsWith("2.") || code.startsWith("4.")) return "OPERACIONAL";
  if (code.startsWith("6.") || code.startsWith("8.") || code.startsWith("5.3")) return "SISTEMA";
  return "OTRO";
}

// -------------------------
// CORE CHECK
// -------------------------

function checkModule(mod, files, prisma, api) {
  const { code, route, normalized } = mod;
  if (!normalized) return null;

  let issues = [];
  const type = getModuleType(code);
  const normalizedLower = normalized.toLowerCase();

  // UI CHECK (Case insensitive and looking for filenames)
  const normalizedMatch = normalizedLower.replace(/_/g, "");
  const uiExists = files.some(f => {
    const base = path.basename(f).toLowerCase().replace(/_/g, "");
    return base.includes(normalizedMatch);
  });
  if (!uiExists) issues.push(`UI no detectada (Esperado: ${normalized}.tsx)`);

  // API CHECK
  const apiFound = api.includes(`/api/${normalized}`);
  if (!apiFound) issues.push(`Endpoint API no encontrado (/api/${normalized})`);

  // UPLOAD CHECK
  if (type === "MAESTRO") {
    const uploadFound = api.includes(`/api/${normalized}/upload`) || api.includes(`runBulkImport('${normalized}'`);
    if (!uploadFound) issues.push(`Falta endpoint /upload (requerido para MAESTRO)`);
  }

  // PRISMA CHECK
  const prismaFound = prisma.toLowerCase().includes(normalizedLower);
  if (!prismaFound) issues.push(`Modelo Prisma no detectado (Busca: @module ${normalized})`);

  // JSON CHECK
  const hasRequestMapper = api.includes(`requestMapper('${normalized}')`);
  const hasMapResponse = api.includes(`mapResponse('${normalized}'`);
  if (!hasRequestMapper && !hasMapResponse) {
     // Check if it's a GET only or complex module
  }

  // STATUS
  let status = "OK";
  if (issues.length >= 3) status = "CRÍTICO";
  else if (issues.length > 0) status = "PARCIAL";

  return { code, route, status, issues, type };
}

// -------------------------
// MAIN
// -------------------------

const prismaContent = read(paths.prisma);
const apiContent = read(paths.index);
const allFiles = scanFiles(paths.frontend);

const content = read(paths.modules);
const modules = content.split("\n")
  .filter(line => line.includes("|") && line.includes("("))
  .map(line => {
    const codeMatch = line.match(/^(\d\.\d\.\d)/);
    if (!codeMatch) return null;
    const code = codeMatch[1];
    
    // Find last (...) for route
    const matches = line.match(/\(([^)]+)\)/g);
    const route = matches ? matches[matches.length - 1].slice(1, -1) : null;

    return {
      code,
      route,
      normalized: normalizeRoute(route)
    };
  })
  .filter(m => m && m.route && m.route.startsWith("/"));

console.log(`Auditing ${modules.length} modules...\n`);

const summary = { ok: 0, partial: 0, critical: 0 };
const results = modules.map(m => {
  const res = checkModule(m, allFiles, prismaContent, apiContent);
  if (!res) return null;

  if (res.status === "OK") summary.ok++;
  else if (res.status === "PARCIAL") summary.partial++;
  else if (res.status === "CRÍTICO") summary.critical++;

  return res;
}).filter(Boolean);

results.filter(r => r.status !== "OK").forEach(r => {
  console.log(`[${r.status}] ${r.code} - ${r.route} (${r.type})`);
  r.issues.forEach(issue => console.log(`  - ${issue}`));
});

console.log("\n--- RESUMEN ---");
console.log(`Total: ${results.length}`);
console.log(`OK: ${summary.ok}`);
console.log(`PARCIAL: ${summary.partial}`);
console.log(`CRÍTICO: ${summary.critical}`);

if (summary.critical > 0) {
  process.exit(1);
} else {
  console.log("\n✔ Alineación canónica validada (No hay errores críticos)");
  process.exit(0);
}
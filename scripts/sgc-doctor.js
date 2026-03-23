#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🧠 SGC DOCTOR v2.2 (SMART CHECK)\n");

const ROOT = process.cwd();

const paths = {
  modules: path.join(ROOT, "docs/architecture/sgc-modules-full.txt"),
  prisma: path.join(ROOT, "sgc-backend/prisma/schema.prisma"),
  backend: path.join(ROOT, "sgc-backend"),
  frontend: path.join(ROOT, "user-crud-app/src"),
};

// -------------------------
// HELPERS
// -------------------------

const read = (p) => fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : "";

function normalizeRoute(route) {
  return route
    .replace("/", "")
    .replace(/-/g, "_")
    .toLowerCase();
}

function scanFiles(dir) {
  let results = [];

  function walk(current) {
    const files = fs.readdirSync(current);

    for (const file of files) {
      const full = path.join(current, file);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) walk(full);
      else results.push(full);
    }
  }

  walk(dir);
  return results;
}

// -------------------------
// MODULE TYPE
// -------------------------

function getModuleType(code) {
  if (code.startsWith("7.") || code.startsWith("5.3") || code.startsWith("5.5")) {
    return "MAESTRO";
  }

  if (
    code.startsWith("2.") ||
    code.startsWith("4.") ||
    code.startsWith("5.1") ||
    code.startsWith("5.2")
  ) {
    return "OPERACIONAL";
  }

  if (code.startsWith("6.") || code.startsWith("8.")) {
    return "SISTEMA";
  }

  return "OTRO";
}

// -------------------------
// LOAD MODULES
// -------------------------

function loadModules() {
  const content = read(paths.modules);

  return content
    .split("\n")
    .filter(line => line.includes("|") && line.includes("("))
    .map(line => {
      const parts = line.split("|").map(p => p.trim());

      const code = parts[0];
      const func = parts[3] || "";

      const match = func.match(/\((.*?)\)/);

      const route = match ? match[1] : null;

      return {
        code,
        route,
        normalized: route ? normalizeRoute(route) : null
      };
    });
}

// -------------------------
// CORE CHECK
// -------------------------

function checkModule(module, files, prisma, api) {
  const { code, route, normalized } = module;

  if (!route) return null;

  let issues = [];

  const type = getModuleType(code);

  // UI
  const uiExists = files.some(f =>
    f.includes("user-crud-app") &&
    f.toLowerCase().includes(normalized)
  );

  if (!uiExists) issues.push("UI no detectada");

  // API
  const apiExists = api.includes(`/api/${normalized}`);
  if (!apiExists) issues.push(`Endpoint API no encontrado (/api/${normalized})`);

  // UPLOAD SOLO PARA MAESTROS
  const uploadExists = api.includes(`/api/${normalized}/upload`);
  if (type === "MAESTRO" && !uploadExists) {
    issues.push("Falta endpoint /upload (requerido para maestros)");
  }

  // MODEL
  const modelExists = prisma.toLowerCase().includes(normalized);
  if (!modelExists) issues.push("Modelo Prisma no detectado");

  // JSON
  const jsonOK =
    api.includes("JSON.stringify") &&
    api.includes("JSON.parse");

  if (!jsonOK) issues.push("Serialización JSON no detectada");

  // STATUS
  let status = "OK";

  if (issues.length >= 3) status = "CRÍTICO";
  else if (issues.length > 0) status = "PARCIAL";

  return { code, route, status, issues, type };
}

// -------------------------
// GLOBAL CHECKS
// -------------------------

function checkGlobal(files, api) {
  let issues = [];

  const hasDownloadAll = files.some(f => {
    try {
      return read(f).includes("Descargar Todo");
    } catch { return false; }
  });

  if (!hasDownloadAll)
    issues.push("Falta 'Descargar Todo' en 8.1.0");

  const hasUploadUI = files.some(f => {
    try {
      return read(f).includes("upload");
    } catch { return false; }
  });

  if (!hasUploadUI)
    issues.push("UI no detecta carga masiva");

  return issues;
}

// -------------------------
// RUN
// -------------------------

const modules = loadModules();

const allFiles = scanFiles(ROOT);
const prisma = read(paths.prisma);
const api = scanFiles(paths.backend).map(f => read(f)).join("\n");

let summary = {
  ok: 0,
  partial: 0,
  critical: 0
};

let criticalModules = [];

console.log("📊 VALIDACIÓN POR MÓDULO\n");

modules.forEach(mod => {
  const res = checkModule(mod, allFiles, prisma, api);
  if (!res) return;

  if (res.status === "OK") summary.ok++;
  if (res.status === "PARCIAL") summary.partial++;
  if (res.status === "CRÍTICO") {
    summary.critical++;
    criticalModules.push(res);
  }

  console.log(`🔹 ${res.code} (${res.route}) [${res.type}] → ${res.status}`);

  res.issues.forEach(i => console.log("   - " + i));
});

// -------------------------
// GLOBAL
// -------------------------

console.log("\n📦 VALIDACIÓN GLOBAL (8.1.0)\n");

const globalIssues = checkGlobal(allFiles, api);

if (globalIssues.length === 0) {
  console.log("✔ Carga masiva OK");
} else {
  globalIssues.forEach(i => console.log("⚠ " + i));
}

// -------------------------
// PRIORIDAD
// -------------------------

console.log("\n🔥 PRIORIDAD DE CORRECCIÓN\n");

criticalModules.forEach(m => {
  console.log(`❌ ${m.code} → ${m.route}`);
});

// -------------------------
// PLAN DE CORRECCIÓN
// -------------------------

console.log("\n🛠 PLAN AUTOMÁTICO DE CORRECCIÓN\n");

function getPriorityScore(mod) {
  let score = 0;

  mod.issues.forEach(issue => {
    if (issue.includes("upload")) score += 5;
    if (issue.includes("API")) score += 4;
    if (issue.includes("Modelo")) score += 4;
    if (issue.includes("UI")) score += 2;
    if (issue.includes("JSON")) score += 3;
  });

  return score;
}

const actionable = modules
  .map(mod => checkModule(mod, allFiles, prisma, api))
  .filter(m => m && m.status !== "OK")
  .map(m => ({
    ...m,
    score: getPriorityScore(m)
  }))
  .sort((a, b) => b.score - a.score);

if (actionable.length === 0) {
  console.log("✔ No hay módulos pendientes");
} else {
  actionable.forEach((m, index) => {
    console.log(`\n${index + 1}. ${m.code} (${m.route})`);
    console.log(`   Prioridad: ${m.score}`);

    m.issues.forEach(issue => {
      let action = "";

      if (issue.includes("upload")) {
        action = "→ Crear endpoint /api/.../upload";
      } else if (issue.includes("API")) {
        action = "→ Crear o corregir endpoint API";
      } else if (issue.includes("Modelo")) {
        action = "→ Crear/ajustar modelo en Prisma";
      } else if (issue.includes("UI")) {
        action = "→ Crear/ajustar componente en frontend";
      } else if (issue.includes("JSON")) {
        action = "→ Implementar JSON.stringify / JSON.parse";
      }

      console.log(`   - ${issue}`);
      if (action) console.log(`     ${action}`);
    });
  });
}

console.log("\n📌 RESUMEN\n");

console.log(`✔ OK: ${summary.ok}`);
console.log(`⚠ PARCIAL: ${summary.partial}`);
console.log(`❌ CRÍTICO: ${summary.critical}`);

console.log("\n👉 Ataca CRÍTICOS primero\n");

if (summary.critical > 0) {
  console.log("❌ Hay módulos CRÍTICOS");
  process.exit(1);
} else {
  console.log("✔ Sistema sin errores críticos");
  process.exit(0);
}
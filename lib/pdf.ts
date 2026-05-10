import type { GenerateSpecResponse } from "./types";
import { slugify } from "./markdown";

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function toList(items: string[]): string {
  return `<ul>\n${items.map((i) => `  <li>${esc(i)}</li>`).join("\n")}\n</ul>`;
}

export function buildPdfHtml(spec: GenerateSpecResponse, idea: string): string {
  const title = idea.trim() || "Especificación técnica";
  const slug = slugify(idea);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${esc(slug || "spec")}</title>
  <style>
    @page { margin: 2cm; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #111;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 22pt;
      margin-bottom: 0.25em;
      padding-bottom: 0.25em;
      border-bottom: 2px solid #111;
    }
    h2 {
      font-size: 14pt;
      margin-top: 1.5em;
      margin-bottom: 0.4em;
    }
    p { margin: 0.25em 0; font-size: 11pt; }
    ul { padding-left: 1.5em; margin: 0.25em 0; }
    li { font-size: 11pt; margin-bottom: 0.2em; }
  </style>
</head>
<body>
  <h1>${esc(title)}</h1>

  <h2>Visión</h2>
  <p>${esc(spec.vision)}</p>

  <h2>Usuarios objetivo</h2>
  ${toList(splitSentences(spec.users))}

  <h2>Funcionalidades</h2>
  ${toList(spec.features)}

  <h2>Flujos principales</h2>
  ${toList(spec.flows)}

  <h2>Arquitectura técnica</h2>
  <p>${esc(spec.architecture)}</p>

  <h2>Requisitos</h2>
  ${toList(splitSentences(spec.requirements))}
</body>
</html>`;
}

export function downloadPdf(spec: GenerateSpecResponse, idea: string): void {
  const html = buildPdfHtml(spec, idea);

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;width:0;height:0;border:none;opacity:0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();

  setTimeout(() => document.body.removeChild(iframe), 1000);
}

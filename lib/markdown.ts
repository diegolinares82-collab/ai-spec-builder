import type { GenerateSpecResponse } from "./types";

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function buildMarkdown(spec: GenerateSpecResponse): string {
  const users = splitSentences(spec.users)
    .map((s) => `- ${s}`)
    .join("\n");
  const features = spec.features.map((f) => `- ${f}`).join("\n");
  const flows = spec.flows.map((f, i) => `${i + 1}. ${f}`).join("\n");
  const requirements = splitSentences(spec.requirements)
    .map((s) => `- ${s}`)
    .join("\n");

  const sections = [
    `# Especificación técnica`,
    `## Visión\n\n${spec.vision}`,
    `## Usuarios objetivo\n\n${users}`,
    `## Funcionalidades\n\n${features}`,
    `## Flujos principales\n\n${flows}`,
    `## Arquitectura técnica\n\n${spec.architecture}`,
    `## Requisitos\n\n${requirements}`,
  ];

  return sections.join("\n\n") + "\n";
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const FILENAME_MAX_LEN = 50;
const FILENAME_PREFIX = "spec-";
const FILENAME_SUFFIX = ".md";

export function buildFilename(idea: string): string {
  const slugBudget = FILENAME_MAX_LEN - FILENAME_PREFIX.length - FILENAME_SUFFIX.length;
  const slug = slugify(idea).slice(0, slugBudget).replace(/-+$/, "");
  return slug ? `${FILENAME_PREFIX}${slug}${FILENAME_SUFFIX}` : `spec${FILENAME_SUFFIX}`;
}

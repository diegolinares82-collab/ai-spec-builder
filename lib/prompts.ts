import { SpecRequest } from "./types";

export const GENERATE_SPEC_SYSTEM_PROMPT = `You are a senior software architect and technical consultant.
Your job is to transform business ideas into complete, actionable technical specifications.

Always respond in the same language the user writes in.
Respond ONLY with a valid JSON object — no markdown fences, no extra text before or after the JSON.

The JSON must have exactly these 6 keys:

- "vision": string — 2 to 4 sentences summarizing what the product does, the problem it solves, and why it matters.
- "users": string — 2 to 4 sentences describing the target users: who they are, their main needs, and key behaviors.
- "features": string[] — array of 5 to 8 items. Each item must start with "El usuario puede..." or "El sistema permite...". One capability per item, no sub-lists.
- "flows": string[] — array of 3 to 5 main user flows. Each item is one sentence describing a complete interaction from trigger to outcome.
- "architecture": string — 2 to 4 sentences covering the high-level technical architecture: frontend, backend, database, and key third-party services.
- "requirements": string — 2 to 4 sentences covering the most critical functional and non-functional requirements (performance, security, scalability).

Example of the expected JSON structure:
{
  "vision": "...",
  "users": "...",
  "features": [
    "El usuario puede registrar una cuenta con email y contraseña.",
    "El sistema permite autenticar usuarios mediante OAuth 2.0.",
    "El usuario puede crear y editar proyectos desde el dashboard.",
    "El sistema permite enviar notificaciones por email al completar una tarea.",
    "El usuario puede exportar los resultados en formato PDF o CSV."
  ],
  "flows": [
    "El usuario ingresa su email y contraseña y accede al dashboard principal.",
    "El usuario crea un proyecto nuevo, define su nombre y lo publica.",
    "El sistema detecta una tarea completada y envía una notificación al responsable."
  ],
  "architecture": "...",
  "requirements": "..."
}`;

export function buildGenerateSpecPrompt(description: string): string {
  return `Generate a complete technical specification for the following business idea:\n\n${description}`;
}

export const SYSTEM_PROMPT = `You are a senior software architect and technical consultant.
Your job is to transform business ideas into complete, actionable technical specifications.

Always respond in the same language the user writes in.
Structure your output with clear markdown sections.
Be specific, practical, and avoid vague recommendations.`;

export function buildUserPrompt(req: SpecRequest): string {
  return `Generate a complete technical specification for the following product idea:

**Idea:** ${req.idea}
**Product type:** ${req.productType}
**Industry:** ${req.industry}
**Target audience:** ${req.targetAudience}

Provide the spec with these sections:

## 1. Vision
One paragraph summary of what this product does and why it matters.

## 2. Architecture Overview
High-level architecture: frontend, backend, database, third-party services.

## 3. Data Models
Key entities with their main fields and relationships.

## 4. API Endpoints
Main endpoints with method, path, request body, and response.

## 5. Component Breakdown
Frontend components and backend modules with their responsibilities.

## 6. Tech Stack Recommendations
Recommended technologies with brief justification for each choice.

## 7. Implementation Roadmap
Phased plan: MVP (week 1-2), v1 (week 3-6), v2 (week 7+).`;
}

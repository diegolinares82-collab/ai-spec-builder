"use client";

import { useEffect, useState } from "react";
import { GenerateSpecResponse } from "@/lib/types";

interface SpecFormProps {
  onResult: (spec: GenerateSpecResponse, idea: string) => void;
  onStreamChunk: (accumulated: string) => void;
  onStreamStart: () => void;
  onStreamError: () => void;
}

const LOADING_MESSAGES = [
  "Analizando tu idea...",
  "Definiendo arquitectura...",
  "Mapeando funcionalidades...",
  "Estructurando flujos de usuario...",
  "Revisando requisitos...",
  "Casi listo...",
];

function getQuality(length: number): { label: string; color: string } | null {
  if (length === 0) return null;
  if (length < 10) return { label: "Demasiado corta", color: "text-red-400" };
  if (length < 50) return { label: "Podría ser más específica", color: "text-amber-500" };
  if (length < 120) return { label: "Buena descripción", color: "text-emerald-500" };
  return { label: "Lista para generar ✓", color: "text-indigo-600" };
}

function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  return text.trim();
}

export default function SpecForm({ onResult, onStreamChunk, onStreamStart, onStreamError }: SpecFormProps) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;
    setMsgIndex(0);
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(id);
  }, [loading]);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (res.status === 429) {
        const data = await res.json();
        const retryAfter = res.headers.get("Retry-After");
        const seconds = retryAfter ? parseInt(retryAfter, 10) : 60;
        throw new Error(`${data.error} (podés reintentar en ${seconds}s)`);
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al generar la especificación.");
      }

      if (!res.body) throw new Error("El servidor no devolvió un stream.");

      onStreamStart();

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        onStreamChunk(accumulated);
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(extractJSON(accumulated));
      } catch {
        throw new Error("No se pudo generar la especificación. Intenta de nuevo.");
      }

      onResult(parsed as GenerateSpecResponse, description);
    } catch (err: unknown) {
      onStreamError();
      setError(err instanceof Error ? err.message : "Error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const trimmed = description.trim();
  const canSubmit = trimmed.length >= 10 && !loading;
  const quality = getQuality(trimmed.length);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4">
      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          placeholder="Describe tu idea de producto..."
          rows={6}
          className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none text-sm leading-relaxed transition-colors shadow-sm"
        />
        <div className="mt-1.5 flex items-center justify-between">
          {quality ? (
            <p className={`text-xs font-medium ${quality.color}`}>{quality.label}</p>
          ) : (
            <p className="text-xs text-gray-400 italic">
              Ej: "Una plataforma para que freelancers gestionen facturas, clientes y cobros."
            </p>
          )}
          <p className="text-xs text-gray-400">{description.length} caracteres</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>{LOADING_MESSAGES[msgIndex]}</span>
          </>
        ) : (
          "Generar especificación"
        )}
      </button>

      {!loading && trimmed.length > 0 && trimmed.length < 10 && (
        <p className="text-center text-xs text-gray-400">
          Necesitás al menos 10 caracteres para continuar
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}

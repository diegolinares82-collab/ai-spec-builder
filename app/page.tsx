"use client";

import { useEffect, useState } from "react";
import { Show } from "@clerk/nextjs";
import SpecForm from "@/components/SpecForm";
import SpecOutput, { buildClipboardText } from "@/components/SpecOutput";
import SpecSkeleton from "@/components/SpecSkeleton";
import HistoryPanel from "@/components/HistoryPanel";
import LandingScreen from "@/components/LandingScreen";
import { GenerateSpecResponse } from "@/lib/types";
import { buildFilename, buildMarkdown } from "@/lib/markdown";
import { downloadPdf } from "@/lib/pdf";
import {
  loadHistory,
  saveSpec,
  renameSpec,
  deleteSpec,
  type SpecHistoryEntry,
} from "@/lib/history";

export default function Home() {
  const [spec, setSpec] = useState<GenerateSpecResponse | null>(null);
  const [idea, setIdea] = useState("");
  const [topCopied, setTopCopied] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [entries, setEntries] = useState<SpecHistoryEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setEntries(loadHistory());
  }, []);

  function handleStreamStart() {
    setStreamingText("");
  }

  function handleStreamChunk(accumulated: string) {
    setStreamingText(accumulated);
  }

  function handleStreamError() {
    setStreamingText(null);
  }

  function handleResult(newSpec: GenerateSpecResponse, newIdea: string) {
    const entry = saveSpec({ idea: newIdea, spec: newSpec });
    setEntries((prev) => [entry, ...prev]);
    setActiveId(entry.id);
    setStreamingText(null);
    setSpec(newSpec);
    setIdea(newIdea);
  }

  function handleReset() {
    if (window.confirm("¿Seguro que querés descartar esta especificación?")) {
      setSpec(null);
      setIdea("");
      setStreamingText(null);
      setActiveId(null);
    }
  }

  function handleNew() {
    setSpec(null);
    setIdea("");
    setStreamingText(null);
    setActiveId(null);
  }

  function handleSelect(entry: SpecHistoryEntry) {
    setStreamingText(null);
    setSpec(entry.spec);
    setIdea(entry.idea);
    setActiveId(entry.id);
  }

  function handleRename(id: string, newName: string) {
    renameSpec(id, newName);
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, name: newName.trim() || e.name } : e))
    );
  }

  function handleDelete(id: string) {
    deleteSpec(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (activeId === id) {
      setSpec(null);
      setIdea("");
      setActiveId(null);
    }
  }

  function handleTopCopy() {
    if (!spec) return;
    navigator.clipboard.writeText(buildClipboardText(spec));
    setTopCopied(true);
    setTimeout(() => setTopCopied(false), 2000);
  }

  function handleDownloadPdf() {
    if (!spec) return;
    downloadPdf(spec, idea);
  }

  function handleDownload() {
    if (!spec) return;
    const blob = new Blob([buildMarkdown(spec)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = buildFilename(idea);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Show when="signed-out">
        <LandingScreen />
      </Show>
      <Show when="signed-in">
        <div className="min-h-screen flex bg-gray-50 text-gray-900">
          <HistoryPanel
            entries={entries}
            activeId={activeId}
            onSelect={handleSelect}
            onRename={handleRename}
            onDelete={handleDelete}
            onNew={handleNew}
          />

          <main className="flex-1 flex flex-col items-center px-4 py-16 overflow-y-auto">
        <div className={`w-full transition-all duration-300 ${spec ? "max-w-3xl" : "max-w-2xl"}`}>

          {/* Header — compacto cuando hay resultado */}
          <header className={`text-center transition-all duration-300 ${spec ? "mb-6" : "mb-10"}`}>
            <h1
              className={`font-bold tracking-tight transition-all duration-300 ${
                spec ? "text-2xl" : "text-4xl mb-2"
              }`}
            >
              AI Spec Builder
            </h1>
            {!spec && (
              <p className="text-gray-500 text-sm">
                Convertí tu idea de negocio en una especificación técnica completa.
              </p>
            )}
          </header>

          {streamingText !== null && !spec && <SpecSkeleton />}

          {!spec && streamingText === null ? (
            <SpecForm
              onResult={handleResult}
              onStreamChunk={handleStreamChunk}
              onStreamStart={handleStreamStart}
              onStreamError={handleStreamError}
            />
          ) : spec ? (
            <div className="space-y-4">
              {/* Actions bar */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                  ← Nueva especificación
                </button>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    Descargar PDF
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Descargar .md
                  </button>
                  <button
                    onClick={handleTopCopy}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    {topCopied ? (
                      <>
                        <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        Copiado
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                        </svg>
                        Copiar todo
                      </>
                    )}
                  </button>
                </div>
              </div>

              <SpecOutput spec={spec} />
            </div>
          ) : null}
            </div>
          </main>
        </div>
      </Show>
    </>
  );
}

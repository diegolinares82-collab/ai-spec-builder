"use client";

import { useEffect, useRef, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import type { SpecHistoryEntry } from "@/lib/history";

interface HistoryPanelProps {
  entries: SpecHistoryEntry[];
  activeId: string | null;
  onSelect: (entry: SpecHistoryEntry) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

function formatRelative(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `hace ${d} d`;
  return new Date(timestamp).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
}

export default function HistoryPanel({
  entries,
  activeId,
  onSelect,
  onRename,
  onDelete,
  onNew,
}: HistoryPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  function startEdit(entry: SpecHistoryEntry) {
    setEditingId(entry.id);
    setDraftName(entry.name);
  }

  function commitEdit() {
    if (editingId) onRename(editingId, draftName);
    setEditingId(null);
    setDraftName("");
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftName("");
  }

  function handleDelete(e: React.MouseEvent, id: string, name: string) {
    e.stopPropagation();
    if (window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) {
      onDelete(id);
    }
  }

  return (
    <aside className="flex flex-col h-screen w-72 shrink-0 border-r border-gray-200 bg-white">
      <div className="px-4 py-4 border-b border-gray-100">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva spec
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {entries.length === 0 ? (
          <p className="px-4 py-6 text-xs text-gray-400 text-center leading-relaxed">
            Tu historial aparecerá acá.<br />
            Generá tu primera spec.
          </p>
        ) : (
          <ul className="space-y-0.5 px-2">
            {entries.map((entry) => {
              const isActive = entry.id === activeId;
              const isEditing = entry.id === editingId;
              return (
                <li key={entry.id}>
                  <div
                    onClick={() => !isEditing && onSelect(entry)}
                    className={`group flex items-start gap-2 rounded-lg px-2.5 py-2 cursor-pointer transition-colors ${
                      isActive ? "bg-indigo-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitEdit();
                            if (e.key === "Escape") cancelEdit();
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full text-sm font-medium text-gray-900 bg-white border border-indigo-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      ) : (
                        <p
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            startEdit(entry);
                          }}
                          className={`text-sm font-medium truncate ${
                            isActive ? "text-indigo-700" : "text-gray-800"
                          }`}
                          title={entry.name}
                        >
                          {entry.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatRelative(entry.createdAt)}
                      </p>
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(entry);
                          }}
                          className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700"
                          title="Renombrar"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, entry.id, entry.name)}
                          className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600"
                          title="Eliminar"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-3">
        <UserButton
          appearance={{ elements: { avatarBox: "h-8 w-8" } }}
          showName
        />
      </div>
    </aside>
  );
}

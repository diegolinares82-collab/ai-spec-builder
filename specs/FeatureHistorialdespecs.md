# Historial de specs en localStorage

## 1. Esquema de datos

**Clave única:** `ai-spec-builder:history` → array JSON de entradas.

```ts
interface SpecHistoryEntry {
  id: string;                    // crypto.randomUUID()
  name: string;                  // editable, default: primeros ~60 chars del idea
  idea: string;                  // descripción original (inmutable, alimenta exports)
  spec: GenerateSpecResponse;    // JSON completo
  createdAt: number;             // Date.now()
}
```

`idea` y `name` se separan porque cumplen roles distintos: `idea` alimenta `buildFilename()` y los exports; `name` es la etiqueta editable del panel. Si no se separan, renombrar rompe el filename.

## 2. Funciones de acceso (`lib/history.ts`)

```ts
loadHistory(): SpecHistoryEntry[]
saveSpec({ idea, spec, name? }): SpecHistoryEntry
getSpec(id: string): SpecHistoryEntry | null
renameSpec(id: string, newName: string): void
deleteSpec(id: string): void
```

Todas SSR-safe: en el servidor devuelven `[] / null / void`.

## 3. Punto de guardado

Dentro de `handleResult(newSpec, newIdea)` en `page.tsx`, justo después de que el stream parsea exitosamente. Único punto con el JSON validado y completo.

```
stream completa → onResult(spec, idea) → handleResult:
  1. saveSpec({ idea, spec }) → entry
  2. setActiveId(entry.id)
  3. setEntries(prev => [entry, ...prev])
  4. setSpec(spec); setIdea(idea); setStreamingText(null)
```

No se guarda durante streaming ni al recuperar del historial.

## 4. Componente nuevo: `HistoryPanel.tsx`

```ts
interface HistoryPanelProps {
  entries: SpecHistoryEntry[];
  activeId: string | null;
  onSelect: (entry: SpecHistoryEntry) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}
```

Lista ordenada por `createdAt` desc, item activo resaltado, rename inline (doble clic), delete con confirm, botón "Nueva spec". Puramente presentacional — no conoce localStorage.

## 5. Componentes modificados

| Archivo | Cambio | Por qué |
|---------|--------|---------|
| `page.tsx` | estado `entries`/`activeId`, useEffect de carga, handlers, layout 2 columnas | Único orquestador del estado global |
| `lib/types.ts` | (opcional) tipo `SpecHistoryEntry` | Tipos centralizados |
| `SpecForm.tsx`, `SpecOutput.tsx`, `SpecSkeleton.tsx` | Sin cambios | El historial no afecta generación ni render de la spec |

## 6. Restauración exacta

**Observación:** el render actual con spec depende de **exactamente** `spec` e `idea`. Todo lo demás se deriva (export buttons, header compacto, transiciones).

`handleSelect(entry)`:
```ts
setStreamingText(null);
setSpec(entry.spec);
setIdea(entry.idea);
setActiveId(entry.id);
```

Tras eso: `streamingText === null && spec !== null` → render entra en rama `spec ? (...)` → SpecOutput + barra de export con handlers enchufados a `spec`/`idea`. Indistinguible de generación recién terminada.

No se restauran: `loading`, `error`, `streamingText`, rate limit. Son estado de sesión.

## Orden de implementación

1. `lib/history.ts`
2. `HistoryPanel.tsx`
3. Integrar en `page.tsx` (estado + layout)
4. Conectar `handleResult` → `saveSpec`
5. Conectar `handleSelect` → restauración
6. Rename y delete

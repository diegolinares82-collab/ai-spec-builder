# Autenticación con Clerk

Scope: solo autenticación. El historial sigue en localStorage sin cambios.

## Estado actual (ya scaffoldeado)

- `@clerk/nextjs@^7.3.3` instalado
- `middleware.ts` con `clerkMiddleware` protegiendo `/api/generate-spec`
- `<ClerkProvider>` envolviendo `app/layout.tsx`
- `components/LandingScreen.tsx` con `SignInButton` / `SignUpButton` modales
- `<UserButton />` en el footer de `HistoryPanel`

## Pendiente para cerrar el feature

1. `app/page.tsx`: envolver JSX con `<SignedIn>`/`<SignedOut>` (imports ya están).
2. `app/api/generate-spec/route.ts`: `auth()` + 401 como defensa en profundidad.
3. `.env.local`: agregar `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` (manual — requieren cuenta Clerk).
4. CLAUDE.md (si aplica al proyecto): actualizar env vars y quitar "No authentication".

## 1. Dependencias y variables de entorno

**Instalación:** `npm install @clerk/nextjs`

**Nuevas env vars** (`.env.local` + Vercel):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

`NEXT_PUBLIC_*` se expone al cliente; `CLERK_SECRET_KEY` solo servidor. Documentar en `CLAUDE.md`.

## 2. Provider en layout raíz

`app/layout.tsx` envuelto en `<ClerkProvider>`. Inyecta contexto de auth a hooks y componentes.

## 3. Middleware

Nuevo `middleware.ts` (raíz, no dentro de `app/`):

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/api/generate-spec"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
```

Provee contexto a todas las requests + protege explícitamente `/api/generate-spec`. La página principal queda pública (mostrará landing con sign-in si está deslogueado).

## 4. UI: signed-out / signed-in

Modal sign-in (sin páginas dedicadas) — `<SignInButton mode="modal">`.

`page.tsx` (Clerk v7 usa `<Show when="...">`, no `<SignedIn>`/`<SignedOut>`):
```tsx
<Show when="signed-out"><LandingScreen /></Show>
<Show when="signed-in">{/* layout actual */}</Show>
```

Componente nuevo `components/LandingScreen.tsx`: hero centrado con título, subtítulo y botones "Iniciar sesión" / "Crear cuenta" en modo modal.

`<UserButton />` en footer del `HistoryPanel` (patrón ChatGPT/Claude).

## 5. Protección API route

Middleware ya devuelve 401 sin sesión. Adicional: en el handler de `/api/generate-spec`:

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
```

Defense in depth. Rate limit por IP se mantiene.

## 6. Archivos creados / modificados

| Archivo | Cambio |
|---------|--------|
| `package.json` | dep `@clerk/nextjs` |
| `.env.local` | 2 vars nuevas |
| `CLAUDE.md` | env vars table |
| `middleware.ts` | nuevo |
| `app/layout.tsx` | wrap `<ClerkProvider>` |
| `app/page.tsx` | `<SignedIn>`/`<SignedOut>` |
| `app/api/generate-spec/route.ts` | `auth()` + 401 |
| `components/LandingScreen.tsx` | nuevo |
| `components/HistoryPanel.tsx` | footer con `<UserButton />` |

Sin cambios: `SpecForm.tsx`, `SpecOutput.tsx`, `SpecSkeleton.tsx`, `lib/*`.

## 7. Limitación conocida (fuera de scope)

Historial en localStorage es per-browser, no per-user. Dos usuarios en el mismo browser comparten historial. Solución futura: migrar a DB con `userId` o namespacear localStorage por user.

## Orden de implementación

1. Instalar dep + crear cuenta Clerk + env vars
2. `middleware.ts`
3. `<ClerkProvider>` en layout
4. `LandingScreen.tsx`
5. `page.tsx`: `<SignedIn>`/`<SignedOut>`
6. `<UserButton />` en `HistoryPanel`
7. `auth()` en API route
8. Build + probar flow completo

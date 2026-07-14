# Feature: Exportar spec como PDF

---

**Qué hace**
Agrega un botón "Descargar PDF" junto al botón "Descargar .md" existente. Al hacer clic, genera un PDF de la spec activa y lo descarga directamente desde el navegador, con formato limpio: H1 para el título del proyecto, H2 para cada sección, listas con viñetas para funcionalidades y flujos.

---

**Por qué**
El Markdown requiere un lector compatible para verse bien. El PDF es universalmente legible y presentable — ideal para compartir con clientes, inversores o equipos no técnicos sin fricción.

---

**Criterios de aceptación**

- [ ] El botón "Descargar PDF" aparece a la izquierda del botón "Descargar .md" en la barra de acciones
- [ ] El PDF se genera íntegramente en el cliente, sin llamadas al servidor
- [ ] Implementado con `window.print()` sobre un `<iframe>` oculto con HTML+CSS controlado — sin librerías externas
- [ ] El PDF renderiza: H1 con el nombre del proyecto (derivado del `idea` del usuario), H2 por sección, listas `<ul>` para funcionalidades y flujos, párrafos para los demás campos
- [ ] El nombre del archivo descargado sigue el patrón `spec-{slug}.pdf`, usando la misma función `slugify` existente en `lib/markdown.ts`
- [ ] El botón está deshabilitado / oculto si no hay spec generada
- [ ] La lógica de construcción del HTML vive en `lib/pdf.ts` (simétrico a `lib/markdown.ts`)

---

**No incluye**

- Librerías externas (`jsPDF`, `html2canvas`, `puppeteer`, `@react-pdf/renderer`, etc.)
- Generación de PDF en el servidor / API route
- Control de página, márgenes, fuentes custom ni paginación avanzada
- Vista previa del PDF dentro de la app
- Estilos que repliquen la UI de la app (colores, dark mode, etc.) — solo tipografía limpia

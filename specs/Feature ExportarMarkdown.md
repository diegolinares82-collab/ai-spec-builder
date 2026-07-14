## Export como Markdown — Mini-Spec

---

**Qué hace**
Añade un botón "Descargar .md" que aparece junto al spec generado y descarga el contenido como archivo Markdown en el navegador del usuario.

**Por qué**
El spec generado existe solo en sesión. Sin exportación, el usuario tiene que copiar manualmente el texto — fricción innecesaria que rompe el flujo principal de la herramienta.

---

**Criterios de aceptación**

- [ ] El botón "Descargar .md" solo es visible cuando hay un spec generado (no en estado vacío ni de carga)
- [ ] Al hacer clic, el navegador descarga un archivo `.md` sin llamada al servidor
- [ ] El nombre del archivo es `spec-[slug-de-la-idea].md` (ej: `spec-marketplace-de-plantas.md`), máx 50 chars
- [ ] El contenido del archivo es idéntico al Markdown renderizado en pantalla
- [ ] Funciona en Chrome, Firefox y Safari (desktop)

---

**No incluye**

- Exportación a PDF, Word o cualquier otro formato
- Generación del archivo en el servidor (todo es client-side con `Blob` + `URL.createObjectURL`)
- Input para que el usuario elija el nombre del archivo
- Botón de "Copiar al portapapeles"
- Ningún cambio en el contenido o formato del spec al exportar

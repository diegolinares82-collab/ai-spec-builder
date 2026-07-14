# Plantilla Spec-First para Claude
> Estructura tu proyecto antes de escribir una línea de código o prompt
>
> Créditos: dominicode | Construye con IA: De la Idea al Producto con Claude y Specs

---

## SECCIÓN 1 — Visión del producto

AI Spec Builder transforma cualquier idea de negocio en especificaciones técnicas completas en minutos, no en semanas. Lo que antes requería contratar consultores o aprender a programar, ahora lo resuelves con una descripción simple.

---

## SECCIÓN 2 — Usuarios y casos de uso

1. **Generar spec desde cero** → describe su idea en lenguaje simple y obtiene una especificación técnica completa
2. **Validar su idea** → antes de contratar un desarrollador, entiende qué tan complejo es construirlo
3. **Comunicarse con devs** → usa la spec generada para hablar con freelancers o agencias sin perderse
4. **Estimar costos y tiempos** → la spec le da una base para pedir presupuestos reales
5. **Iterar su idea** → ajusta y refina la spec a medida que su visión evoluciona

---

## SECCIÓN 3 — Funcionalidades

### Input
- El usuario puede describir su idea de producto en lenguaje natural, sin tecnicismos
- El usuario puede indicar el tipo de producto (app móvil, web, SaaS, etc.)
- El usuario puede especificar su industria o nicho de mercado
- El usuario puede agregar contexto adicional como público objetivo o competidores
- El sistema permite cargar una descripción previa para editarla o mejorarla

### Output
- El sistema genera una especificación técnica completa en minutos
- El usuario puede descargar la spec en PDF o documento editable
- El sistema genera un desglose de funcionalidades por módulos
- El sistema estima la complejidad técnica del proyecto
- El usuario puede copiar secciones individuales de la spec
- El sistema genera un glosario técnico explicado en términos simples

### Estados
- El usuario puede guardar borradores de sus ideas sin completarlas
- El usuario puede tener múltiples specs en progreso simultáneamente
- El sistema permite marcar una spec como finalizada o en revisión
- El usuario puede ver el historial de versiones de una spec
- El sistema permite compartir una spec mediante un enlace público

---

## SECCIÓN 4 — Flujos de usuario

### Flujo principal — AI Spec Builder

**Paso 1 — Bienvenida**
El usuario abre la app y ve una pantalla limpia con un campo de texto y el mensaje "Describe tu idea en una oración". No necesita registrarse para empezar.

**Paso 2 — Input de la idea**
El usuario escribe su descripción en lenguaje natural. El sistema valida que haya suficiente información (mínimo de palabras/contexto) antes de continuar.

**Paso 3 — Preguntas de contexto**
El sistema hace 2-3 preguntas cortas para enriquecer la spec: tipo de producto, industria y público objetivo. El usuario responde con opciones rápidas o texto libre.

**Paso 4 — Generación**
El sistema procesa la información y muestra una barra de progreso con mensajes como "Analizando tu idea... Identificando módulos... Generando spec...". Esto toma entre 30 y 60 segundos.

**Paso 5 — Resultado**
El usuario ve su spec completa organizada por secciones. Puede leerla, copiarla o descargarla en PDF.

**Paso 6 — Refinamiento**
El usuario puede ajustar algún dato y regenerar secciones específicas sin volver a empezar desde cero.

### Flujos de error
- **Descripción muy vaga** → el sistema no genera la spec y pide más detalle con un ejemplo concreto
- **Fallo en la generación** → muestra un mensaje claro, guarda el input del usuario y permite reintentar sin perder nada
- **Pérdida de conexión** → si ocurre durante la generación, el sistema reintenta automáticamente y avisa al usuario
- **Resultado de baja calidad** → el usuario puede marcar la spec como insatisfactoria y el sistema ofrece regenerarla con más preguntas

---

## SECCIÓN 5 — Arquitectura

### Stack tecnológico
- **Frontend:** Next.js 16 con React y Tailwind CSS
- **Backend:** API Routes de Next.js (sin servidor separado)
- **IA:** Anthropic SDK conectado a Claude
- **Deploy:** Vercel

### Decisiones clave
- Se usa un monorepo único — frontend y backend en el mismo proyecto Next.js, sin infraestructura adicional
- Las API Routes actúan como capa intermedia entre el cliente y Claude, protegiendo la API key
- Vercel maneja el deploy automático y el escalado sin configuración adicional
- Tailwind CSS permite iterar el diseño rápido sin escribir CSS custom

---

## SECCIÓN 6 — Requisitos no funcionales

### Rendimiento
- La spec debe comenzar a mostrarse en pantalla en menos de 3 segundos desde que el usuario envía su idea (usando streaming de Claude)
- La interfaz debe ser usable en conexiones móviles estándar (3G/4G)
- El tiempo total de generación no debe superar 60 segundos

### Seguridad
- La API key de Anthropic nunca se expone al cliente — solo vive en variables de entorno del servidor en Vercel
- Las API Routes validan y sanitizan el input del usuario antes de enviarlo a Claude
- No se almacena información sensible del usuario sin su consentimiento explícito

### Accesibilidad
- La interfaz debe ser navegable con teclado
- Contraste mínimo de 4.5:1 en todos los textos (WCAG AA)
- Los estados de carga deben comunicarse con texto, no solo con animaciones

---

## Fuera del alcance — lo que NO vamos a construir

- **Autenticación de usuarios** — no habrá login, registro ni perfiles en esta versión
- **Base de datos** — no se guardan specs generadas ni historial de conversaciones
- **Pagos o planes** — no hay suscripciones ni modelo freemium
- **Editor de specs** — el usuario puede leer y copiar, pero no editar la spec dentro de la app
- **Exportación a herramientas externas** — no integración con Notion, Jira, Linear, etc.
- **Colaboración** — no hay funcionalidad multiusuario ni de compartir en tiempo real
- **Soporte multiidioma** — solo español o inglés, sin selector de idioma
- **App móvil nativa** — solo web responsiva

## Features 
Exportar como Markdown
Exportar como pdf 
Streaming en la respuesta
Historial de specs
Login con clerk
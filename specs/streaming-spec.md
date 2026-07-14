# Streaming de respuesta — AI Spec Builder

**Qué hace**
Convierte la API route de generación de spec a streaming con la Anthropic SDK, y actualiza el frontend para renderizar los tokens conforme llegan, eliminando el silencio de 10-15 segundos entre clic y resultado.

**Por qué**
La percepción de inactividad destruye la confianza del usuario. Streaming hace que el tiempo de espera sea idéntico en duración pero completamente tolerable — el usuario ve progreso inmediato y puede abortar si el output va en la dirección equivocada.

**Criterios de aceptación**
- [ ] La API route usa `anthropic.messages.stream()` y devuelve un `ReadableStream` con `Content-Type: text/plain; charset=utf-8`
- [ ] El frontend consume el stream con `fetch` + `response.body.getReader()` y acumula los chunks en estado React
- [ ] El texto parcial se renderiza token a token en la misma UI donde hoy aparece el output completo
- [ ] Al finalizar el stream, el JSON acumulado es parseado y validado — si el parse falla, se muestra error y no se exponen botones de exportar
- [ ] Los botones "Exportar Markdown" y "Exportar PDF" se activan solo cuando el stream termina exitosamente (estado `complete`), no durante el streaming
- [ ] Un indicador visual (spinner o cursor parpadeante) está visible durante el streaming y desaparece al completar
- [ ] Si el stream se interrumpe (error de red, timeout), se muestra mensaje de error y el usuario puede reintentar

**No incluye**
- Cancelación del stream desde el frontend (botón "Detener") — el usuario puede navegar o recargar
- Streaming parcial de secciones individuales del JSON (se hace streaming del texto completo, parse al finalizar)
- Cambios al formato o contenido del prompt de Claude
- Persistencia, caché o historial de specs generadas
- Cambios al diseño visual más allá del indicador de progreso mínimo

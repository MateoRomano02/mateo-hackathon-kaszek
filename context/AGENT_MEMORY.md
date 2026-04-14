# AGENT_MEMORY.md — SignalOS · Staff Product Engineer Reference

> Este archivo es la memoria operativa del agente. Todo Claude que trabaje en este repo debe leerlo antes de emitir código. Refleja IDEA.md + ARCHITECTURE.md en formato accionable.

---

## 1. PRODUCTO (North Star)

- **Qué es:** Copiloto de aprendizaje técnico para Marketers (beachhead). Convierte ruido fragmentado (posts, newsletters, tools) en rutas de aprendizaje accionables.
- **Diferenciador clave:** "Skill Stocks" — cada skill se clasifica como Rising / Stable / Degrading / Gone. El sistema te dice en qué dejar de invertir tiempo, no solo qué aprender.
- **Usuario prioridad:** Marketer no técnico con ansiedad profesional por no adoptar IA.
- **5 Outcomes (filtro de features):** Bajar costos · Bajar tiempos · Uso específico · Hacer tareas mejor · Aumentar eficiencia. Si una feature no empuja al menos uno → fuera del scope.

---

## 2. ARQUITECTURA MANDATORIA (Feature-Sliced Design)

```
src/
  app/          ← Bootstrap: router, providers, layouts globales SOLO
  pages/        ← Composición de vistas (Onboarding, Dashboard, Inbox, Analysis, Actions, Memory)
  features/     ← Casos de uso: onboarding · content-intake · analysis · action-plan · dashboard
  entities/     ← Tipos de dominio duro: UserProfile · VerticalType · ContentItem · SkillStock
  services/     ← AIAnalysisService (interfaz) · MockAnalysisService · AnthropicAnalysisServiceAdapter
  shared/       ← Botones base · hooks puros · utils · tipos comunes · constants/enums
  config/       ← verticals/marketer.ts (MVP) · estructura para recruiter, developer, ops
```

**Estado actual del repo:** Solo existe `src/App.tsx` (scaffold vacío), `src/components/ui/` (shadcn button/card/dialog/input), `src/lib/utils.ts`, `src/main.tsx`. Toda la estructura Feature-Sliced debe construirse desde cero.

---

## 3. RESTRICCIONES DE CÓDIGO (no negociables)

- **No lógica de agentes en componentes.** Toda llamada a Anthropic vive en `services/AnthropicAnalysisServiceAdapter`. Las páginas y features consumen solo la interfaz `AIAnalysisService`.
- **No llamadas directas a Anthropic desde la UI.** Siempre a través del service adapter.
- **App.tsx absurdamente liviano.** Solo importa Providers y Router desde `app/`. Cero UI, cero mocks, cero agentes.
- **Archivos de ~150-200 líneas máximo.** Funciones chicas y claras. Si crece, partir.
- **No magic strings.** Usar Enums/Constants en `shared/constants/`.
- **Componentes UI en `shared/ui/`.** `src/components/` genérico está prohibido (los shadcn instalados ahí deben migrarse o re-exportarse desde `shared/ui/`).
- **Mocks en `services/mock/`.** MockAnalysisService devuelve JSON falso realista. Es el default para demo.
- **VerticalType** debe tipar: `'marketer' | 'recruiter' | 'developer' | 'ops'` — MVP solo usa `marketer`.

---

## 4. PATRONES OBLIGATORIOS

### Hook de inicialización
```tsx
// shared/hooks/useOnInit.ts
import { useEffect } from "react";
export const useOnInit = (cb: () => void) => {
  useEffect(() => { cb(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
};
export const useAlIniciar = useOnInit;
```
Usar `useOnInit` para cualquier carga al montar. Prohibido escribir `useEffect(() => {}, [])` inline en componentes.

### Manejo de errores centralizado
```ts
// shared/utils/errors.ts — ya definida en ARCHITECTURE.md
// Usar obtenerMensajeError(error) en todos los try/catch de red o AI calls
```

### Zod en Tool Use
Todo `tool_use` de Anthropic debe tener su schema validado con Zod antes de procesarse.

---

## 5. FLUJO HAPPY PATH (MVP End-to-End)

```
1. Onboarding  → Usuario declara rol (Marketer) + stack actual → diagnóstico inicial
2. Ingesta     → Scout: el usuario pega un link/texto → Claude lo analiza
3. Dashboard   → Portafolio de Skill Stocks (Rising/Stable/Degrading/Gone) + ruta sugerida
4. Acción      → Botón "Proyecto Pre-Armado" → Claude genera mini reto aplicable
```

---

## 6. STACK & ENV

- React 19 + TypeScript + Vite (`npm run dev`)
- Zustand (estado reactivo entre Claude y UI)
- Zod (validación de schemas y Tool Use)
- `@anthropic-ai/sdk` — Modelo: **`claude-sonnet-4-6`** siempre (salvo indicación explícita de opus)
- Tailwind CSS v4 · Shadcn/ui
- API Key: `import.meta.env.VITE_ANTHROPIC_API_KEY` — nunca hardcodeada
- Estética: **Dark Premium** — fondo `zinc-950`, texto `zinc-50`, acentos en `indigo` o `violet`

---

## 7. SUB-AGENTES DE DOMINIO (Motor de IA)

Los 6 sub-agentes conceptuales del producto. Cada uno mapea a una función en `services/`:

| Sub-agente | Función | Service method |
|------------|---------|----------------|
| Scout      | Ingesta links/repos | `ingestContent(url)` |
| Dedupe     | Agrupa temas, elimina ruido | `deduplicateContent(items[])` |
| Relevance  | Prioriza por rol/nivel | `rankByRelevance(items[], profile)` |
| Tutor      | Explica por qué importa | `explainRelevance(item, profile)` |
| Practice   | Genera mini retos | `generateProject(skill, profile)` |
| Memory     | Refuerzo + limpia Degrading/Gone | `updateSkillMemory(profile)` |

Para la demo: MockAnalysisService simula respuestas de todos. AnthropicAdapter conecta los reales.

---

## 8. PÁGINAS OBJETIVO

| Página | Ruta | Features que compone |
|--------|------|----------------------|
| Onboarding | `/` | `features/onboarding` |
| Dashboard | `/dashboard` | `features/dashboard`, skill stocks |
| Inbox | `/inbox` | `features/content-intake` |
| Analysis | `/analysis` | `features/analysis` |
| Actions | `/actions` | `features/action-plan` |
| Memory | `/memory` | skill memory view |

---

## 9. RIESGOS TÉCNICOS

- **API Key en frontend:** Aceptado para hackathon. No hacer en producción.
- **Sin backend:** Todo en local + mock. El adapter de Anthropic llama directo desde el browser.
- **CORS con Anthropic SDK:** Usar el SDK en modo browser (está soportado). No usar fetch directo.
- **Shadcn en src/components/ui/:** Está fuera de la estructura FSD. Re-exportar desde `shared/ui/` para mantener la arquitectura limpia.

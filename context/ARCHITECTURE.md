# 🏗️ Arquitectura Técnica & Auditoría (Frontend-Only Stack)

> Completar la sección "Mi implementación" con la idea que escribas en `IDEA.md`.
> Claude Code lee este archivo para tomar decisiones de arquitectura en React.

---

## Stack elegido (React + TS + Zod)

### Frontend (SPA)
- **Framework:** Vite + React 19 (`npm create vite`)
- **Lenguaje:** TypeScript (Aporta tool-safety y autocompletado en el hackathon)
- **Estilos:** Tailwind CSS v4 + Shadcn/ui.
- **Estado Global:** Zustand.

### Interacción AI (Cliente Directo)
- **SDK:** `@anthropic-ai/sdk` en el cliente.
- **Modelo:** `claude-sonnet-4-6` (default) — rápido y poderoso para Tool Use.
- **Validación Tool Use:** Zod.

### Variables de entorno (.env)
```
VITE_ANTHROPIC_API_KEY=sk-ant-...        # lo recibo mañana
VITE_CLAUDE_CONSOLE_ID=...               # mi Console ID
VITE_APP_NAME=Mi App
```

---

## Patrones a usar (React + AI)

### Patrón 1: Tool Use con Zod (EL MÁS IMPORTANTE)
```typescript
import { z } from 'zod';

// Zod schema te asegura data perfecta
const SearchToolSchema = z.object({
  query: z.string().describe("Lo que busco"),
  category: z.string().optional()
});

// Puedes pasar la definición Zod -> JSON Schema automático a la API de Claude.
```

### Patrón 2: Zustand Store para Sesiones de Chat
```typescript
import { create } from 'zustand';

interface ChatStore {
  messages: Array<{ role: 'user' | 'assistant', content: string }>;
  isTyping: boolean;
  addMessage: (msg: any) => void;
  // ...
}
```

---

## Auditoría de calidad (checklist pre-entrega)

### Funcionalidad
- [ ] Happy path funciona de punta a punta
- [ ] Zod valida correctamente las outputs de los Tools
- [ ] El store mantiene el historial correctamente al navegar
- [ ] Animaciones y Spinners/Togglers en cada llamada a la API (Para dar "feel" de IA real)

### Código
- [ ] Variables de entorno via `import.meta.env`
- [ ] Sin console.logs intrusivos en master

---

## Optimización de tokens

### Reglas de oro
1. Sonnet 4.6 por defecto (5x más barato que Opus)
2. No re-enviar PDFs pesados en cada turno a menos que sea vital.
3. Usar max_tokens razonable (1024 para respuestas, 2048 para agentes)

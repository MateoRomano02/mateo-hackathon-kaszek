# CLAUDE.md — Kaszek x Anthropic Hackathon 2026

## Contexto
Hackathon presencial, 14 Abril 2026, Buenos Aires. **Equipo: 1 persona. Coding time: ~6.5h.**

## Idea del proyecto
> [COMPLETAR esta noche en context/IDEA.md — luego copiar resumen acá]

## Track
> [COMPLETAR: Ecommerce / Fintech / Educación / Open]

## Stack (Modern Frontend)
- Frontend: React 19 + TypeScript + Vite (`npm run dev`)
- Estado/Agentes: Zustand
- Validación y Schemas: Zod
- Interacción con Claude: `@anthropic-ai/sdk` (Cliente directo / Frontend-only para hackathon)
- UI/CSS: Tailwind CSS v4 + Shadcn/ui
- Modelo: claude-sonnet-4-6 (SIEMPRE, salvo que yo diga opus)

## Estructura de archivos
```
├── CLAUDE.md                      ← cerebro (este archivo)
├── context/IDEA.md                ← idea + usuario + pain point (INYECCIÓN PRINCIPAL)
├── context/FOUNDER_THINKING.md    ← validación de negocio
├── context/ARCHITECTURE.md        ← decisiones técnicas frontend
├── context/TUTORIA.md             ← guía hora a hora del día
├── docs/HACKATHON_CONTEXT.md      ← info del evento
├── src/components/ui/             ← componentes shadcn instalados
├── src/store/                     ← manejo de estado con Zustand
├── src/lib/utils.ts               ← utilidades
├── src/App.tsx                    ← Entrypoint de la App
```

## Reglas de código
1. Todo Tool Use de Anthropic debe estar validado con esquemas de `zod`.
2. Componentes UI se instalan por CLI de shadcn (`npx shadcn@latest add ...`).
3. Nunca hardcodear API keys - usar variables de entorno `import.meta.env.VITE_ANTHROPIC_API_KEY`.
4. Modelo siempre claude-sonnet-4-6 salvo indicación explícita de opus.
5. Utilizar Zustand para sincronizar el estado reactivo entre Claude y la UI.
6. CSS con Tailwind v4 native (sin config.js pesado).

## Prioridades (orden estricto)
1. Happy path funcionando end-to-end (UI -> Llamada a Sonnet -> Respuesta en UI)
2. Tool Use visible (los jueces lo valoran MUCHO). Schema con Zod.
3. Datos de ejemplo reales (no texto "test")
4. UI clara y llamativa (Tailwind/Shadcn ayuda rápido)
5. Manejo de errores

## Comandos disponibles de Scaffolding
- /plan      → auditar y planificar basándose en `IDEA.md`
- /ship      → formatear + commit + build (`npm run build`)
- /demo-ready → verificar que el demo corre con `npm run dev` sin errores.

## Deadline
17:00 → repo + descripción + video 2 min. No hay extensiones.
Si no sabés qué hacer → leer context/IDEA.md y context/ARCHITECTURE.md
Si algo está fuera del MVP → no lo hagas

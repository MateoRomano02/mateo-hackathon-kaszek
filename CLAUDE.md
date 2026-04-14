# CLAUDE.md — Kaszek x Anthropic Hackathon 2026

## Contexto
Hackathon presencial, 14 Abril 2026, Buenos Aires. **Equipo: 1 persona. Coding time: ~6.5h.**

## Idea del proyecto
> [COMPLETAR esta noche en context/IDEA.md — luego copiar resumen acá]

## Track
> [COMPLETAR: Ecommerce / Fintech / Educación / Open]

## Stack
- Python 3.11+, anthropic SDK
- Modelo: claude-sonnet-4-6 (SIEMPRE, salvo que yo diga opus)
- UI: Streamlit → streamlit run ui.py
- API: FastAPI → uvicorn api_server:app --reload
- Persistencia: SQLite o JSON local

## Estructura de archivos
```
├── CLAUDE.md                      ← cerebro (este archivo)
├── context/IDEA.md                ← idea + usuario + pain point (COMPLETAR)
├── context/FOUNDER_THINKING.md    ← validación de negocio
├── context/ARCHITECTURE.md        ← decisiones técnicas
├── context/TUTORIA.md             ← guía hora a hora del día
├── docs/HACKATHON_CONTEXT.md      ← info del evento
├── src/api/claude_client.py       ← wrapper Claude (LISTO)
├── src/agents/base_agent.py       ← agente con tool use (LISTO)
├── src/tools/tool_definitions.py  ← schemas de tools (LISTO)
├── prompts/system_prompts.py      ← prompts del sistema
├── ui.py                          ← Streamlit UI
└── api_server.py                  ← FastAPI backend
```

## Reglas de código
1. Todas las llamadas Claude van por src/api/claude_client.py
2. Nunca hardcodear API keys - usar os.environ.get("ANTHROPIC_API_KEY")
3. Modelo siempre claude-sonnet-4-6 salvo indicación explícita de opus
4. System prompts en prompts/system_prompts.py, no inline
5. Siempre try/except en llamadas a la API
6. Streamlit como UI principal para el demo

## Prioridades (orden estricto)
1. Happy path funcionando end-to-end
2. Tool use visible (los jueces lo valoran MUCHO)
3. Datos de ejemplo reales (no texto "test")
4. UI clara y funcional
5. Manejo de errores
6. Features adicionales (solo si sobra tiempo)

## Comandos disponibles
- /plan      → auditar y planificar sin escribir código
- /ship      → limpiar + commit + verificar para entrega
- /demo-ready → verificar que el demo funciona en 10 min

## Deadline
17:00 → repo + descripción + video 2 min. No hay extensiones.
Si no sabés qué hacer → leer context/IDEA.md y context/ARCHITECTURE.md
Si algo está fuera del MVP → no lo hagas

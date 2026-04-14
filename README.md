# Hackathon Kaszek x Anthropic — Buenos Aires 2026

> [COMPLETAR CON EL NOMBRE DE TU PROYECTO]

Construido en el primer hackathon de Anthropic en LATAM — 14 de Abril, 2026.

## ¿Qué hace?
[COMPLETAR: descripción en 2-3 líneas de qué problema resuelve y para quién]

## Track
[COMPLETAR: Ecommerce / Fintech / Educación / Open]

## Demo
[COMPLETAR: link al video de 2 minutos]

---

## Instalación rápida (3 comandos)

```bash
# 1. Setup completo
bash setup.sh

# 2. Agregar tu API key
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env

# 3. Correr la UI
streamlit run ui.py
```

## Arquitectura
- `src/api/claude_client.py` — wrapper Claude API (chat, tool use, structured output, agentes)
- `src/agents/base_agent.py` — loop agéntico con tool use automático
- `src/tools/tool_definitions.py` — schemas de herramientas disponibles
- `prompts/system_prompts.py` — prompts del sistema
- `ui.py` — UI Streamlit (demo visual)
- `api_server.py` — API FastAPI (endpoints REST)

## Documentación del contexto
- `CLAUDE.md` — cerebro del proyecto (Claude Code lo lee en cada sesión)
- `context/IDEA.md` — descripción detallada de la idea y usuario
- `context/FOUNDER_THINKING.md` — validación de negocio
- `context/ARCHITECTURE.md` — decisiones técnicas
- `context/TUTORIA.md` — guía de ejecución del día
- `docs/HACKATHON_CONTEXT.md` — info del evento

## Equipo
- [Tu nombre] — founder/builder solo

---
*Built with Claude Sonnet 4.6 at Kaszek x Anthropic Hackathon 2026, Buenos Aires*

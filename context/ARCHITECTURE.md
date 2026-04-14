# 🏗️ Arquitectura Técnica & Auditoría

> Completar la sección "Mi implementación" con la idea elegida.
> Claude Code lee este archivo para tomar decisiones de arquitectura.

---

## Stack elegido (hackathon-optimized)

### Backend
- **Lenguaje:** Python 3.11+
- **Framework API:** FastAPI (si necesitás endpoints) / solo scripts (si no)
- **Claude SDK:** `anthropic` >= 0.40.0
- **Modelo:** `claude-sonnet-4-6` (default) — rápido y barato
  - Usar `claude-opus-4-6` solo para razonamiento complejo
- **UI:** Streamlit (arranca en 1 comando, se ve bien para demo)

### Persistencia
- **SQLite** para datos locales (sin necesidad de Postgres)
- **JSON files** para configuración y datos de ejemplo
- **No DB si no es necesario** — menos complejidad = menos bugs

### Variables de entorno (.env)
```
ANTHROPIC_API_KEY=sk-ant-...        # lo recibo mañana
CLAUDE_CONSOLE_ID=...               # mi Console ID
APP_NAME=Mi App
MODEL=claude-sonnet-4-6
DEBUG=true
```

---

## Patrones de Claude a usar

### Patrón 1: Tool Use (RECOMENDADO para impresionar jueces)
```python
# Claude decide qué herramienta usar y cuándo
tools = [SEARCH_TOOL, DB_QUERY_TOOL, CALCULATE_TOOL]
result = chat_with_tools(user_message, tools, system_prompt)
# Claude llama las tools automáticamente
```

### Patrón 2: Agente con loop
```python
# Para tareas multi-paso donde Claude toma decisiones
agent = Agent(system_prompt, tools, handlers, max_iterations=5)
result = agent.run("Tarea compleja que requiere múltiples pasos")
```

### Patrón 3: Structured Output
```python
# Para extraer datos con estructura garantizada
result = structured_output(user_input, schema=MY_SCHEMA)
# Garantiza JSON válido con el schema dado
```

### Patrón 4: Multi-turn con historial
```python
# Para flujos conversacionales con memoria
response, history = chat_with_history(messages, system_prompt)
```

---

## Mi implementación (COMPLETAR con la idea)

### Módulos principales
```
src/
├── api/
│   ├── claude_client.py      # wrapper Claude (YA HECHO)
│   └── [AGREGAR: integraciones externas si necesitás]
├── agents/
│   ├── base_agent.py         # loop agéntico (YA HECHO)
│   └── [AGREGAR: agentes específicos de tu dominio]
├── tools/
│   ├── tool_definitions.py   # schemas (YA HECHO)
│   └── [AGREGAR: implementaciones reales de tools]
└── utils/
    └── helpers.py            # utilidades (YA HECHO)
```

### Tools que voy a implementar
[COMPLETAR: qué tools reales va a tener tu app]
Ejemplo:
- `buscar_producto(query)` → llama MercadoLibre API
- `analizar_review(texto)` → extrae sentiment + acción
- `generar_respuesta(contexto)` → draft respuesta personalizada

### Flujo principal (happy path)
```
1. Usuario ingresa: [COMPLETAR]
2. Claude analiza con tool: [COMPLETAR]
3. Claude devuelve: [COMPLETAR]
4. UI muestra: [COMPLETAR]
```

---

## Auditoría de calidad (checklist pre-entrega)

### Funcionalidad
- [ ] Happy path funciona de punta a punta
- [ ] Los errores de API se manejan gracefully (try/catch)
- [ ] El demo no crashea con inputs normales
- [ ] Los datos de ejemplo están cargados

### Código
- [ ] No hay API keys hardcodeadas
- [ ] El .env.example tiene todas las variables
- [ ] Los prints de debug están removidos
- [ ] El código es legible (nombres claros, sin magia)

### Demo
- [ ] `streamlit run ui.py` arranca sin errores
- [ ] La UI explica qué hace la app en 2 líneas
- [ ] El flujo principal es demostrable en < 60 segundos
- [ ] Hay datos de ejemplo reales (no "test test test")

### Repo
- [ ] README.md con instalación clara (3 comandos max)
- [ ] .gitignore correcto (no sube .env ni __pycache__)
- [ ] Repo público en GitHub
- [ ] Último commit es limpio y descriptivo

---

## Seguridad (mínimo necesario para demo)

### Lo que SÍ importa
- API key en .env, nunca en código
- No loggear datos sensibles del usuario
- Validar inputs antes de mandarlos a Claude (evitar prompt injection obvio)

### Lo que NO importa para el hackathon
- Auth de usuarios
- Rate limiting
- HTTPS (es local)
- Tests de seguridad formales

### Prompt injection básico
```python
def sanitize_user_input(text: str) -> str:
    # Remover intentos obvios de jailbreak
    dangerous_patterns = ["ignore previous", "system prompt", "disregard"]
    for pattern in dangerous_patterns:
        if pattern.lower() in text.lower():
            return "[Input sanitizado]"
    return text[:2000]  # limitar longitud
```

---

## Optimización de tokens (para no quemar créditos)

### Reglas de oro
1. Sonnet 4.6 por defecto (5x más barato que Opus)
2. System prompts < 500 tokens
3. Cachear respuestas repetidas si podés
4. Usar max_tokens razonable (1024 para respuestas, 2048 para agentes)
5. No mandar historial completo si no es necesario

### Estimación de costo para el demo
- Sonnet: $3/1M input + $15/1M output
- Demo típico: ~50 llamadas × ~500 tokens promedio = 25K tokens ≈ $0.08
- Con créditos de Anthropic: prácticamente gratis

---

## Integración con herramientas del scaffold

### claude-mem (persistencia de contexto)
```bash
# Instalado como plugin de Claude Code
# Claude Code automáticamente persiste el contexto entre sesiones
# No requiere código adicional en la app
```

### ruflo (multi-agente, si lo necesitás)
```bash
# Solo si tu arquitectura requiere múltiples agentes coordinados
# No necesario para MVP básico
npx ruflo init  # si lo usás
```

### claude-code-best-practice
```
# Los comandos están en .claude/commands/
# Las skills en .claude/skills/
# CLAUDE.md es el cerebro del proyecto
```

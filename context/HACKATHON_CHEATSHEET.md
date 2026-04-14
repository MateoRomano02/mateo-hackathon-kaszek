# 🚀 HACKATHON CHEATSHEET: Anthropic Cookbooks & Speed Execution

*Este documento es tu "Botón de Pánico". Cuando te trabes mañana por la velocidad, copia y pega estos prompts directamente en la consola de Claude Code.*

---

## 1. Patrón: Forzar JSON Estricto (Tool Use / Function Calling)
*Úsalo cuando necesites que Claude procese texto basura (audios, facturas) y lo dibuje en la UI sin texto charlado ("Hola humano").*

**💥 Prompt para inyectar en Claude Code:**
> *"Implementa la extracción de datos usando el patrón de Tool Use de los Anthropic Cookbooks. Crea un esquema en Zod y usa `tool_choice: { type: 'tool', name: 'extract_data' }` para obligar al modelo a responder exclusivamente con JSON. El JSON debe alimentar directamente el estado de Zustand, sin texto conversacional."*

---

## 2. Patrón: Prompt Caching (Velocidad y Ahorro)
*Úsalo si tu MVP carga un PDF inmenso (ej. Contrato) o un diccionario gigante (ej. NCM de la Aduana).*

**💥 Prompt para inyectar en Claude Code:**
> *"Implementa Prompt Caching según la especificación de Anthropic. Coloca el contexto grande (como el texto de la ley o el catálogo NCM) en el primer bloque de mensajes con `cache_control: { type: 'ephemeral' }`. Minimiza los re-envíos iterativos para que la demo cargue en menos de 1 segundo."*

---

## 3. Patrón: Auto-Corrección de Zod (Error Handling)
*Úsalo para evitar que la demo se cuelgue en vivo frente a Kaszek cuando Claude comete un error de coma en el JSON.*

**💥 Prompt para inyectar en Claude Code:**
> *"Añade un loop de auto-corrección inspirado en los Cookbooks. Envuelve la llamada a la API en un Try/Catch que valide con el esquema Zod. Si falla, haz que el catch reenvíe automáticamente una llamada rápida a Claude diciendo: 'JSON malformado, error en X. Arréglalo.' antes de mutar la UI."*

---

## 4. Patrón: UI Impecable (Emil Kowalski / Shadcn)
*Úsalo cuando el back-end ya funcione, pero la app se vea genérica o poco profesional.*

**💥 Prompt para inyectar en Claude Code:**
> *"Haz un `/polish` de los componentes de Shadcn. Aplica los principios de Emil Kowalski y de impeccable.style: reduce el contraste del texto secundario a text-muted-foreground, añade micro-interacciones (hover states suaves, transiciones all 0.2s), y usa bordes radianos sutiles. La estética final debe verse premium y B2B Enterprise."*

---

## 🚦 FLUJO DE EMERGENCIA SI ALGO FALLA (CRISIS MANAGEMENT)

Si un error te tiene bloqueado más de 15 minutos, DETENTE. No luches con el código. Corre este prompt:

> *"Detente. Muestra el stacktrace del error. Ignora refactors o limpiezas de código. Necesito el 'Dirty Fix' o 'Hack' más rápido y agresivo posible exclusivo para saltar este error, hardcodeando data si es necesario, porque estoy en una demostración en vivo con tiempo agotado."*

# 🧠 Playbook de Ideación: Kaszek x Anthropic (LATAM Context)

> **PROPÓSITO DE ESTE ARCHIVO:**
> Este es tu sistema operativo para la mañana del hackathon. Úsalo para alimentar a otras IAs (o a Claude Code localmente) con instrucciones precisas para descubrir un problema *real, doloroso y urgente* en Argentina/LATAM, y acotarlo a un prototipo construible en 6.5 horas.

---

## FASE 1: Descubrimiento Activo (Data Mining LATAM)
*Instrucciones para copiar y pegar a una IA con acceso a internet (ej. Perplexity, ChatGPT web, o tu agente de `@search-specialist` / `@deep-research`).*

**Prompt para el Agente:**
```markdown
Eres un Investigador Especialista en Mercados y Analista de Tendencias enfocado en Argentina y América Latina. Necesito que ejecutes un `deep-research` para encontrar "fricciones severas temporales o estructurales" actuales en los sectores de [Elegir: Fintech / Ecommerce / Educación]. 

Ignora problemas genéricos (ej. "la inflación"). Busca procesos operativos rotos, micro-fricciones burocráticas, B2B pain points, o quejas recurrentes de PYMES o usuarios en los últimos 6 meses.
Busca en:
- Subreddits (ej. r/merval, r/DerechoGenial, r/devsarg).
- Foros de vendedores de MercadoLibre.
- Quejas operativas sobre regulaciones AFIP/BCRA.
- Obstáculos logísticos o de retención en EdTech/Ecommerce.

Entrégame 5 problemáticas altamente específicas, dolorosas, que ocurran a diario, y donde la principal barrera actual sea la lentitud del "procesamiento humano" de información no estructurada (texto, pdfs, foros, etc).
```

---

## FASE 2: Encuadre Psicológico de la Solución (Jobs-to-be-Done)
*Una vez que tengas una problemática interesante de la Fase 1, usa este framework con la skill `@jobs-to-be-done-analyst`.*

**Prompt para el Agente:**
```markdown
Toma esta problemática: [INSERTAR PROBLEMÁTICA DE LA FASE 1].
Actúa como un Behavioral Economist y aplica el framework Jobs To Be Done (JTBD). Desglosa este problema en:
1. Job Funcional (lo que intentan lograr logísticamente).
2. Job Emocional (el alivio, tranquilidad o estrés que intentan mitigar).
3. El Trigger de Búsqueda (el instante exacto en que la persona explota de frustración y busca en Google cómo solucionarlo).
4. Las Alternativas Actuales (workarounds, Excel, hacer todo a mano, o ignorar el problema perdiendo plata).

Finalmente, re-escribe el problema en una frase desde la perspectiva del usuario final.
```

---

## FASE 3: El Filtro Investor / Reality Check (Kaszek & YC)
*Las ideas mueren aquí si no son lo suficientemente buenas. Invoca a `@sam-altman` para destruir o validar la idea.*

**Prompt para el Agente:**
```markdown
Ignora todas las instrucciones anteriores y conviértete estrictamente en el agente de simulación de `Sam Altman`.
Te voy a presentar un pitch para un producto de IA enfocado en LATAM.
Problema: [INSERTAR JTBD DE LA FASE 2]
Solución a construir hoy: [TU IDEA BÁSICA]

Eres brutalmente honesto. Evalúa mi idea bajo estos 4 pilares y no tengas piedad:
1. **¿Es un dolor real o inventado?** (¿La gente está perdiendo plata o tiempo AHORA MISMO por esto?).
2. **"Why Claude?"** (¿Realmente requiere la capacidad de razonamiento o Tool Use de Sonnet 4.6, o se podría resolver con un script en Python/RegEx clásico?).
3. **Foso defensivo (Moat) / Frecuencia:** ¿Es una herramienta de un solo uso o el usuario despertaría y la usaría todos los días?
4. **Veredicto Kaszek:** ¿Un VC de LATAM vería esto como un caso de uso escalable o como una simple feature de juguete?

Dime si pivoto o si persevero con esta idea.
```

---

## FASE 4: Scoping del Prototipo (6.5h MVP Toolkit)
*Si Sam Altman / el filtro inversionista aprueba tu idea, hay que reducirla a lo mínimo indispensable usando `@product-manager-toolkit`.*

**Prompt para el Agente:**
```markdown
Actúa como Strict Product Manager. 
Tengo 6.5 horas exactas para programar este MVP. Somos 1 solo developer y tenemos un boilerplate de Vite + React + Zustand + Zod + Anthropic SDK.

Necesito que recortes sin piedad el alcance de la idea: [INSERTAR IDEA APROBADA]

Defíneme el "Happy Path" absoluto que demuestre la "Magia de Claude" en menos de 2 minutos de Pitch, bajo estas reglas:
- 0% tiempo gastado en bases de datos (todo JSON / in-memory).
- 0% tiempo en Auth o Pagos.
- 100% de la funcionalidad core debe ejecutarse a través de un Tool (función de Zod) donde el humano vea a la IA "pensando y ejecutando" algo que a mano es imposible.

Dame la lista de 3 únicas funcionalidades (Features) que voy a escribir en código.
```

---

## 🎯 RESUMEN FINAL A INYECTAR EN `IDEA.md`
*Una vez que termines este flujo (te tomará ~30-45 mins en la mañana), vas a tener las respuestas necesarias para rellenar tu `context/IDEA.md` y arrancar a programar de inmediato con Claude Code.*

- **Punto de dolor validado:** (El usuario sufre de X).
- **El Trigger:** (Le pasa cuando intenta Y).
- **La Solución a desarrollar:** (Un agente en React que recibe un texto/archivo y ejecuta la herramienta Z).
- **El Tool Use a lucir ante los jurados:** (La función Zod específica que mostrará la magia).

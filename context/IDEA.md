# 🧠 SIGNAL OS: Copiloto de Aprendizaje Técnico Personalizado

> **Regla de Operación:** Todo Agente (Claude) que trabaje en este Hackathon debe leer este documento para entender la Estrella Polar (North Star) del producto antes de emitir código. Si una *feature* no empuja al menos uno de los "5 Outcomes", QUEDA FUERA DEL SCOPE.

---

## 1. EL PROBLEMA (The Actionability Gap)
Hoy los perfiles no técnicos sienten presión por “ponerse al día” con IA, automatización y bases de datos, pero consumen contenido de forma totalmente fragmentada.
Ven posts, hilos de X, newsletters y herramientas nuevas. Al final:
- Entienden poco.
- Aplican poco.
- Recuerdan poco.
- **Dolor Central:** *"No puedo traducir todo lo que veo en internet a habilidades reales para mi trabajo."*

El dolor no es falta de información, es **Baja transferencia al trabajo real + Ansiedad profesional**.

## 2. LA SOLUCIÓN: SIGNAL OS
Una plataforma (EdTech / Technical Learning OS) que transforma el ruido informativo disperso en una ruta de aprendizaje personalizada y accionable. Específicamente para *Marketers, Recruiters, Sales/Ops y PMs*.
Empezaremos el Beachhead con **Marketers**.

**Los 5 Outcomes (Cómo medimos el éxito):**
1. **Bajar Costos:** Proyectos pre-armados. Menos horas pagas a terceros.
2. **Bajar Tiempos:** De días de setup a minutos hasta empezar a ejecutar.
3. **Uso Específico:** Casos de uso claros por vertical (Marketer/HR).
4. **Make a Task Better:** Tareas tangibles hechas con mejor output/menos errores.
5. **Increase Efficiency:** Menos fricción entre pensar y ejecutar. Saber qué "Eliminar".

## 3. EL GRAN DIFERENCIADOR: "SKILL STOCKS" (Saber qué eliminar)
El Copiloto no es un agregador pasivo de lectura. Evalúa los *Skills* del usuario como si fuera una cartera financiera:
- 📈 **Rising:** Skill en alza (alta relevancia táctica). Invertir tiempo ahora.
- ➖ **Stable:** Base sólida. Mantener con repasos.
- 📉 **Degrading:** En declive. Sigue funcionando pero el ROI bajó (Ej: hacer RAG manual básico). Dejar de sumar contenido nuevo.
- ❌ **Gone:** Obsoleto. Otra vía lo resolvió. Archivar.

## 4. ARQUITECTURA DE SUB-AGENTES (El Motor)
La aplicación coordina esta estructura teórica (Los AI Services deben abstraer estas funciones):
1. **Scout:** Ingesta links y repositorios. Reúne los datos.
2. **Dedupe:** Agrupa por temas con embeddings y borra ruido.
3. **Relevance:** Prioriza según el rol (Marketer) y el nivel.
4. **Tutor:** Explica el porqué importa la pieza para su trabajo.
5. **Practice:** Mini retos / proyectos aplicables.
6. **Memory:** Refuerzo de skills. Limpia el feed de temas *Degrading/Gone*.

## 5. FLUJO END-TO-END (Scope para Claude Code)
1. **Onboarding:** El usuario declara que es *Marketer* y su stack. Diagnóstico inicial.
2. **Ingesta:** Scout trae información nueva de IA para Marketers.
3. **Dashboard:** Se muestra el portafolio (Skill Stocks), ruta sugerida y un botón mágico de "Proyecto Pre-Armado".
4. **Acción:** Dashboard del Inbox y la práctica conectada al flujo.

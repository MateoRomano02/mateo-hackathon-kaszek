# 📋 Tutoría de Ejecución — Guía Hora por Hora

> Este archivo es tu coach durante el hackathon.
> Leelo cuando estés perdido o cuando termines un bloque.

---

## ANTES DE LLEGAR (esta noche)

### ✅ Checklist de preparación
- [ ] Idea elegida y escrita en `context/IDEA.md`
- [ ] CLAUDE.md actualizado con descripción del proyecto
- [ ] Repo en GitHub público (instrucciones en SETUP_GITHUB.md)
- [ ] Python venv funcionando
- [ ] Claude Code instalado: `npm install -g @anthropic-ai/claude-code`
- [ ] claude-mem instalado: `npm install -g claude-mem`
- [ ] Loom o QuickTime listo para grabar

---

## AL LLEGAR (9:00–10:20)

### Prioridad 1: Confirmar API access
```bash
# Al llegar, pedir/confirmar API key y Console ID
# Editá el .env:
VITE_ANTHROPIC_API_KEY=sk-ant-TU-KEY-AQUI

# Verificar que el framework de React arranca:
npm run dev
# Y abrir el localhost en el navegador.
```

### Prioridad 2: Escuchar el demo de Brad Abrams
- Tomar nota de cualquier pattern nuevo que muestre
- Puede haber features de la API que no conozcas

### Prioridad 3: Networking express
- Si hay alguien que te puede complementar, formate equipo
- Si preferís solo, está perfecto — este scaffold es para 1 persona

---

## BLOQUE 1: 10:30–12:00 — Core feature (90 min)

### Objetivo: el happy path funciona, aunque sea feo

### Minuto 0-15: Arrancar con Claude Code
```bash
cd tu-proyecto
claude
# Dentro de Claude Code:
/plan
# Revisá el plan, confirmá, luego:
"Implementa [descripción del core feature] en src/"
```

### Minuto 15-75: Build the core
- Claude Code va a escribir la mayoría del código
- Tu rol: revisar, corregir direction, aprobar
- No perfectices — que funcione es suficiente

### Minuto 75-90: Primer smoke test
```bash
# Revisá que la llamada a la IA fluya hacia el estado en Zustand y 
# se muestre algo en la interfaz de React. No busques perfección de diseño todavía.
```

### 🚦 Checkpoint 12:00
¿Podés hacer una llamada a Claude que devuelva algo útil para tu caso de uso?
- SÍ → avanzás a la UI
- NO → simplificá el problema, reducí scope

---

## BLOQUE 2: 12:00–13:00 — UI + integración (60 min)

### Objetivo: demo visual funcionando

### Minuto 0-30: Conectar Pantallas y Zustand
```bash
# Pedile a Claude Code:
"Genera los componentes UI con Tailwind y conéctalos a la llamada del SDK en Zustand
con un input de [tipo] y muestra [tipo de output]"

npm run dev  # verificar en http://localhost:5173/
```

### Minuto 30-60: Flujo completo de punta a punta
- Input del usuario → Claude → output visible
- Agregar datos de ejemplo (evita inputs vacíos en el demo)

### 🚦 Checkpoint 13:00
¿Podés hacer el flujo completo desde la UI?
- SÍ → vas al almuerzo tranquilo
- NO → simplificá la UI, hacelo con solo un input y un output

---

## ALMUERZO: 13:00–13:45

### OBLIGATORIO: Comer y desconectar 15 minutos
El cerebro necesita el break. No saltés el almuerzo.

### OPCIONAL PERO VALIOSO: Office hours con Anthropic/Kaszek
- Mostrá lo que tenés, aunque sea incompleto
- Preguntá: "¿Esto tiene sentido como producto? ¿Qué les parece el approach?"
- Los mentores de Anthropic pueden darte tips técnicos de Claude
- Jo Zhu (Anthropic) es especialmente útil para el track Open

---

## BLOQUE 3: 13:45–15:30 — Pulir y diferenciar (105 min)

### Objetivo: pasar de "funciona" a "impresiona"

### Prioridades ordenadas:
1. **Tool use visible** — si no lo tenés, agregarlo ahora
   ```python
   # Claude debe mostrar que está usando herramientas
   # Los jueces valoran esto explícitamente
   ```

2. **Datos de ejemplo reales** — no "lorem ipsum"
   - Buscar datos reales de tu dominio
   - Armar 3-5 casos de ejemplo convincentes

3. **Manejo de errores** — spinners y tostadas (toasts)
   ```typescript
   try {
       const result = await anthropic.messages.create({...});
   } catch (e) {
       // Mostrar error amigable en un Toast de Shadcn
   }
   ```

4. **UI más clara** — título, subtítulo, instrucciones en 2 líneas

5. **Features adicionales** — solo si ya está todo lo anterior

### ⏰ A las 15:30: FREEZE de features
Cuando anuncien "quedan 90 minutos", parar de agregar cosas.

---

## BLOQUE 4: 15:30–17:00 — Demo y entrega (90 min)

### 15:30–16:30: Grabar el video de 2 minutos

**Script exacto:**
```
[0:00–0:30] PROBLEMA
"[Nombre del usuario] hoy tiene que [tarea dolorosa].
Eso le toma [tiempo/esfuerzo]. Yo trabajé en esto porque [razón personal o insight]."

[0:30–1:00] DEMO EN VIVO
Mostrar el happy path funcionando.
Narrar mientras lo hacés: "Acá ingreso [X], Claude analiza [Y]..."

[1:00–1:30] POR QUÉ CLAUDE
"Lo que hace único a esto es [tool use / razonamiento / algo específico de Claude].
Acá podés ver cómo Claude [decide/analiza/extrae]..."

[1:30–2:00] IMPACTO Y PRÓXIMOS PASOS
"Esto le ahorraría [tiempo/dinero] a [usuario].
Los próximos pasos serían [2 cosas concretas]."
```

### 16:30–17:00: Entrega
```bash
# En tu terminal:
claude /ship

# Luego manualmente:
git push origin main

# Subir video a YouTube unlisted o Google Drive
# Completar formulario de entrega con:
# - Link al repo
# - Descripción del proyecto (3-4 líneas)
# - Link al video
```

---

## SI LLEGÁS AL TOP 5 (17:45–18:15)

### Tienes 3 minutos exactos. Timer estricto.

**Estructura:**
- 0:00–0:20 → Hook + problema en 1 frase
- 0:20–1:30 → Demo en vivo (lo más importante)
- 1:30–2:20 → Por qué Claude es clave
- 2:20–2:40 → Impacto potencial
- 2:40–3:00 → Cierre + agradecer a mentores que te ayudaron

**Tip:** Practicalo al menos 2 veces antes de subir.

---

## MANEJO DE CRISIS

### "El demo no funciona 30 min antes de la entrega"
1. Revertí al último commit que funcionaba
2. Simplificá el flujo — mostrá menos pero funcional
3. Si nada funciona: grabá una walkthrough del código explicando qué hace

### "Me quedé sin ideas a las 11am"
1. Abrí `context/IDEA.md` — leé el pain point
2. Reducí el scope al mínimo absoluto: 1 input → 1 output útil
3. Hablá con un mentor — ellos pueden ayudar a destrabar

### "Claude Code está roto / la API no responde"
```bash
# Verificar npm:
npm run dev
# Revisar consola del browser por errores de CORS/Network
# Si falla: reiniciar Claude Code
# Si persiste: ir a console.anthropic.com para verificar créditos
```

### "No tengo tiempo para el video"
- Grabá un screencast de 2 minutos mientras demostrás en vivo
- No necesita edición — solo que se vea el flujo funcionando
- Subí a YouTube unlisted o Google Drive

---

## Principios para el día

1. **Done > perfect** — funcional beats arquitectura perfecta
2. **Demo driven development** — si no lo podés mostrar, no lo construyas
3. **Problema > tecnología** — el pitch empieza con el usuario, no con Claude
4. **Pedí ayuda** — los mentores están para eso, no tengas vergüenza
5. **Hidratarte y comer** — malas decisiones técnicas vienen del hambre

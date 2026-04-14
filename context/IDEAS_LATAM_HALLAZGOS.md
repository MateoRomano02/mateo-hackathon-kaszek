# 🧠 Ideas LATAM: El "Kaszek/YC" Reality Check
*Generado mediante el cruce de Deep Research, Jobs-To-Be-Done (JTBD), y las métricas de Sam Altman / Y Combinator.*

Este documento contiene 5 problemáticas purgas de "bullshit". Aquí no hay "chatbots genéricos" ni "generadores de copy". Son fricciones en procesos burocráticos, logísticos y financieros de Argentina y LATAM donde el uso de Claude asume el rol de "procesador cognitivo de datos basura".

---

## 🔥 1. TRACK: ECOMMERCE / LOGÍSTICA
**El "Ruteador" de Venta por Instagram (Logística de Última Milla Informal)**

En Argentina, cientos de miles de emprendedores venden por Instagram. La logística no es Andreani; es un "motoquero" local. Los clientes envían sus direcciones por audios o textos caóticos por WhatsApp: *"Dejalo en la esquinita roja al lado del kiosco Pablito, el timbre está roto, gritá"*. El vendedor tiene que armar una hoja de ruta manual para el motoquero, perdiendo horas y cometiendo errores de ruteo.

*   **JTBD (Funcional):** Transformar 30 mensajes de WhatsApp incomprensibles en una ruta de entrega estructurada para el conductor.
*   **JTBD (Emocional):** Evitar la ansiedad y los gritos del conductor cuando no encuentra la dirección a las 7 PM.
*   **Filtro Sam Altman (Why Claude?):** Los mapas de Google o ruteadores clásicos como Routific **colapsan** con direcciones argentinas informales ("Barrio 31, Pasillo 4", o "Ruta 2 km 45"). Claude usa razonamiento semántico para extraer la dirección real, el "driver note" y estructurarlo en un JSON geolocalizable.
*   **El MVP (6.5 hrs):** Un Textarea inmenso. El usuario pega el chorizo de texto de 20 clientes de WhatsApp. Claude ejecuta una `Tool` devolviendo un JSON limpio con: `[Nombre, Dirección Estandarizada, Instrucciones de Entrega]`. La pantalla renderiza tarjetas estilo Kanban para el motoquero.

---

## 🏛️ 2. TRACK: FINTECH / LEGALTECH
**Escáner de Contratos Inmobiliarios (Sobreviviendo la Ley de Alquileres)**

Las leyes de alquileres cambiaron 3 veces en 4 años. Hoy en Argentina los contratos se firman en dólares, en pesos ajustados por ICL, IPC o CAC, con actualizaciones cada 3 o 4 meses. El inquilino promedio firma contratos abusivos porque no puede calcular el interés compuesto de estas fórmulas, y los propietarios a veces usan contratos plantilla viejos ilegales.

*   **JTBD (Funcional):** Saber exactamente cuánto voy a pagar en el mes 14 antes de firmar.
*   **JTBD (Emocional):** Mitigar el pánico de ser estafado y quedar en la calle por no entender a un abogado.
*   **Filtro Sam Altman (Why Claude?):** Extraer fórmulas matemáticas complejas escondidas en el lenguaje legal ("Cláusula 4ta: Ajuste cuatrimestral índice BCRA...") requiere un cruce perfecto de lectura legal + ejecución matemática.
*   **El MVP (6.5 hrs):** El usuario arrastra el borrador del contrato en PDF. Claude ubica las cláusulas de pago, usa un esquema de Zod para devolver el capital, el índice y los hitos. La UI de React renderiza un **Gráfico de Barras (Shadcn Charts)** proyectando el costo del alquiler a 2 años, y alertas rojas si encuentra multas usureras.

---

## 🚜 3. TRACK: AGTECH / FINTECH B2B
**Conciliador Forense de "Liquidación de Granos"**

Un productor agropecuario (soja/trigo) entrega su cosecha a un acopio. Meses después le llega el "Certificado de Liquidación de Granos" primario. Es un PDF inentendible lleno de retenciones: mermas por humedad, fletes, paritarias de camioneros, retenciones de AFIP, sellos provinciales. Muchas veces el productor pierde entre 3% y 7% de rentabilidad por "cargos fantasma" del acopio, pero no lo nota porque no cruza los datos.

*   **JTBD (Funcional):** Saber mi verdadero margen neto por cada camión que salió del campo.
*   **JTBD (Emocional):** Frenar el sentimiento de "las cerealeras y el estado me están robando en la letra chica".
*   **Filtro Sam Altman (Why Claude?):** Un mercado gigantesco (el motor del PBI en Argentina). Los PDFs de liquidación agropecuaria son infames por ser asimétricos y difíciles de parsear. Claude puede leer el PDF, "razonar" la deducción, y convertirlo en data estructurada.
*   **El MVP (6.5 hrs):** Subida de documento simulado. Claude parsea las retenciones contra un `MarketAverage.json` (hardcodeado). En la UI, te pinta un dashboard: "Te cobraron 2% de más en Merma por Humedad respecto al mercado. Disputa recomendada".

---

## 📚 4. TRACK: EDUCACIÓN
**Traductor de "Diseños Curriculares" a Rúbricas Diarias (K-12)**

Los maestros en LATAM sufren burnout por la burocracia, no por dar clases. Sus clases ("Vamos a estudiar las batallas de San Martín") deben estar enmarcadas burocráticamente en el "Diseño Curricular Provincial" del Ministerio de Educación (documentos de 800 páginas con jerga pedagógica). Cada día deben presentar planillas con "Ejes, Saberes Conceptuales, Procedimentales y Criterios de Evaluación".

*   **JTBD (Funcional):** Aprobar la inspección de la directora de la escuela entregando las planillas a tiempo.
*   **JTBD (Emocional):** Recuperar mis sábados y domingos en lugar de pasarlos escribiendo burócrata-speak en Word.
*   **Filtro Sam Altman (Why Claude?):** Product-Market Fit instantáneo. Alta retención (los maestros lo usarían semanalmente). Usa fuertemente el "Tone of Voice" institucional que los LLM manejan a la perfección.
*   **El MVP (6.5 hrs):** El maestro escribe en un input simple: *"Daré una clase de fracciones cortando pizzas de cartón a chicos de 4to grado"*. Claude consulta (simulado) el índice curricular del gobierno, mapea los "NAP" (Núcleos de Aprendizajes Prioritarios) y usa Zod para devolver una cuadricula técnica perfecta, lista para imprimir en PDF.

---

## 📦 5. TRACK: ECOMMERCE / OPEN
**Catálogo "Traba Aduanera" (AFIP / Importadores)**

Los importadores traen contenedores de China (ej. mil tipos distintos de tornillos, fundas, luces LED). Para ingresar legalmente la mercadería, la Aduana Argentina exige que cada ítem esté mapeado contra la Nomenclatura Común del Mercosur (NCM), un árbol de códigos ridículamente complejo (ej. "8471.30.12 - Máquinas automáticas de procesamiento de datos..."). Si el despachante se equivoca, el contenedor queda retenido.

*   **JTBD (Funcional):** Convertir el Excel mal traducido enviado por el fabricante chino al código arancelario legal del Mercosur.
*   **JTBD (Emocional):** Evitar que mi mercadería de $50,000 USD quede confiscada en el puerto de Buenos Aires pagando depósito diario.
*   **Filtro Sam Altman (Why Claude?):** Un dolor B2B masivo. El matching semántico entre "Phone Case Pink" y el lenguaje aduanero "Fundas protectoras de policarbonato con aditivos..." es algo donde Claude destroza a algoritmos tradicionales.
*   **El MVP (6.5 hrs):** Pastear un CSV desestructurado y en Spanglish ("auriculares blutut"). Claude usa Reasoning para deducir el tipo de producto comercial, y devuelve el código NCM con un puntaje de "Confidence" (usando Zod array).

---

### 👑 TOP RECOMMENDATION DEL PM
Para este hackathon, te recomiendo la **IDEA 2 (Escáner de Contratos de Alquiler / Fintech-Legal)** o la **IDEA 1 (Ruteador de la Última Milla Informal)**.
Ambas demuestran perfectamente el uso de Tool Calling restringido (Zod + Claude JSON generation), permiten brillar a la UI (con Shadcn y Tailwind), son fáciles de mockear sin bases de datos, y resuelven un problema hiper-local latino que cualquier jurado entenderá en 10 segundos.

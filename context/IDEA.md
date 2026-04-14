# 🧠 INYECCIÓN DE CONTEXTO: OMNIPARSER B2B (Middleware Agnóstico)

> **Regla de Operación:** Todo Agente (Claude) que trabaje en este Hackathon debe leer este documento para entender la Estrella Polar (North Star) del producto antes de emitir código.

---

## 🚀 La Visión de Negocio (El Filtro Y Combinator)
No estamos construyendo un simple "lector de PDFs para MercadoLibre".
Estamos construyendo un **OmniParser B2B Agnóstico**. El eslabón perdido en la cadena de suministro del E-commerce en Latinoamérica.

**La Asimetría del Mercado:**
*   Plataformas como Shopify, TiendaNube y MercadoLibre tienen APIs REST/GraphQL perfectas, prístinas y estructuradas.
*   Sin embargo, los **Proveedores (Fabricantes, Corralones, Importadores Chinos)** siguen operando en el siglo XX: envían listas de precios en Excels rotos, catálogos en PDFs no seleccionables, o actualizaciones de stock por fotos en WhatsApp.

Esa fricción (pasar de la basura analógica a la API perfecta) frena el crecimiento del e-commerce. **OmniParser es la capa traductora.**

## 💡 Qué hace OmniParser B2B
OmniParser usa **Claude 3.5 Sonnet** para ingerir "Data Basura" del proveedor y expulsar **Primitivas de E-commerce Universales** (SKU, Precio, Título, Descripción SEO, Stock, Peso).

Al ser **100% agnóstico**, el JSON resultante sirve como un *Payload Universal*. La dueña de la PYME solo tiene que hacer clic en un botón para decidir a dónde inyectarlo:
*   [x] Actualizar precios de inflacion en TiendaNube.
*   [x] Sincronizar stock con MercadoLibre.
*   [x] Crear nuevas descripciones SEO Optimized para Shopify.

## 🛠️ Especificaciones del MVP para el Hackathon (6.5h)

### 1. El Input (La Basura): Drag & Drop
Un Draz&Drop en la UI (Shadcn) donde el usuario suelta el PDF/Imagen del proveedor.
*User Input adicional:* "Súmale un 45% de markup a mis costos para el precio final, y mejora los nombres técnicos para que suenen más comerciales."

### 2. El Cerebro (La Extracción AI): Tool Use
Claude procesa el documento usando `tool_choice` estricto con un esquema Zod Agnóstico:
```typescript
interface UniversalProductSchema {
  provider_sku: string;
  name: string;
  seo_description: string;
  cost: number;
  final_sale_price: number; // Modificado por el markup
  category: string;
}
```

### 3. El Output (El Destino): Simuladores de APIs
En la interfaz, una tabla hermosa muestra los resultados. A la derecha, botones de los Sponsors del Hackathon: `[Sincronizar Meli]`, `[Sincronizar TiendaNube]`.
Al hacer clic, simularemos promesas de 2 segundos (Mock) en React y daremos alertas de éxito (`toast`).

## 📈 Tracción y Monetización (Pitch para Kaszek)
*   **TAM (Total Addressable Market):** Millones de PYMEs en LATAM.
*   **Willingness to Pay:** Alto. El tiempo humano cuesta dinero. Si OmniParser ahorra 20 horas mensuales de *data entry*, el SaaS se paga solo por $39 USD/mes.
*   **Foso Defensivo (Moat):** La fine-tuning de los prompts sobre cómo leen los proveedores en Argentina/Brasil. A medida que más facturas pasan por nuestro sistema, más agnóstico e infalible se vuelve el parser. Nos apalancamos sobre las APIs de todos sin competir contra ninguno. Somos **puramente infraestructura.**

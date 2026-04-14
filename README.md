# 🚀 Lector Mágico de Precios (Kaszek x Anthropic Hackathon)

Un middleware de actualización dinámica de inventario B2B diseñado para economías inflacionarias. Impulsado por **Claude 3.5 Sonnet** y **React 19**.

## 📌 El Problema (Mercado LATAM)
En mercados de alta inflación (ej. Argentina), las PYMES de comercio electrónico y revendedores en MercadoLibre/TiendaNube reciben nuevas listas de precios de sus fabricantes semanalmente. Estos datos suelen llegar en **formatos no estructurados** (PDFs escaneados, imágenes, Excels rotos).
Atualizar manualmente 300+ SKUs en MercadoLibre cuesta horas de trabajo humano, retrasa las ventas y produce graves errores de márgenes de rentabilidad.

## 💡 Nuestra Solución (Cambio de Paradigma)
No exigimos que el proveedor limpie sus datos. Nuestra aplicación actúa como un **Auditor Cognitivo**:
1. El vendedor sube el PDF/Imagen del catálogo del proveedor.
2. Ingresa su regla comercial (ej. *"Aplicar Markup del 40%"*).
3. **Claude 3.5 Sonnet** (via Tool Use & Zod) extrae las entidades subyacentes, hace matching semántico con los SKUs de la tienda y expulsa un JSON estrictamente estructurado.
4. El frontend inyecta masivamente las actualizaciones vía API a MercadoLibre / TiendaNube.

## 🛠️ Stack Tecnológico (Zero-Technical Debt)
- **Frontend Core:** React 19 + TypeScript + Vite.
- **Estilos:** Tailwind CSS v4 + Shadcn UI (Componentes Radix).
- **Gestión de Estado:** Zustand.
- **Validación & Tool Use:** Zod.
- **Inteligencia Artificial:** Anthropic SDK (Uso intensivo de JSON Generation, Prompt Caching para escalabilidad).

## ⚡ Guía de Inicio Rápido (Local Dev)

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar Entorno:**
   Crear un archivo `.env` basado en `.env.example`:
   ```bash
   VITE_ANTHROPIC_API_KEY=tu_clave_aqui
   ```

3. **Ejecutar Entorno de Desarrollo:**
   ```bash
   npm run dev
   ```

---
*Desarrollado para el Kaszek x Anthropic Hackathon 2024.*

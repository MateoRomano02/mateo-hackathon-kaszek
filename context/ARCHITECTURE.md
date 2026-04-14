# 🏗️ ARQUITECTURA DEL REPOSITORIO (SignalOS)

> **REGLAS DE REFACTORIZACIÓN ESTRICTAS PARA CLAUDE:**  
> Eres un **Staff Product Engineer / Frontend Architect**. No toleramos código espagueti. Toda la aplicación debe funcionar bajo una arquitectura "Feature-Sliced Design / Feature-based".

---

## 1. ESTRUCTURA DE DIRECTORIOS MANDATORIA
Cada vez que crees componentes o código, debes ubicarlos exactamente en este esquema. Prohibido usar `src/components` genérico.

```text
src/
  app/            (Bootstrap: router, providers, layouts globales)
  pages/          (Composición de vistas: Onboarding, Dashboard, Inbox, Analysis, Actions, Memory)
  features/       (Casos de uso: onboarding, content-intake, analysis, action-plan, dashboard...)
  entities/       (Tipos de dominio duro: UserProfile, VerticalType, ContentItem)
  services/       (Mocks, integraciones IA, almacenamiento en local)
  shared/         (Botones base, hooks puros reutilizables, utils, tipos comunes)
  config/         (Configuraciones por vertical: verticals/marketer.ts, etc.)
```

## 2. REQUISITOS TÉCNICOS & CÓDIGO
- **Stack:** React 19 + TypeScript + Vite. Sin overengineering.
- **Restricción 1:** No dejes lógica de agentes AI hardcodeada en los componentes. 
- **Restricción 2:** Interfaz mínima de archivos de `~150-200 líneas`. Funciones chicas y claras.
- **Restricción 3:** Evitar "magic strings" dispersos, usa Enums/Constants en `shared/`.

### El Archivo Raíz (App.tsx)
Debe quedar absurdamente liviano, importando solo Providers y Enrutadores desde `app/`. No meter UI, mocks o agentes acá.

## 3. ABSTRACCIÓN DE INTELIGENCIA ARTIFICIAL
Prohibidas las llamadas directas desde la vista UI a Anthropic.
Debes crear contratos de interfaz en `services/`:
1. `AIAnalysisService` (Interfaz/Tipos).
2. `MockAnalysisService` (Por defecto para la demo local, escupiendo los JSONs falsos para la UI).
3. `AnthropicAnalysisServiceAdapter` (El adapter listo para conectar a la API en el futuro).
Cualquier *Page* o *Feature* debe consumir la interfaz general.

## 4. ESTADO DE LA UI
Usa el hook base de Zustand o simple Context+Hooks.
Para operaciones que requieran cargar al montar, usa este patrón exigido por el arquitecto:
```tsx
import { useEffect } from "react";
export const useOnInit = (initialCallBack: () => void) => {
  useEffect(() => {
    initialCallBack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
export const useAlIniciar = useOnInit;
```

## 5. MANEJO DE ERRORES CENTRALIZADO
Cualquier intento de `try/catch` de red debe formatearse con esta función alojada en `shared/utils/errors.ts`:
```tsx
import { AxiosError } from 'axios'
export type ErrorPersonalizado = { estado?: number, mensaje: string }

export const obtenerMensajeError = (error: unknown): ErrorPersonalizado => {
  let mensaje = 'Ocurrió un error. Consulte al administrador del sistema'
  let estado = 0

  if (error instanceof AxiosError) {
    estado = error.response?.status ?? error.status ?? 0
    const data = error.response?.data as { message?: string; error?: string } | undefined
    const mensajeBackend = data?.message || data?.error

    if (estado >= 400 && estado < 500) {
      mensaje = mensajeBackend ?? 'No se pudo completar la operación.'
    } else {
      mensaje = 'Ocurrió un error al conectarse al backend. Intente nuevamente más tarde'
    }
    if (estado === 400 && !mensajeBackend) {
      mensaje = 'Solicitud inválida'
    }
  } else if (error instanceof Error) {
    mensaje = error.message
  }

  return { estado, mensaje }
}
```

## 6. MOCKS, CONFIGS & DOMINIO
- Mocks: Guárdalos en `services/mock` y consumelos en los hooks.
- Config de Verticales: Prepara `config/verticals/marketer.ts`. El MVP girará enteramente en `Marketer` para las preguntas de Onboarding, pero el Type `VerticalType` debe soportar *recruiter, developer, ops*.
- Estética: **SignalOS, Dark Premium, Responsive**. Usa componentes centralizados en `shared/ui`. Todo oscuro y minimalista.

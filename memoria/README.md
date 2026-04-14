# memoria/ — Directorio de memoria del proyecto

Este directorio es usado por claude-mem para persistir contexto entre sesiones de Claude Code.
No editar manualmente — claude-mem lo gestiona automáticamente.

## Qué persiste acá
- Decisiones de arquitectura tomadas
- Bugs encontrados y resueltos
- Patterns que funcionaron
- Lo que NO funcionó (para no repetir)
- Estado actual del proyecto

## Cómo funciona
claude-mem captura todo lo que Claude Code hace en cada sesión,
lo comprime con IA, y lo inyecta al inicio de la próxima sesión.
Resultado: Claude Code "recuerda" el contexto aunque cierres y abras la terminal.

## Instalación
```bash
npm install -g claude-mem
claude-mem install   # instala el hook en Claude Code
```

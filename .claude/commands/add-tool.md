# /add-tool [nombre] — Agregar una nueva tool a Claude
1. Definir el schema de la tool en src/tools/tool_definitions.py
2. Implementar la función handler en src/tools/[nombre]_handler.py
3. Registrar el handler en el agente correspondiente
4. Agregar un test rápido
5. Actualizar context/ARCHITECTURE.md con la nueva tool
Respetar el formato: tool_definitions.py tiene el schema JSON, el handler tiene la lógica real.

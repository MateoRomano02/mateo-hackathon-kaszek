# Skill: Claude Tool Use Best Practices
Cuando implementes tool use:
- Los tools deben tener nombres descriptivos en inglés (snake_case)
- La "description" del tool es lo más importante — Claude la usa para decidir cuándo llamarlo
- El input_schema debe ser preciso — usar "required" correctamente
- Los handlers deben devolver strings descriptivos, no solo datos crudos
- Si el tool puede fallar, devolver un mensaje de error claro (Claude lo entiende)
- Mostrar en la UI qué tools está usando Claude (transparencia para el demo)
- Máximo 5-6 tools por agente — más que eso confunde a Claude
Ejemplo de descripción buena vs mala:
  MALA: "search function"
  BUENA: "Search for products in the MercadoLibre catalog by keyword. Returns title, price, and seller info."

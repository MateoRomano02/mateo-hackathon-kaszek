# 🚀 Setup GitHub — Instrucciones paso a paso

## Opción A: Tenés GitHub CLI instalado (más fácil)

```bash
# 1. Verificar que tenés gh instalado
gh --version

# 2. Si no lo tenés, instalar:
# Mac: brew install gh
# Windows: winget install GitHub.cli

# 3. Login (si no estás logueado)
gh auth login
# Elegí: GitHub.com → HTTPS → Login with browser

# 4. Entrar a tu carpeta del proyecto
cd ~/Desktop/hackathon-scaffold    # o donde lo hayas descomprimido

# 5. Inicializar git y crear repo en GitHub
git init
git add -A
git commit -m "init: kaszek anthropic hackathon scaffold"
gh repo create hackathon-kaszek --public --push --source=.

# 6. ✅ Listo. Tu repo está en:
# https://github.com/TU-USERNAME/hackathon-kaszek
```

---

## Opción B: Sin GitHub CLI (manual)

```bash
# PASO 1: Crear el repo en GitHub
# Ir a: https://github.com/new
# - Repository name: hackathon-kaszek
# - Description: Built at Kaszek x Anthropic Hackathon 2026
# - Visibility: PUBLIC (importante para los jueces)
# - NO inicializar con README (nosotros ya tenemos)
# - Click: Create repository

# PASO 2: En tu terminal, entrar a la carpeta
cd ~/Desktop/hackathon-scaffold    # ajustar al path donde descomprimiste el zip

# PASO 3: Inicializar git
git init
git add -A
git commit -m "init: kaszek anthropic hackathon scaffold"

# PASO 4: Conectar con GitHub y pushear
# GitHub te va a mostrar estos comandos — copiarlos de ahí:
git remote add origin https://github.com/TU-USERNAME/hackathon-kaszek.git
git branch -M main
git push -u origin main

# PASO 5: Verificar
# Ir a https://github.com/TU-USERNAME/hackathon-kaszek
# Debe verse el repositorio con todos los archivos
```

---

## Verificación final del repo

Después de pushear, verificar que se ven estos archivos en GitHub:
- [ ] CLAUDE.md
- [ ] README.md
- [ ] requirements.txt
- [ ] ui.py
- [ ] api_server.py
- [ ] src/ (carpeta con subcarpetas)
- [ ] context/ (con IDEA.md, etc.)
- [ ] docs/
- [ ] .claude/ (puede que GitHub no muestre las carpetas con punto — está bien)
- [ ] .env.example (SÍ debe estar)
- [ ] .env (NO debe estar — está en .gitignore)

---

## Workflow para mañana

```bash
# Al llegar al hackathon:
cd hackathon-kaszek

# 1. Poner la API key
echo "ANTHROPIC_API_KEY=sk-ant-TU-KEY-AQUI" >> .env

# 2. Verificar
python -c "from src.api.claude_client import chat; print(chat('Say OK'))"

# 3. Instalar Claude Code si no está
npm install -g @anthropic-ai/claude-code

# 4. Instalar claude-mem
npm install -g claude-mem

# 5. Arrancar Claude Code
claude

# 6. Primer comando del día
/plan
```

---

## Durante el día — comandos de git

```bash
# Commitear progreso cada hora aproximadamente
git add -A && git commit -m "feat: [qué implementaste]"

# Entrega final a las 17:00
claude /ship
git push origin main
```

---

## Para los jueces

El repo debe tener en el README:
1. Descripción clara (qué hace, para quién)
2. Instrucciones de instalación (3 comandos máximo)
3. Link al video demo
4. Track del hackathon

El link que vas a entregar:
`https://github.com/TU-USERNAME/hackathon-kaszek`

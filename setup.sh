#!/bin/bash
# setup.sh — Instalar todo en un comando
# Ejecutar: bash setup.sh

echo "🚀 Kaszek x Anthropic Hackathon — Setup"
echo "========================================"

# Python virtual environment
echo ""
echo "📦 Creando entorno Python..."
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt -q
echo "✅ Python OK"

# .env
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ .env creado desde .env.example"
  echo "⚠️  ACORDATE de poner tu ANTHROPIC_API_KEY en .env"
else
  echo "✅ .env ya existe"
fi

# Node / Claude Code
echo ""
echo "📦 Verificando Claude Code..."
if command -v claude &> /dev/null; then
  echo "✅ Claude Code ya instalado: $(claude --version 2>/dev/null || echo 'version OK')"
else
  echo "Instalando Claude Code..."
  npm install -g @anthropic-ai/claude-code
  echo "✅ Claude Code instalado"
fi

# claude-mem
echo ""
echo "📦 Verificando claude-mem..."
if npm list -g claude-mem &> /dev/null 2>&1; then
  echo "✅ claude-mem ya instalado"
else
  echo "Instalando claude-mem..."
  npm install -g claude-mem
  echo "✅ claude-mem instalado"
fi

# Test básico de imports
echo ""
echo "🧪 Verificando imports Python..."
python -c "
from src.api.claude_client import chat, chat_with_tools, structured_output
from src.agents.base_agent import Agent
from src.tools.tool_definitions import SEARCH_TOOL
from prompts.system_prompts import BASE_ASSISTANT
print('✅ Todos los imports OK')
"

echo ""
echo "========================================"
echo "✅ Setup completo!"
echo ""
echo "Próximos pasos:"
echo "  1. Poner ANTHROPIC_API_KEY en .env"
echo "  2. Completar context/IDEA.md con tu idea"
echo "  3. Actualizar CLAUDE.md con la descripción"
echo "  4. Correr: claude"
echo "  5. Dentro de Claude Code: /plan"
echo ""
echo "Para arrancar la UI: streamlit run ui.py"
echo "Para arrancar la API: uvicorn api_server:app --reload"

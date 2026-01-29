#!/bin/bash

###############################################################################
# Script zur Einrichtung der Umgebungsvariablen
# Hilft bei TODO #2: API-Keys sichern
###############################################################################

set -e

echo "🔐 Environment Setup Script"
echo "================================"

PROJECT_DIR="/home/clawdbot/projects/EduFunds-Grundschule"
cd "$PROJECT_DIR"

# Prüfe ob .env existiert
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted. Your existing .env file is safe."
        exit 0
    fi
    # Backup erstellen
    cp .env ".env.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backup created"
fi

# Kopiere .env.example zu .env
cp .env.example .env
echo "✅ Created .env from template"

# Setze sichere Berechtigungen
chmod 600 .env
echo "✅ Set secure permissions (600) on .env"

# Generiere Session Secret
SESSION_SECRET=$(openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Update SESSION_SECRET in .env
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" .env
else
    # Linux
    sed -i "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" .env
fi
echo "✅ Generated secure SESSION_SECRET"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  IMPORTANT: You need to add your API keys manually!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Edit .env and replace the following placeholders:"
echo "  • OPENAI_API_KEY=sk-your-key-here"
echo "  • DB_PASSWORD=your-secure-password-here"
echo ""
echo "Run: nano .env"
echo ""
echo "✅ Setup complete! Don't forget to:"
echo "   1. Add your API keys to .env"
echo "   2. Never commit .env to git"
echo "   3. Run 'npm install' to install dependencies"

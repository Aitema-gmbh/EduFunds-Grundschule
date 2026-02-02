#!/bin/bash

###############################################################################
# Script zur Behebung von Berechtigungsproblemen
# Löst TODO #1: Berechtigungsprobleme in der Dateistruktur
###############################################################################

set -e  # Bei Fehler abbrechen

echo "🔧 Fixing file and directory permissions..."

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Projektverzeichnis
PROJECT_DIR="/home/clawdbot/projects/EduFunds-Grundschule"

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

echo -e "${YELLOW}📂 Working directory: $(pwd)${NC}"

# 1. Setze Besitzer (falls nötig und berechtigt)
echo -e "\n${YELLOW}1️⃣  Checking ownership...${NC}"
CURRENT_USER=$(whoami)
echo "Current user: $CURRENT_USER"

# Nur wenn wir sudo-Rechte haben
if [ "$EUID" -eq 0 ] || sudo -n true 2>/dev/null; then
    echo "Setting owner to $CURRENT_USER..."
    sudo chown -R "$CURRENT_USER:$CURRENT_USER" .
    echo -e "${GREEN}✅ Ownership updated${NC}"
else
    echo -e "${YELLOW}⚠️  No sudo privileges - skipping ownership change${NC}"
fi

# 2. Setze Verzeichnis-Berechtigungen (755)
echo -e "\n${YELLOW}2️⃣  Setting directory permissions (755)...${NC}"
find . -type d -exec chmod 755 {} \;
echo -e "${GREEN}✅ Directory permissions set to 755${NC}"

# 3. Setze Datei-Berechtigungen (644)
echo -e "\n${YELLOW}3️⃣  Setting file permissions (644)...${NC}"
find . -type f -exec chmod 644 {} \;
echo -e "${GREEN}✅ File permissions set to 644${NC}"

# 4. Setze ausführbare Berechtigungen für Scripts
echo -e "\n${YELLOW}4️⃣  Setting executable permissions for scripts...${NC}"
find . -type f -name "*.sh" -exec chmod 755 {} \;
find . -type f -path "*/bin/*" -exec chmod 755 {} \;
echo -e "${GREEN}✅ Script permissions set to 755${NC}"

# 5. Schütze sensible Dateien
echo -e "\n${YELLOW}5️⃣  Protecting sensitive files...${NC}"
if [ -f ".env" ]; then
    chmod 600 .env
    echo -e "${GREEN}✅ .env protected (600)${NC}"
fi

if [ -f "config/secrets.json" ]; then
    chmod 600 config/secrets.json
    echo -e "${GREEN}✅ secrets.json protected (600)${NC}"
fi

# 6. Setze Berechtigungen für node_modules
if [ -d "node_modules" ]; then
    echo -e "\n${YELLOW}6️⃣  Fixing node_modules permissions...${NC}"
    find node_modules -type d -exec chmod 755 {} \;
    find node_modules -type f -exec chmod 644 {} \;
    # Binaries in node_modules/.bin ausführbar machen
    if [ -d "node_modules/.bin" ]; then
        chmod 755 node_modules/.bin/*
    fi
    echo -e "${GREEN}✅ node_modules permissions fixed${NC}"
fi

# 7. Erstelle fehlende Verzeichnisse mit korrekten Rechten
echo -e "\n${YELLOW}7️⃣  Creating missing directories...${NC}"
mkdir -p logs tmp uploads public/uploads
chmod 755 logs tmp uploads public/uploads
echo -e "${GREEN}✅ Required directories created${NC}"

# 8. Überprüfung
echo -e "\n${YELLOW}8️⃣  Verification...${NC}"
echo "Checking critical files:"

check_file() {
    local file=$1
    local expected=$2
    if [ -e "$file" ]; then
        local perms=$(stat -c "%a" "$file" 2>/dev/null || stat -f "%Lp" "$file" 2>/dev/null)
        if [ "$perms" = "$expected" ]; then
            echo -e "  ${GREEN}✓${NC} $file ($perms)"
        else
            echo -e "  ${YELLOW}!${NC} $file ($perms, expected $expected)"
        fi
    fi
}

check_file ".env" "600"
check_file "package.json" "644"
check_file "scripts/fix-permissions.sh" "755"

# Zusammenfassung
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Permission fix completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "\nPermission summary:"
echo "  • Directories: 755 (rwxr-xr-x)"
echo "  • Files: 644 (rw-r--r--)"
echo "  • Scripts: 755 (rwxr-xr-x)"
echo "  • Secrets: 600 (rw-------)"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "  1. Copy .env.example to .env and add your API keys"
echo "  2. Run: npm install"
echo "  3. Run: npm test"

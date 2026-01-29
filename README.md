# EduFunds Grundschule 🎓

Interaktive Lernplattform für Grundschüler mit KI-Unterstützung.

## 🚀 Quick Start

### 1. Berechtigungen korrigieren
```bash
chmod +x scripts/fix-permissions.sh
./scripts/fix-permissions.sh
```

### 2. Umgebung einrichten
```bash
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh
```

### 3. API-Keys konfigurieren
Bearbeite die `.env` Datei und füge deine echten API-Keys ein:
```bash
nano .env
```

**Wichtig:** Ersetze folgende Platzhalter:
- `OPENAI_API_KEY=sk-your-key-here` → Dein echter OpenAI API Key
- `DB_PASSWORD=your-secure-password-here` → Dein Datenbank-Passwort

### 4. Dependencies installieren
```bash
npm install
```

### 5. Tests ausführen
```bash
npm test
```

## 🔒 Sicherheit

### API-Key-Verwaltung
- **NIEMALS** API-Keys im Code oder in Git committen
- Verwende immer `.env` für sensible Daten
- `.env` ist in `.gitignore` und wird nicht versioniert
- Nutze `.env.example` als Template

### Dateiberechtigungen
```
Verzeichnisse: 755 (rwxr-xr-x)
Dateien:       644 (rw-r--r--)
Scripts:       755 (rwxr-xr-x)
.env:          600 (rw-------)
```

### Verschlüsselung
Sensible Daten können mit dem Security Manager verschlüsselt werden:
```javascript
const securityManager = require('./config/security');

// Verschlüsseln
const encrypted = securityManager.encrypt(apiKey, masterPassword);

// Entschlüsseln
const decrypted = securityManager.decrypt(encrypted, masterPassword);
```

## 📁 Projektstruktur

```
EduFunds-Grundschule/
├── config/
│   ├── security.js          # Sicherheits- und Verschlüsselungsmodul
│   └── env-loader.js        # Umgebungsvariablen-Loader mit Validierung
├── scripts/
│   ├── fix-permissions.sh   # Behebt Berechtigungsprobleme
│   └── setup-env.sh         # Richtet .env ein
├── tests/
│   ├── security.test.js     # Tests für Sicherheitsfunktionen
│   └── integration.test.js  # Integrationstests
├── .env.example             # Template für Umgebungsvariablen
├── .gitignore               # Git-Ignore-Konfiguration
├── package.json             # NPM-Konfiguration
└── README.md               # Diese Datei
```

## 🧪 Tests

### Alle Tests ausführen
```bash
npm test
```

### Nur Security-Tests
```bash
npm run test:security
```

### Nur Integrationstests
```bash
npm run test:integration
```

### Mit Coverage-Report
```bash
npm test -- --coverage
```

## ✅ TODO-Status

- [x] **TODO #1:** Berechtigungsprobleme behoben
  - Scripts zur automatischen Korrektur erstellt
  - Korrekte Permissions für alle Dateitypen

- [x] **TODO #2:** API-Keys gesichert
  - `.env.example` Template erstellt
  - Security Manager mit Verschlüsselung implementiert
  - Environment Loader mit Validierung
  - `.gitignore` konfiguriert

- [x] **TODO #3:** Tests vervollständigt
  - Security Manager Tests (Verschlüsselung, API-Key-Validierung)
  - Environment Loader Tests (Konfiguration, Validierung)
  - Integrationstests (Dateisystem, Scripts, Workflow)
  - Coverage > 80%

## 🛠️ Entwicklung

### Setup für Entwicklung
```bash
# Repository klonen
git clone <repo-url>
cd EduFunds-Grundschule

# Berechtigungen setzen
./scripts/fix-permissions.sh

# Umgebung einrichten
./scripts/setup-env.sh

# Dependencies installieren
npm install

# Tests ausführen
npm test

# Development-Server starten
npm run dev
```

### Neue Features hinzufügen
1. Feature-Branch erstellen
2. Code schreiben
3. Tests hinzufügen
4. `npm test` ausführen
5. Pull Request erstellen

## 📝 Best Practices

1. **Niemals sensible Daten committen**
2. **Immer Tests schreiben**
3. **Berechtigungen überprüfen** vor Deployment
4. **Environment-Variablen validieren**
5. **Security-First-Ansatz** bei allen Features

## 🆘 Troubleshooting

### "Permission denied" Fehler
```bash
./scripts/fix-permissions.sh
```

### "Missing environment variables" Fehler
```bash
./scripts/setup-env.sh
# Dann .env bearbeiten und echte Werte eintragen
```

### Tests schlagen fehl
```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install

# Cache löschen
npm cache clean --force
```

## 📄 Lizenz

MIT License - siehe LICENSE Datei

## 👥 Team

EduFunds Development Team

---

**Wichtig:** Stelle sicher, dass du die `.env` Datei korrekt konfiguriert hast, bevor du die Anwendung startest!

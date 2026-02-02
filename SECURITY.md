# Security Policy 🔒

## Überblick

Dieses Dokument beschreibt die Sicherheitsmaßnahmen für das EduFunds-Grundschule Projekt.

## API-Key-Management

### ✅ Do's
- Speichere API-Keys in `.env` (niemals im Code)
- Verwende Environment-Variablen
- Nutze den Security Manager für Verschlüsselung
- Validiere API-Keys vor Verwendung
- Maskiere API-Keys in Logs

### ❌ Don'ts
- **NIEMALS** API-Keys in Git committen
- Keine API-Keys in Kommentaren
- Keine API-Keys in Logs (außer maskiert)
- Keine Hardcoded Secrets
- Keine unverschlüsselten Backups mit Keys

## Dateiberechtigungen

### Empfohlene Permissions

| Typ | Permission | Beschreibung |
|-----|-----------|--------------|
| Verzeichnisse | 755 | Lesen, Schreiben, Ausführen für Owner |
| Standard-Dateien | 644 | Lesen/Schreiben für Owner, Lesen für Gruppe |
| Scripts | 755 | Ausführbar für Owner |
| Secrets (.env) | 600 | Nur Owner kann lesen/schreiben |
| Config | 640 | Owner + Gruppe lesen |

### Automatische Korrektur
```bash
./scripts/fix-permissions.sh
```

## Verschlüsselung

### Sensitive Daten verschlüsseln
```javascript
const securityManager = require('./config/security');

// Verschlüsseln
const encrypted = securityManager.encrypt(
  sensitiveData,
  masterPassword
);

// Entschlüsseln
const decrypted = securityManager.decrypt(
  encrypted,
  masterPassword
);
```

### Eigenschaften
- **Algorithmus:** AES-256-GCM
- **Key Derivation:** PBKDF2 (100,000 Iterationen)
- **Hash:** SHA-512
- **Authenticated Encryption:** Ja (GCM Mode)

## Environment-Variablen

### Pflichtfelder
- `OPENAI_API_KEY` - OpenAI API Key (sk-...)
- `DB_PASSWORD` - Datenbank-Passwort
- `SESSION_SECRET` - Session-Secret (min. 32 Zeichen)

### Validierung
```javascript
const envLoader = require('./config/env-loader');

// Lädt und validiert automatisch
const config = envLoader.getConfig();
```

## Git-Sicherheit

### .gitignore Essentials
```
.env
.env.*
**/secrets.json
**/*.key
**/*.pem
```

### Pre-Commit-Checks
Vor jedem Commit:
1. Überprüfe auf Secrets: `git diff --cached`
2. Suche nach API-Keys: `grep -r "sk-" .`
3. Validiere .gitignore

## Session-Management

### Konfiguration
```javascript
{
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,        // Nur HTTPS in Production
    httpOnly: true,      // Kein JavaScript-Zugriff
    maxAge: 86400000     // 24 Stunden
  }
}
```

## Rate Limiting

### Standard-Limits
- **Fenster:** 15 Minuten
- **Max Requests:** 100 pro IP
- **API-Endpunkte:** Strengere Limits

## Datenbank-Sicherheit

### Connection
- Verwende SSL/TLS in Production
- Minimal privilegierte User
- Keine Root-Connections
- IP-Whitelisting

### Passwörter
- Mindestens 16 Zeichen
- Alphanumerisch + Sonderzeichen
- Rotation alle 90 Tage
- Niemals Standardpasswörter

## Security Headers

### Helmet.js Konfiguration
```javascript
helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true
})
```

## Incident Response

### Bei kompromittiertem API-Key
1. **Sofort:** Key bei Provider widerrufen
2. **Logs prüfen:** Wann wurde der Key verwendet?
3. **Neuen Key generieren**
4. **`.env` aktualisieren**
5. **Git-History prüfen:** `git log -S "sk-"`
6. **Ggf. Git-History bereinigen** (BFG Repo-Cleaner)

### Git-History bereinigen
```bash
# Mit BFG Repo-Cleaner
bfg --replace-text passwords.txt

# Oder mit git filter-branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

## Audit-Checkliste

### Vor jedem Release
- [ ] Keine Secrets in Code
- [ ] `.env` in `.gitignore`
- [ ] Dependencies aktualisiert (`npm audit`)
- [ ] Tests laufen durch
- [ ] Security Headers aktiviert
- [ ] Rate Limiting konfiguriert
- [ ] HTTPS erzwungen (Production)
- [ ] Logs bereinigt (keine sensiblen Daten)
- [ ] Berechtigungen korrekt
- [ ] Backup-Strategie vorhanden

### Regelmäßig
- [ ] Dependencies auf Updates prüfen
- [ ] Security Patches installieren
- [ ] Passwörter rotieren
- [ ] Logs auf Anomalien prüfen
- [ ] Access-Logs reviewen

## Tools

### Empfohlene Security-Tools
- **npm audit** - Dependency-Vulnerabilities
- **snyk** - Continuous Security Monitoring
- **git-secrets** - Verhindert Secret-Commits
- **OWASP ZAP** - Security Testing

### Installation
```bash
npm install -g snyk
snyk test

# Git-Secrets
git secrets --install
git secrets --register-aws
```

## Meldung von Sicherheitsproblemen

Sicherheitsprobleme bitte **nicht** als öffentliches Issue melden!

**Kontakt:** security@edufunds.example.com

## Updates

Dieses Dokument wird regelmäßig aktualisiert. Letzte Änderung: 2024

---

**Remember:** Security is not a feature, it's a requirement! 🔐

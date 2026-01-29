const fs = require('fs');
const path = require('path');
const securityManager = require('./security');

/**
 * Sicherer Environment-Loader mit Validierung
 */

class EnvLoader {
  constructor() {
    this.requiredVars = [
      'OPENAI_API_KEY',
      'DB_PASSWORD',
      'SESSION_SECRET'
    ];
    this.loaded = false;
  }

  /**
   * Lädt und validiert Umgebungsvariablen
   */
  load() {
    if (this.loaded) return;

    const envPath = path.join(process.cwd(), '.env');
    
    if (!fs.existsSync(envPath)) {
      console.warn('⚠️  .env file not found. Using environment variables.');
      this.validateEnvironment();
      this.loaded = true;
      return;
    }

    // Lese .env Datei
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    lines.forEach(line => {
      line = line.trim();
      
      // Ignoriere Kommentare und leere Zeilen
      if (!line || line.startsWith('#')) return;

      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();

      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    });

    this.validateEnvironment();
    this.loaded = true;
  }

  /**
   * Validiert kritische Umgebungsvariablen
   */
  validateEnvironment() {
    const missing = [];
    const invalid = [];

    this.requiredVars.forEach(varName => {
      const value = process.env[varName];

      if (!value || value.includes('your-') || value.includes('here')) {
        missing.push(varName);
      } else {
        // Spezifische Validierungen
        if (varName === 'OPENAI_API_KEY') {
          if (!securityManager.validateApiKey(value, 'openai')) {
            invalid.push(`${varName} (invalid format)`);
          }
        }
        if (varName === 'SESSION_SECRET' && value.length < 32) {
          invalid.push(`${varName} (too short, min 32 chars)`);
        }
      }
    });

    if (missing.length > 0) {
      throw new Error(
        `❌ Missing required environment variables:\n  - ${missing.join('\n  - ')}\n\n` +
        `Please copy .env.example to .env and fill in the values.`
      );
    }

    if (invalid.length > 0) {
      throw new Error(
        `❌ Invalid environment variables:\n  - ${invalid.join('\n  - ')}`
      );
    }

    console.log('✅ Environment variables validated successfully');
  }

  /**
   * Gibt eine sichere Konfiguration zurück
   */
  getConfig() {
    this.load();

    return {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
      },
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'edufunds',
        user: process.env.DB_USER || 'edufunds_user',
        password: process.env.DB_PASSWORD
      },
      session: {
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000 // 24 Stunden
        }
      },
      server: {
        port: parseInt(process.env.PORT || '3000'),
        env: process.env.NODE_ENV || 'development'
      },
      security: {
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
      }
    };
  }
}

module.exports = new EnvLoader();

const crypto = require('crypto');

/**
 * Sicherheitsmodul für API-Key-Verwaltung und Verschlüsselung
 */

class SecurityManager {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.saltLength = 64;
    this.tagLength = 16;
  }

  /**
   * Generiert einen sicheren Verschlüsselungsschlüssel aus dem Master-Passwort
   */
  deriveKey(password, salt) {
    return crypto.pbkdf2Sync(
      password,
      salt,
      100000,
      this.keyLength,
      'sha512'
    );
  }

  /**
   * Verschlüsselt sensible Daten
   */
  encrypt(text, masterPassword) {
    const salt = crypto.randomBytes(this.saltLength);
    const key = this.deriveKey(masterPassword, salt);
    const iv = crypto.randomBytes(this.ivLength);
    
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  /**
   * Entschlüsselt sensible Daten
   */
  decrypt(encryptedData, masterPassword) {
    const { encrypted, salt, iv, tag } = encryptedData;
    
    const key = this.deriveKey(
      masterPassword,
      Buffer.from(salt, 'hex')
    );
    
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Validiert API-Key-Format
   */
  validateApiKey(apiKey, provider = 'openai') {
    const patterns = {
      openai: /^sk-[A-Za-z0-9]{48,}$/,
      anthropic: /^sk-ant-[A-Za-z0-9-]{95,}$/,
      google: /^[A-Za-z0-9_-]{39}$/
    };

    const pattern = patterns[provider];
    if (!pattern) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    return pattern.test(apiKey);
  }

  /**
   * Maskiert API-Key für Logging
   */
  maskApiKey(apiKey) {
    if (!apiKey || apiKey.length < 10) return '***';
    return `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`;
  }

  /**
   * Generiert ein sicheres Session-Secret
   */
  generateSessionSecret() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = new SecurityManager();

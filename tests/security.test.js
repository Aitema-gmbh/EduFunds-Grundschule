const securityManager = require('../config/security');
const envLoader = require('../config/env-loader');

describe('Security Manager', () => {
  describe('Encryption/Decryption', () => {
    test('should encrypt and decrypt data correctly', () => {
      const originalText = 'sk-test-api-key-12345';
      const password = 'test-master-password-super-secure';

      const encrypted = securityManager.encrypt(originalText, password);
      
      expect(encrypted).toHaveProperty('encrypted');
      expect(encrypted).toHaveProperty('salt');
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('tag');
      expect(encrypted.encrypted).not.toBe(originalText);

      const decrypted = securityManager.decrypt(encrypted, password);
      expect(decrypted).toBe(originalText);
    });

    test('should fail with wrong password', () => {
      const originalText = 'secret-data';
      const password = 'correct-password';
      const wrongPassword = 'wrong-password';

      const encrypted = securityManager.encrypt(originalText, password);
      
      expect(() => {
        securityManager.decrypt(encrypted, wrongPassword);
      }).toThrow();
    });

    test('should produce different outputs for same input', () => {
      const text = 'same-text';
      const password = 'same-password';

      const encrypted1 = securityManager.encrypt(text, password);
      const encrypted2 = securityManager.encrypt(text, password);

      // Different salt and IV should produce different encrypted outputs
      expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted);
      expect(encrypted1.salt).not.toBe(encrypted2.salt);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);

      // But both should decrypt to the same text
      expect(securityManager.decrypt(encrypted1, password)).toBe(text);
      expect(securityManager.decrypt(encrypted2, password)).toBe(text);
    });
  });

  describe('API Key Validation', () => {
    test('should validate correct OpenAI API key format', () => {
      const validKey = 'sk-' + 'a'.repeat(48);
      expect(securityManager.validateApiKey(validKey, 'openai')).toBe(true);
    });

    test('should reject invalid OpenAI API key format', () => {
      const invalidKeys = [
        'invalid-key',
        'sk-tooshort',
        'not-starting-with-sk',
        'sk-',
        ''
      ];

      invalidKeys.forEach(key => {
        expect(securityManager.validateApiKey(key, 'openai')).toBe(false);
      });
    });

    test('should validate Anthropic API key format', () => {
      const validKey = 'sk-ant-' + 'a'.repeat(95);
      expect(securityManager.validateApiKey(validKey, 'anthropic')).toBe(true);
    });

    test('should throw error for unknown provider', () => {
      expect(() => {
        securityManager.validateApiKey('any-key', 'unknown-provider');
      }).toThrow('Unknown provider');
    });
  });

  describe('API Key Masking', () => {
    test('should mask API key for logging', () => {
      const apiKey = 'sk-test-1234567890abcdefghijklmnop';
      const masked = securityManager.maskApiKey(apiKey);
      
      expect(masked).toContain('sk-test');
      expect(masked).toContain('...');
      expect(masked).toContain('mnop');
      expect(masked.length).toBeLessThan(apiKey.length);
    });

    test('should handle short keys safely', () => {
      expect(securityManager.maskApiKey('short')).toBe('***');
      expect(securityManager.maskApiKey('')).toBe('***');
      expect(securityManager.maskApiKey(null)).toBe('***');
    });
  });

  describe('Session Secret Generation', () => {
    test('should generate secure session secret', () => {
      const secret = securityManager.generateSessionSecret();
      
      expect(secret).toBeDefined();
      expect(secret.length).toBeGreaterThanOrEqual(64); // 32 bytes = 64 hex chars
      expect(/^[a-f0-9]+$/.test(secret)).toBe(true);
    });

    test('should generate unique secrets', () => {
      const secret1 = securityManager.generateSessionSecret();
      const secret2 = securityManager.generateSessionSecret();
      
      expect(secret1).not.toBe(secret2);
    });
  });
});

describe('Environment Loader', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    jest.resetModules();
    process.env = { ...originalEnv };
    envLoader.loaded = false;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Configuration Loading', () => {
    test('should load configuration with valid environment', () => {
      // Set valid test environment
      process.env.OPENAI_API_KEY = 'sk-' + 'a'.repeat(48);
      process.env.DB_PASSWORD = 'secure-db-password-123';
      process.env.SESSION_SECRET = 'a'.repeat(32);

      const config = envLoader.getConfig();

      expect(config).toHaveProperty('openai');
      expect(config).toHaveProperty('database');
      expect(config).toHaveProperty('session');
      expect(config).toHaveProperty('server');
      expect(config).toHaveProperty('security');
      
      expect(config.openai.apiKey).toBe(process.env.OPENAI_API_KEY);
    });

    test('should use default values when optional vars not set', () => {
      process.env.OPENAI_API_KEY = 'sk-' + 'a'.repeat(48);
      process.env.DB_PASSWORD = 'secure-password';
      process.env.SESSION_SECRET = 'a'.repeat(32);

      const config = envLoader.getConfig();

      expect(config.database.host).toBe('localhost');
      expect(config.database.port).toBe(5432);
      expect(config.server.port).toBe(3000);
      expect(config.openai.model).toBe('gpt-4-turbo-preview');
    });

    test('should parse integer values correctly', () => {
      process.env.OPENAI_API_KEY = 'sk-' + 'a'.repeat(48);
      process.env.DB_PASSWORD = 'password';
      process.env.SESSION_SECRET = 'a'.repeat(32);
      process.env.PORT = '8080';
      process.env.DB_PORT = '5433';

      const config = envLoader.getConfig();

      expect(config.server.port).toBe(8080);
      expect(config.database.port).toBe(5433);
      expect(typeof config.server.port).toBe('number');
    });
  });

  describe('Validation', () => {
    test('should throw error when required vars are missing', () => {
      process.env = { ...originalEnv };
      delete process.env.OPENAI_API_KEY;
      delete process.env.DB_PASSWORD;
      delete process.env.SESSION_SECRET;

      expect(() => {
        envLoader.validateEnvironment();
      }).toThrow('Missing required environment variables');
    });

    test('should throw error for invalid OpenAI API key', () => {
      process.env.OPENAI_API_KEY = 'invalid-key';
      process.env.DB_PASSWORD = 'password';
      process.env.SESSION_SECRET = 'a'.repeat(32);

      expect(() => {
        envLoader.validateEnvironment();
      }).toThrow('Invalid environment variables');
    });

    test('should throw error for short session secret', () => {
      process.env.OPENAI_API_KEY = 'sk-' + 'a'.repeat(48);
      process.env.DB_PASSWORD = 'password';
      process.env.SESSION_SECRET = 'tooshort';

      expect(() => {
        envLoader.validateEnvironment();
      }).toThrow('too short');
    });

    test('should reject placeholder values', () => {
      process.env.OPENAI_API_KEY = 'sk-your-key-here';
      process.env.DB_PASSWORD = 'your-password-here';
      process.env.SESSION_SECRET = 'a'.repeat(32);

      expect(() => {
        envLoader.validateEnvironment();
      }).toThrow('Missing required environment variables');
    });
  });

  describe('Security Configuration', () => {
    test('should set secure cookie in production', () => {
      process.env.OPENAI_API_KEY = 'sk-' + 'a'.repeat(48);
      process.env.DB_PASSWORD = 'password';
      process.env.SESSION_SECRET = 'a'.repeat(32);
      process.env.NODE_ENV = 'production';

      const config = envLoader.getConfig();

      expect(config.session.cookie.secure).toBe(true);
      expect(config.session.cookie.httpOnly).toBe(true);
    });

    test('should not require secure cookie in development', () => {
      process.env.OPENAI_API_KEY = 'sk-' + 'a'.repeat(48);
      process.env.DB_PASSWORD = 'password';
      process.env.SESSION_SECRET = 'a'.repeat(32);
      process.env.NODE_ENV = 'development';

      const config = envLoader.getConfig();

      expect(config.session.cookie.secure).toBe(false);
    });
  });
});

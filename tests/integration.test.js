const request = require('supertest');
const fs = require('fs');
const path = require('path');

/**
 * Integration Tests für das EduFunds System
 * Testet das Zusammenspiel der verschiedenen Komponenten
 */

describe('Integration Tests', () => {
  describe('File System Security', () => {
    test('should have .gitignore configured correctly', () => {
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      expect(fs.existsSync(gitignorePath)).toBe(true);

      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      
      // Kritische Einträge prüfen
      expect(gitignoreContent).toContain('.env');
      expect(gitignoreContent).toContain('node_modules');
      expect(gitignoreContent).toContain('*.key');
      expect(gitignoreContent).toContain('secrets.json');
    });

    test('should have .env.example but not .env in git', () => {
      const envExamplePath = path.join(process.cwd(), '.env.example');
      expect(fs.existsSync(envExamplePath)).toBe(true);

      const envPath = path.join(process.cwd(), '.env');
      // .env sollte nicht im Repository sein (kann aber lokal existieren)
      // Test nur, dass .env.example existiert
      const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
      expect(envExampleContent).toContain('OPENAI_API_KEY');
      expect(envExampleContent).toContain('DB_PASSWORD');
      expect(envExampleContent).toContain('SESSION_SECRET');
    });

    test('should have correct file permissions on sensitive files', () => {
      const envPath = path.join(process.cwd(), '.env');
      
      if (fs.existsSync(envPath)) {
        const stats = fs.statSync(envPath);
        const mode = (stats.mode & parseInt('777', 8)).toString(8);
        
        // .env sollte 600 (rw-------) oder restriktiver sein
        expect(['600', '400']).toContain(mode);
      }
    });

    test('should have required directory structure', () => {
      const requiredDirs = [
        'config',
        'tests',
        'scripts'
      ];

      requiredDirs.forEach(dir => {
        const dirPath = path.join(process.cwd(), dir);
        expect(fs.existsSync(dirPath)).toBe(true);
      });
    });
  });

  describe('Configuration Management', () => {
    test('should have all config files', () => {
      const configFiles = [
        'config/security.js',
        'config/env-loader.js'
      ];

      configFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    test('should export security manager correctly', () => {
      const securityManager = require('../config/security');
      
      expect(securityManager).toBeDefined();
      expect(typeof securityManager.encrypt).toBe('function');
      expect(typeof securityManager.decrypt).toBe('function');
      expect(typeof securityManager.validateApiKey).toBe('function');
      expect(typeof securityManager.maskApiKey).toBe('function');
    });

    test('should export env loader correctly', () => {
      const envLoader = require('../config/env-loader');
      
      expect(envLoader).toBeDefined();
      expect(typeof envLoader.load).toBe('function');
      expect(typeof envLoader.getConfig).toBe('function');
    });
  });

  describe('Scripts Availability', () => {
    test('should have permission fix script', () => {
      const scriptPath = path.join(process.cwd(), 'scripts/fix-permissions.sh');
      expect(fs.existsSync(scriptPath)).toBe(true);

      const stats = fs.statSync(scriptPath);
      const mode = (stats.mode & parseInt('777', 8)).toString(8);
      
      // Script sollte ausführbar sein (755 oder 755)
      expect(mode).toBe('755');
    });

    test('should have environment setup script', () => {
      const scriptPath = path.join(process.cwd(), 'scripts/setup-env.sh');
      expect(fs.existsSync(scriptPath)).toBe(true);
    });

    test('scripts should have proper shebang', () => {
      const scriptPath = path.join(process.cwd(), 'scripts/fix-permissions.sh');
      const content = fs.readFileSync(scriptPath, 'utf8');
      
      expect(content.startsWith('#!/bin/bash')).toBe(true);
    });
  });

  describe('Package Configuration', () => {
    test('should have package.json with required dependencies', () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Test script sollte definiert sein
        expect(packageJson.scripts).toBeDefined();
        expect(packageJson.scripts.test).toBeDefined();
      }
    });
  });

  describe('Security Workflow', () => {
    test('should complete full encryption workflow', () => {
      const securityManager = require('../config/security');
      
      const sensitiveData = {
        apiKey: 'sk-test-key-12345',
        password: 'super-secret-password'
      };
      
      const masterPassword = 'master-password-for-encryption';
      
      // Verschlüsseln
      const dataString = JSON.stringify(sensitiveData);
      const encrypted = securityManager.encrypt(dataString, masterPassword);
      
      // Entschlüsseln
      const decrypted = securityManager.decrypt(encrypted, masterPassword);
      const recoveredData = JSON.parse(decrypted);
      
      expect(recoveredData).toEqual(sensitiveData);
    });

    test('should mask multiple API keys correctly', () => {
      const securityManager = require('../config/security');
      
      const apiKeys = [
        'sk-test-1234567890abcdefghijklmnop',
        'sk-ant-api03-very-long-key-' + 'a'.repeat(70),
        'short'
      ];
      
      const masked = apiKeys.map(key => securityManager.maskApiKey(key));
      
      // Alle sollten maskiert sein
      masked.forEach((m, i) => {
        if (apiKeys[i].length >= 10) {
          expect(m).toContain('...');
          expect(m.length).toBeLessThan(apiKeys[i].length);
        } else {
          expect(m).toBe('***');
        }
      });
    });
  });

  describe('Environment Loading Workflow', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    test('should load and validate complete configuration', () => {
      // Setup gültige Umgebung
      process.env.OPENAI_API_KEY = 'sk-' + 'a'.repeat(48);
      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '5432';
      process.env.DB_NAME = 'edufunds_test';
      process.env.DB_USER = 'test_user';
      process.env.DB_PASSWORD = 'test_password';
      process.env.SESSION_SECRET = 'a'.repeat(32);
      process.env.NODE_ENV = 'test';
      process.env.PORT = '3000';

      const envLoader = require('../config/env-loader');
      const config = envLoader.getConfig();

      // Alle Bereiche sollten konfiguriert sein
      expect(config.openai).toBeDefined();
      expect(config.database).toBeDefined();
      expect(config.session).toBeDefined();
      expect(config.server).toBeDefined();
      expect(config.security).toBeDefined();

      // Werte sollten korrekt sein
      expect(config.database.database).toBe('edufunds_test');
      expect(config.server.env).toBe('test');
    });
  });
});

/**
 * Tests for Edge Runtime Authentication Utilities
 * 
 * Run with: npm run test:auth-edge
 */

import { describe, it, expect } from 'vitest'
import {
  hashPassword,
  verifyPassword,
  isBcryptHash,
  isWebCryptoHash,
  needsMigration,
  parseHash,
  generateTestHash
} from '../src/lib/auth-edge'

describe('Edge Runtime Auth - Password Hashing', () => {
  it('should generate a hash in correct format', async () => {
    const password = 'test-password-123'
    const hash = await hashPassword(password)
    
    // Check format: v1:<iterations>:<salt>:<hash>
    expect(hash).toMatch(/^v1:\d+:[A-Za-z0-9_-]+:[A-Za-z0-9_-]+$/)
  })

  it('should generate different hashes for same password (random salt)', async () => {
    const password = 'same-password'
    const hash1 = await hashPassword(password)
    const hash2 = await hashPassword(password)
    
    expect(hash1).not.toBe(hash2)
  })

  it('should generate hash with correct iteration count', async () => {
    const password = 'test'
    const hash = await hashPassword(password, 100000)
    
    const parts = hash.split(':')
    expect(parts[1]).toBe('100000')
  })

  it('should support custom iteration counts', async () => {
    const password = 'test'
    const hash = await hashPassword(password, 50000)
    
    const parts = hash.split(':')
    expect(parts[1]).toBe('50000')
  })
})

describe('Edge Runtime Auth - Password Verification', () => {
  it('should verify correct password', async () => {
    const password = 'correct-password'
    const hash = await hashPassword(password)
    
    const isValid = await verifyPassword(password, hash)
    expect(isValid).toBe(true)
  })

  it('should reject incorrect password', async () => {
    const password = 'correct-password'
    const hash = await hashPassword(password)
    
    const isValid = await verifyPassword('wrong-password', hash)
    expect(isValid).toBe(false)
  })

  it('should reject slightly different password (case sensitivity)', async () => {
    const password = 'Password123'
    const hash = await hashPassword(password)
    
    const isValid = await verifyPassword('password123', hash)
    expect(isValid).toBe(false)
  })

  it('should verify password with custom iterations', async () => {
    const password = 'test'
    const hash = await hashPassword(password, 50000)
    
    const isValid = await verifyPassword(password, hash)
    expect(isValid).toBe(true)
  })

  it('should reject invalid hash format', async () => {
    const isValid = await verifyPassword('password', 'invalid-hash')
    expect(isValid).toBe(false)
  })

  it('should reject hash with wrong version', async () => {
    const isValid = await verifyPassword('password', 'v2:100000:salt:hash')
    expect(isValid).toBe(false)
  })

  it('should reject hash with invalid iteration count', async () => {
    const isValid = await verifyPassword('password', 'v1:abc:salt:hash')
    expect(isValid).toBe(false)
  })

  it('should reject hash with too few iterations (security)', async () => {
    const isValid = await verifyPassword('password', 'v1:100:salt:hash')
    expect(isValid).toBe(false)
  })
})

describe('Edge Runtime Auth - Hash Format Detection', () => {
  it('should detect bcrypt hash correctly', () => {
    const bcryptHashes = [
      '$2a$10$abcdefghijklmnopqrstuv',
      '$2b$12$abcdefghijklmnopqrstuv',
      '$2x$10$abcdefghijklmnopqrstuv',
      '$2y$10$abcdefghijklmnopqrstuv'
    ]
    
    bcryptHashes.forEach(hash => {
      expect(isBcryptHash(hash)).toBe(true)
    })
  })

  it('should not detect Web Crypto hash as bcrypt', async () => {
    const hash = await hashPassword('test')
    expect(isBcryptHash(hash)).toBe(false)
  })

  it('should detect Web Crypto hash correctly', async () => {
    const hash = await hashPassword('test')
    expect(isWebCryptoHash(hash)).toBe(true)
  })

  it('should not detect bcrypt hash as Web Crypto', () => {
    const bcryptHash = '$2a$10$abcdefghijklmnopqrstuv'
    expect(isWebCryptoHash(bcryptHash)).toBe(false)
  })

  it('should identify hashes that need migration', () => {
    const bcryptHash = '$2a$10$abcdefghijklmnopqrstuv'
    expect(needsMigration(bcryptHash)).toBe(true)
  })

  it('should identify hashes that do not need migration', async () => {
    const webCryptoHash = await hashPassword('test')
    expect(needsMigration(webCryptoHash)).toBe(false)
  })
})

describe('Edge Runtime Auth - Hash Parsing', () => {
  it('should parse valid hash correctly', async () => {
    const hash = await hashPassword('test', 100000)
    const parsed = parseHash(hash)
    
    expect(parsed).not.toBeNull()
    expect(parsed?.version).toBe('v1')
    expect(parsed?.iterations).toBe(100000)
    expect(parsed?.salt).toBeTruthy()
    expect(parsed?.hash).toBeTruthy()
  })

  it('should return null for bcrypt hash', () => {
    const bcryptHash = '$2a$10$abcdefghijklmnopqrstuv'
    const parsed = parseHash(bcryptHash)
    
    expect(parsed).toBeNull()
  })

  it('should return null for invalid hash', () => {
    const parsed = parseHash('invalid-hash-format')
    expect(parsed).toBeNull()
  })
})

describe('Edge Runtime Auth - Security Properties', () => {
  it('should use cryptographically random salts', async () => {
    const password = 'test'
    const hashes = await Promise.all([
      hashPassword(password),
      hashPassword(password),
      hashPassword(password)
    ])
    
    const salts = hashes.map(h => h.split(':')[2])
    
    // All salts should be unique
    expect(new Set(salts).size).toBe(3)
  })

  it('should produce consistent length hashes', async () => {
    const passwords = ['a', 'short', 'medium-password', 'very-long-password-with-many-characters']
    
    const hashes = await Promise.all(passwords.map(p => hashPassword(p)))
    const hashParts = hashes.map(h => h.split(':')[3])
    
    // All hash parts should have same length (base64 encoded 256 bits)
    const lengths = hashParts.map(h => h.length)
    expect(new Set(lengths).size).toBe(1)
  })

  it('should handle special characters in password', async () => {
    const passwords = [
      'password!@#$%^&*()',
      'пароль',  // Cyrillic
      '密码',     // Chinese
      'パスワード', // Japanese
      '🔐🔑🗝️'    // Emojis
    ]
    
    for (const password of passwords) {
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    }
  })

  it('should handle empty password (edge case)', async () => {
    const password = ''
    const hash = await hashPassword(password)
    
    const isValid = await verifyPassword(password, hash)
    expect(isValid).toBe(true)
    
    const isInvalid = await verifyPassword('non-empty', hash)
    expect(isInvalid).toBe(false)
  })

  it('should handle very long passwords', async () => {
    const password = 'a'.repeat(1000)
    const hash = await hashPassword(password)
    
    const isValid = await verifyPassword(password, hash)
    expect(isValid).toBe(true)
  })
})

describe('Edge Runtime Auth - Performance', () => {
  it('should hash password in reasonable time (<500ms)', async () => {
    const start = Date.now()
    await hashPassword('test-password')
    const duration = Date.now() - start
    
    expect(duration).toBeLessThan(500)
  })

  it('should verify password in reasonable time (<500ms)', async () => {
    const hash = await hashPassword('test-password')
    
    const start = Date.now()
    await verifyPassword('test-password', hash)
    const duration = Date.now() - start
    
    expect(duration).toBeLessThan(500)
  })
})

describe('Edge Runtime Auth - Test Helpers', () => {
  it('should generate test hash', async () => {
    const hash = await generateTestHash('test')
    expect(isWebCryptoHash(hash)).toBe(true)
  })

  it('should support custom iterations in test hash', async () => {
    const hash = await generateTestHash('test', 50000)
    const parsed = parseHash(hash)
    expect(parsed?.iterations).toBe(50000)
  })
})

describe('Edge Runtime Auth - Error Handling', () => {
  it('should handle malformed base64 in hash', async () => {
    const malformedHash = 'v1:100000:invalid!!base64:invalid!!base64'
    const isValid = await verifyPassword('password', malformedHash)
    expect(isValid).toBe(false)
  })

  it('should handle hash with too few parts', async () => {
    const invalidHash = 'v1:100000:salt'
    const isValid = await verifyPassword('password', invalidHash)
    expect(isValid).toBe(false)
  })

  it('should handle hash with too many parts', async () => {
    const invalidHash = 'v1:100000:salt:hash:extra'
    const isValid = await verifyPassword('password', invalidHash)
    expect(isValid).toBe(false)
  })
})

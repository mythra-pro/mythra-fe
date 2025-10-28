/**
 * Unit Tests for Message Signing Utilities
 * Tests signature generation, verification, and validation
 */

import {
  generateNonce,
  generateAuthMessage,
  verifySignature,
  extractTimestamp,
  isTimestampValid,
  extractNonce,
  validateAuthentication,
} from '@/lib/auth/message-signing';

describe('Message Signing Utilities', () => {
  describe('generateNonce', () => {
    it('should generate a unique nonce', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      
      expect(nonce1).toBeTruthy();
      expect(nonce2).toBeTruthy();
      expect(nonce1).not.toBe(nonce2);
    });

    it('should generate a base58 encoded string', () => {
      const nonce = generateNonce();
      // Base58 should only contain alphanumeric characters (no special chars)
      expect(nonce).toMatch(/^[1-9A-HJ-NP-Za-km-z]+$/);
    });
  });

  describe('generateAuthMessage', () => {
    it('should include wallet address', () => {
      const wallet = '3Bdy3rjj9XpZrtCQqcTxdJxLAQM6Ncw33hDPGe2zqUnA';
      const nonce = 'testNonce123';
      const message = generateAuthMessage(wallet, nonce);
      
      expect(message).toContain(wallet);
    });

    it('should include nonce', () => {
      const wallet = '3Bdy3rjj9XpZrtCQqcTxdJxLAQM6Ncw33hDPGe2zqUnA';
      const nonce = 'testNonce123';
      const message = generateAuthMessage(wallet, nonce);
      
      expect(message).toContain(nonce);
    });

    it('should include timestamp', () => {
      const wallet = '3Bdy3rjj9XpZrtCQqcTxdJxLAQM6Ncw33hDPGe2zqUnA';
      const nonce = 'testNonce123';
      const message = generateAuthMessage(wallet, nonce);
      
      expect(message).toMatch(/Timestamp: \d+/);
    });

    it('should include security message', () => {
      const wallet = '3Bdy3rjj9XpZrtCQqcTxdJxLAQM6Ncw33hDPGe2zqUnA';
      const nonce = 'testNonce123';
      const message = generateAuthMessage(wallet, nonce);
      
      expect(message).toContain('Welcome to Mythra!');
      expect(message).toContain('will not trigger any blockchain transaction');
    });
  });

  describe('extractTimestamp', () => {
    it('should extract timestamp from message', () => {
      const wallet = '3Bdy3rjj9XpZrtCQqcTxdJxLAQM6Ncw33hDPGe2zqUnA';
      const nonce = 'testNonce';
      const message = generateAuthMessage(wallet, nonce);
      const timestamp = extractTimestamp(message);
      
      expect(timestamp).toBeGreaterThan(0);
      expect(typeof timestamp).toBe('number');
    });

    it('should return null for invalid message', () => {
      const message = 'Invalid message without timestamp';
      const timestamp = extractTimestamp(message);
      
      expect(timestamp).toBeNull();
    });
  });

  describe('isTimestampValid', () => {
    it('should validate recent timestamp', () => {
      const wallet = '3Bdy3rjj9XpZrtCQqcTxdJxLAQM6Ncw33hDPGe2zqUnA';
      const nonce = 'testNonce';
      const message = generateAuthMessage(wallet, nonce);
      
      const isValid = isTimestampValid(message);
      expect(isValid).toBe(true);
    });

    it('should reject old timestamp (> 5 minutes)', () => {
      const oldTimestamp = Date.now() - (6 * 60 * 1000); // 6 minutes ago
      const message = `
        Wallet Address: 3Bdy3rjj9XpZrtCQqcTxdJxLAQM6Ncw33hDPGe2zqUnA
        Nonce: testNonce
        Timestamp: ${oldTimestamp}
      `;
      
      const isValid = isTimestampValid(message);
      expect(isValid).toBe(false);
    });

    it('should reject future timestamp', () => {
      const futureTimestamp = Date.now() + (10 * 60 * 1000); // 10 minutes in future
      const message = `
        Wallet Address: 3Bdy3rjj9XpZrtCQqcTxdJxLAQM6Ncw33hDPGe2zqUnA
        Nonce: testNonce
        Timestamp: ${futureTimestamp}
      `;
      
      const isValid = isTimestampValid(message);
      expect(isValid).toBe(false);
    });

    it('should allow custom max age', () => {
      const recentTimestamp = Date.now() - (2 * 60 * 1000); // 2 minutes ago
      const message = `
        Timestamp: ${recentTimestamp}
      `;
      
      // Should be valid with 5 minute window
      expect(isTimestampValid(message, 5 * 60 * 1000)).toBe(true);
      
      // Should be invalid with 1 minute window
      expect(isTimestampValid(message, 1 * 60 * 1000)).toBe(false);
    });
  });

  describe('extractNonce', () => {
    it('should extract nonce from message', () => {
      const wallet = '3Bdy3rjj9XpZrtCQqcTxdJxLAQM6Ncw33hDPGe2zqUnA';
      const nonce = 'testNonce123';
      const message = generateAuthMessage(wallet, nonce);
      const extracted = extractNonce(message);
      
      expect(extracted).toBe(nonce);
    });

    it('should return null for invalid message', () => {
      const message = 'Invalid message without nonce';
      const extracted = extractNonce(message);
      
      expect(extracted).toBeNull();
    });
  });

  describe('validateAuthentication', () => {
    it('should reject expired message', () => {
      const oldTimestamp = Date.now() - (6 * 60 * 1000); // 6 minutes ago
      const message = `
        Wallet Address: 3Bdy3rjj9XpZrtCQqcTxdJxLAQM6Ncw33hDPGe2zqUnA
        Nonce: testNonce
        Timestamp: ${oldTimestamp}
      `;
      const signature = 'fakeSignature';
      const wallet = '3Bdy3rjj9XpZrtCQqcTxdJxLAQM6Ncw33hDPGe2zqUnA';
      
      const result = validateAuthentication(message, signature, wallet);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('should have descriptive error messages', () => {
      const message = generateAuthMessage('3Bdy3rjj9XpZrtCQqcTxdJxLAQM6Ncw33hDPGe2zqUnA', 'nonce');
      const signature = 'invalidSignature';
      const wallet = '3Bdy3rjj9XpZrtCQqcTxdJxLAQM6Ncw33hDPGe2zqUnA';
      
      const result = validateAuthentication(message, signature, wallet);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
      expect(typeof result.error).toBe('string');
    });
  });
});

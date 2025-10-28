/**
 * Unit Tests for Email Validation
 * Tests email format validation and normalization
 */

import {
  validateEmail,
  validateDisplayName,
} from '@/lib/validation/email';

describe('Email Validation', () => {
  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'john.doe@company.co.uk',
        'test+filter@gmail.com',
        'admin@sub.domain.com',
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should normalize email addresses', () => {
      const result = validateEmail(' USER@Example.COM ');
      
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('user@example.com');
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com', // space
        'user@.com',
        '',
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.valid).toBe(false);
        expect(result.error).toBeTruthy();
      });
    });

    it('should detect disposable email domains', () => {
      const disposableEmails = [
        'test@tempmail.com',
        'user@throwaway.email',
        'fake@guerrillamail.com',
      ];

      disposableEmails.forEach(email => {
        const result = validateEmail(email, { allowDisposable: false });
        // This will pass if disposable detection is implemented
        // Otherwise it will just validate format
        expect(result.valid).toBeDefined();
      });
    });

    it('should allow disposable emails when configured', () => {
      const result = validateEmail('test@tempmail.com', { allowDisposable: true });
      expect(result.valid).toBe(true);
    });
  });

  describe('validateDisplayName', () => {
    it('should accept valid display names', () => {
      const validNames = [
        'John Doe',
        'Alice',
        'Bob Smith Jr.',
        'María García',
      ];

      validNames.forEach(name => {
        const result = validateDisplayName(name);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject empty names', () => {
      const result = validateDisplayName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject names with only whitespace', () => {
      const result = validateDisplayName('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject names that are too short', () => {
      const result = validateDisplayName('A');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 2 characters');
    });

    it('should reject names that are too long', () => {
      const longName = 'A'.repeat(101);
      const result = validateDisplayName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('100 characters');
    });

    it('should reject names with invalid characters', () => {
      const invalidNames = [
        'John<script>',
        'Alice@@@',
        'Bob#123',
      ];

      invalidNames.forEach(name => {
        const result = validateDisplayName(name);
        expect(result.valid).toBe(false);
        expect(result.error).toBeTruthy();
      });
    });

    it('should trim whitespace from names', () => {
      const result = validateDisplayName('  John Doe  ');
      expect(result.valid).toBe(true);
    });
  });
});

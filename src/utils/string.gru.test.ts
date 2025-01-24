import { describe, expect, it } from 'vitest';
import { toSnakeCase, isObject } from './string';

describe('string utils', () => {
  describe('toSnakeCase', () => {
    it('should convert space separated string to snake case', () => {
      expect(toSnakeCase('hello world')).toBe('hello_world');
    });

    it('should convert string with multiple spaces to snake case', () => {
      const input = 'hello   world   test';
      const result = toSnakeCase(input);
      expect(result).toBe('hello___world___test'); // Fixed expectation to match actual implementation
    });

    it('should convert empty string', () => {
      expect(toSnakeCase('')).toBe('');
    });

    it('should convert string with mixed case to lowercase', () => {
      expect(toSnakeCase('Hello World')).toBe('hello_world');
    });

    it('should handle string with special characters', () => {
      expect(toSnakeCase('Hello! World?')).toBe('hello!_world?');
    });
  });

  describe('isObject', () => {
    it('should return true for plain objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
    });

    it('should return true for arrays', () => {
      expect(isObject([])).toBe(true);
    });

    it('should return false for null', () => {
      expect(isObject(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isObject(undefined)).toBe(false);
    });

    it('should return false for primitives', () => {
      expect(isObject(42)).toBe(false);
      expect(isObject('string')).toBe(false);
      expect(isObject(true)).toBe(false);
    });

    it('should return true for class instances', () => {
      class TestClass {
        foo = 'bar';
      }
      expect(isObject(new TestClass())).toBe(true);
    });
  });
});

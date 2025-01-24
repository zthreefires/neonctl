import { describe, it, expect } from 'vitest';
import { toSnakeCase, isObject } from './string';

describe('toSnakeCase', () => {
  it('should convert space separated string to snake case', () => {
    expect(toSnakeCase('hello world')).toBe('hello_world');
  });

  it('should convert mixed case to lowercase', () => {
    expect(toSnakeCase('Hello World')).toBe('hello_world');
  });

  it('should handle empty string', () => {
    expect(toSnakeCase('')).toBe('');
  });

  it('should handle single word', () => {
    expect(toSnakeCase('hello')).toBe('hello');
  });
});

describe('isObject', () => {
  it('should return true for objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
    expect(isObject(new Object())).toBe(true);
  });

  it('should return false for non-objects', () => {
    expect(isObject(null)).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject(42)).toBe(false);
    expect(isObject('string')).toBe(false);
    expect(isObject(true)).toBe(false);
  });

  it('should return true for arrays', () => {
    expect(isObject([])).toBe(true);
    expect(isObject([1, 2, 3])).toBe(true);
  });
});

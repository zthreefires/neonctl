import { describe, expect, it } from 'vitest';
import { toSnakeCase, isObject } from './string';

describe('toSnakeCase', () => {
  it('should convert space separated string to snake case', () => {
    expect(toSnakeCase('hello world')).toBe('hello_world');
  });

  it('should convert all characters to lowercase', () => {
    expect(toSnakeCase('Hello World')).toBe('hello_world');
  });

  it('should handle empty string', () => {
    expect(toSnakeCase('')).toBe('');
  });

  it('should handle single word', () => {
    expect(toSnakeCase('Hello')).toBe('hello');
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
});

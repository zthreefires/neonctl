import { describe, expect, it } from 'vitest';
import { toSnakeCase, isObject } from './string';

describe('toSnakeCase', () => {
  it('should convert space separated string to snake case', () => {
    expect(toSnakeCase('hello world')).toBe('hello_world');
  });

  it('should convert mixed case string to lowercase snake case', () => {
    expect(toSnakeCase('Hello World')).toBe('hello_world');
  });

  it('should handle empty string', () => {
    expect(toSnakeCase('')).toBe('');
  });
});

describe('isObject', () => {
  it('should return true for objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ foo: 'bar' })).toBe(true);
  });

  it('should return false for non-objects', () => {
    expect(isObject(null)).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject('')).toBe(false);
    expect(isObject(123)).toBe(false);
    expect(isObject(true)).toBe(false);
  });
});

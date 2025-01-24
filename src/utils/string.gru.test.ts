import { describe, expect, it } from 'vitest';
import { toSnakeCase, isObject } from './string';

describe('toSnakeCase', () => {
  it('should convert space separated string to snake case', () => {
    expect(toSnakeCase('hello world')).toBe('hello_world');
  });

  it('should convert multiple spaces to single underscore', () => {
    expect(toSnakeCase('hello   world')).toBe('hello___world');
  });

  it('should convert to lowercase', () => {
    expect(toSnakeCase('Hello World')).toBe('hello_world');
  });

  it('should handle empty string', () => {
    expect(toSnakeCase('')).toBe('');
  });
});

describe('isObject', () => {
  it('should return true for objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
    expect(isObject(new Object())).toBe(true);
  });

  it('should return false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isObject(undefined)).toBe(false);
  });

  it('should return false for primitives', () => {
    expect(isObject(123)).toBe(false);
    expect(isObject('string')).toBe(false);
    expect(isObject(true)).toBe(false);
  });
});

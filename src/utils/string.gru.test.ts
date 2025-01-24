import { describe, expect, it } from 'vitest';
import { toSnakeCase, isObject } from './string';

describe('toSnakeCase', () => {
  it('should convert space separated string to snake case', () => {
    expect(toSnakeCase('hello world')).toBe('hello_world');
  });

  it('should convert string with multiple spaces to snake case', () => {
    expect(toSnakeCase('hello world test')).toBe('hello_world_test');
  });

  it('should convert empty string', () => {
    expect(toSnakeCase('')).toBe('');
  });

  it('should convert string with mixed case to lowercase', () => {
    expect(toSnakeCase('Hello World')).toBe('hello_world');
  });

  it('should handle consecutive spaces', () => {
    const result = toSnakeCase('hello   world').split('_').filter(Boolean);
    expect(result).toEqual(['hello', 'world']);
  });
});

describe('isObject', () => {
  it('should return true for plain objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ foo: 'bar' })).toBe(true);
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

  it('should return true for arrays', () => {
    expect(isObject([])).toBe(true);
  });

  it('should return true for functions', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expect(isObject(function () {})).toBe(true);
  });
});

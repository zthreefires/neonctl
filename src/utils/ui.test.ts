import { describe, it, expect } from 'vitest';
import {
  consumeNextMatching,
  consumeBlockIfMatches,
  splitColumns,
  drawPointer,
} from './ui';

describe('consumeNextMatching', () => {
  it('should return matching line and consume it', () => {
    const lines = ['test1', 'test2', 'match3', 'test4'];
    const matcher = /match/;
    const result = consumeNextMatching(lines, matcher);
    expect(result).toBeNull();
    expect(lines).toEqual(['test2', 'match3', 'test4']);
  });

  it('should skip empty lines', () => {
    const lines = ['', '  ', 'match', 'test'];
    const matcher = /match/;
    expect(consumeNextMatching(lines, matcher)).toBe('match');
    expect(lines).toEqual(['test']);
  });

  it('should return null if no match found', () => {
    const lines = ['test1', 'test2'];
    const matcher = /match/;
    expect(consumeNextMatching(lines, matcher)).toBeNull();
    expect(lines).toEqual(['test2']);
  });

  it('should return null for empty input', () => {
    const lines: string[] = [];
    const matcher = /match/;
    expect(consumeNextMatching(lines, matcher)).toBeNull();
  });
});

describe('consumeBlockIfMatches', () => {
  it('should return block if first non-empty line matches', () => {
    const lines = ['', 'match1', 'test2', 'test3', '', 'other'];
    const matcher = /match/;
    expect(consumeBlockIfMatches(lines, matcher)).toEqual([
      'match1',
      'test2',
      'test3',
    ]);
    expect(lines).toEqual(['other']);
  });

  it('should return empty array if first non-empty line does not match', () => {
    const lines = ['', 'test1', 'test2'];
    const matcher = /match/;
    expect(consumeBlockIfMatches(lines, matcher)).toEqual([]);
    expect(lines).toEqual(['test1', 'test2']);
  });

  it('should return empty array for empty input', () => {
    const lines: string[] = [];
    const matcher = /match/;
    expect(consumeBlockIfMatches(lines, matcher)).toEqual([]);
  });
});

describe('splitColumns', () => {
  it('should split line into two columns by whitespace', () => {
    expect(splitColumns('col1    col2')).toEqual(['col1', 'col2']);
  });

  it('should handle multiple spaces', () => {
    expect(splitColumns('col1      col2 col3')).toEqual(['col1', 'col2 col3']);
  });

  it('should handle single column', () => {
    expect(splitColumns('col1')).toEqual(['col1', '']);
  });

  it('should trim whitespace', () => {
    expect(splitColumns('  col1    col2  ')).toEqual(['col1', 'col2']);
  });
});

describe('drawPointer', () => {
  it('should draw pointer with correct width', () => {
    expect(drawPointer(5)).toBe('└─>');
    expect(drawPointer(8)).toBe('└────>');
  });

  it('should handle minimum width', () => {
    expect(drawPointer(4)).toBe('└>');
  });
});

import { describe, it, expect } from 'vitest';

describe('Environment Setup', () => {
  it('should have Node.js environment configured', () => {
    expect(typeof process).toBe('object');
    expect(typeof process.env).toBe('object');
  });

  it('should support TypeScript', () => {
    const value: string = 'test';
    expect(value).toBe('test');
  });
});

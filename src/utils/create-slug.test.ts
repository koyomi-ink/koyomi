import { describe, expect, it } from 'vitest';

import { createSlug } from './create-slug';

describe('createSlug', () => {
  it('converts text to lowercase', () => {
    expect(createSlug('Swallow Studio')).toBe(
      'swallow-studio'
    );
  });

  it('replaces spaces with hyphens', () => {
    expect(createSlug('My Tattoo Studio')).toBe(
      'my-tattoo-studio'
    );
  });

  it('removes unsupported characters', () => {
    expect(createSlug('Sarah & Co!')).toBe(
      'sarah-co'
    );
  });

  it('does not create duplicate hyphens', () => {
    expect(createSlug('Sarah   Tattoo')).toBe(
      'sarah-tattoo'
    );
  });

  it('removes leading and trailing hyphens', () => {
    expect(createSlug('  Sarah Studio  ')).toBe(
      'sarah-studio'
    );
  });

  it('returns an empty string for empty input', () => {
    expect(createSlug('')).toBe('');
  });
});
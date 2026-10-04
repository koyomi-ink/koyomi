import { describe, expect, it } from 'vitest';

import { formatSlugInput } from './format-slug-input';

describe('formatSlugInput', () => {
  it('converts uppercase characters to lowercase', () => {
    expect(formatSlugInput('SwallowStudio')).toBe('swallowstudio');
  });

  it('converts spaces to hyphens', () => {
    expect(formatSlugInput('swallow studio')).toBe('swallow-studio');
  });

  it('removes unsupported characters', () => {
    expect(formatSlugInput('swallow!@studio')).toBe('swallowstudio');
  });

  it('collapses repeated hyphens', () => {
    expect(formatSlugInput('swallow---studio')).toBe('swallow-studio');
  });

  it('preserves a trailing hyphen while typing', () => {
    expect(formatSlugInput('swallow-')).toBe('swallow-');
  });

  it('allows numbers', () => {
    expect(formatSlugInput('studio 54')).toBe('studio-54');
  });
});

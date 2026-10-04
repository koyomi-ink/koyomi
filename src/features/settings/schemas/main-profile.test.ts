import { describe, expect, it } from 'vitest';

import { mainProfileSchema } from './main-profile';

describe('mainProfileSchema', () => {
  it('accepts a valid studio profile', () => {
    const result = mainProfileSchema.safeParse({
      name: 'Swallow Studio',
      slug: 'swallow-studio',
      bio: 'Tattoo artist in London',
    });

    expect(result.success).toBe(true);
  });

  it('trims values', () => {
    const result = mainProfileSchema.safeParse({
      name: '  Swallow Studio  ',
      slug: 'swallow-studio',
      bio: '  Tattoo artist  ',
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data.name).toBe('Swallow Studio');
    expect(result.data.bio).toBe('Tattoo artist');
  });

  it('rejects an empty studio name', () => {
    const result = mainProfileSchema.safeParse({
      name: '',
      slug: 'swallow-studio',
      bio: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a slug shorter than 3 characters', () => {
    const result = mainProfileSchema.safeParse({
      name: 'Swallow Studio',
      slug: 'ab',
      bio: '',
    });

    expect(result.success).toBe(false);
  });

  it('normalizes uppercase characters in the slug', () => {
    const result = mainProfileSchema.safeParse({
      name: 'Swallow Studio',
      slug: 'Swallow-Studio',
      bio: '',
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data.slug).toBe('swallow-studio');
  });

  it('rejects unsupported slug characters', () => {
    const result = mainProfileSchema.safeParse({
      name: 'Swallow Studio',
      slug: 'swallow_studio!',
      bio: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects descriptions longer than 50 characters', () => {
    const result = mainProfileSchema.safeParse({
      name: 'Swallow Studio',
      slug: 'swallow-studio',
      bio: 'a'.repeat(51),
    });

    expect(result.success).toBe(false);
  });
});

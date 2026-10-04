import 'server-only';

import { createHmac } from 'node:crypto';
import { headers } from 'next/headers';

import { supabaseAdminClient } from '@/libs/supabase/supabase-admin';
import { getEnvVar } from '@/utils/get-env-var';

function hashRateLimitKey(bucket: 'ip' | 'email', value: string) {
  const secret = getEnvVar(process.env.AUTH_RATE_LIMIT_SECRET, 'AUTH_RATE_LIMIT_SECRET');

  return createHmac('sha256', secret).update(`${bucket}:${value}`).digest('hex');
}

async function getClientIp() {
  const headerStore = await headers();

  const forwardedFor = headerStore.get('x-forwarded-for');

  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();

    if (firstIp) {
      return firstIp;
    }
  }

  return headerStore.get('x-real-ip')?.trim() || 'unknown';
}

async function consumeLimit({
  bucket,
  keyHash,
  limit,
  windowSeconds,
}: {
  bucket: 'ip' | 'email';
  keyHash: string;
  limit: number;
  windowSeconds: number;
}) {
  const { data, error } = await supabaseAdminClient.rpc('consume_auth_rate_limit', {
    p_bucket: bucket,
    p_key_hash: keyHash,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    throw new Error(`Auth rate-limit check failed: ${error.message}`);
  }

  return data === true;
}

export async function checkAuthEmailRateLimit(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const ip = await getClientIp();

  /*
   * IP:
   * 5 email-auth attempts per 10 minutes.
   */
  const ipAllowed = await consumeLimit({
    bucket: 'ip',
    keyHash: hashRateLimitKey('ip', ip),
    limit: 5,
    windowSeconds: 60 * 10,
  });

  /*
   * Email:
   * 3 attempts per 15 minutes.
   *
   * Consume this even if the IP limit has
   * already been reached. This prevents
   * address rotation from bypassing one side
   * of the limiter.
   */
  const emailAllowed = await consumeLimit({
    bucket: 'email',
    keyHash: hashRateLimitKey('email', normalizedEmail),
    limit: 3,
    windowSeconds: 60 * 15,
  });

  return ipAllowed && emailAllowed;
}

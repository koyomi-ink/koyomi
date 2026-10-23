import 'server-only';

import { createHmac } from 'node:crypto';
import { headers } from 'next/headers';

import { supabaseAdminClient } from '@/libs/supabase/supabase-admin';
import { getEnvVar } from '@/utils/get-env-var';

type RateLimitScope = 'auth' | 'contact' | 'waitlist';
type RateLimitBucket = 'ip' | 'email';

type RateLimitRule = {
  limit: number;
  windowSeconds: number;
};

type CheckRateLimitOptions = {
  scope: RateLimitScope;
  email: string;
  ipRule: RateLimitRule;
  emailRule: RateLimitRule;
};

function hashRateLimitKey(scope: RateLimitScope, bucket: RateLimitBucket, value: string) {
  const secret = getEnvVar(process.env.RATE_LIMIT_SECRET, 'RATE_LIMIT_SECRET');

  return createHmac('sha256', secret).update(`${scope}:${bucket}:${value}`).digest('hex');
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
  scope,
  bucket,
  keyHash,
  limit,
  windowSeconds,
}: {
  scope: RateLimitScope;
  bucket: RateLimitBucket;
  keyHash: string;
  limit: number;
  windowSeconds: number;
}) {
  const { data, error } = await supabaseAdminClient.rpc('consume_rate_limit', {
    p_scope: scope,
    p_bucket: bucket,
    p_key_hash: keyHash,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    throw new Error(`Rate-limit check failed: ${error.message}`);
  }

  return data === true;
}

export async function checkIpAndEmailRateLimit({ scope, email, ipRule, emailRule }: CheckRateLimitOptions) {
  const normalizedEmail = email.trim().toLowerCase();
  const ip = await getClientIp();

  /*
   * Always consume both buckets.
   *
   * The scope is included in the hash so:
   *
   * auth:ip      !== contact:ip
   * auth:email   !== contact:email
   */
  const [ipAllowed, emailAllowed] = await Promise.all([
    consumeLimit({
      scope,
      bucket: 'ip',
      keyHash: hashRateLimitKey(scope, 'ip', ip),
      limit: ipRule.limit,
      windowSeconds: ipRule.windowSeconds,
    }),

    consumeLimit({
      scope,
      bucket: 'email',
      keyHash: hashRateLimitKey(scope, 'email', normalizedEmail),
      limit: emailRule.limit,
      windowSeconds: emailRule.windowSeconds,
    }),
  ]);

  return ipAllowed && emailAllowed;
}

import 'server-only';

import { checkIpAndEmailRateLimit } from '@/libs/rate-limit/check-ip-and-email-rate-limit';

export async function checkContactRateLimit(email: string) {
  return checkIpAndEmailRateLimit({
    scope: 'contact',
    email,

    ipRule: {
      limit: 5,
      windowSeconds: 60 * 10,
    },

    emailRule: {
      limit: 3,
      windowSeconds: 60 * 30,
    },
  });
}

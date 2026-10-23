import 'server-only';

import { createHash } from 'node:crypto';

import { createResendClient } from '@/libs/resend/resend-client';
import { getEnvVar } from '@/utils/get-env-var';
import { getURL } from '@/utils/get-url';

const IDEMPOTENCY_WINDOW_MS = 15 * 60 * 1000;

export async function sendLoginHelpEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const resend = createResendClient();

  const from = getEnvVar(process.env.RESEND_FROM_EMAIL, 'RESEND_FROM_EMAIL');

  const signupUrl = getURL('/signup');

  const subject = 'Koyomi login';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #18181b;">
      <h1 style="font-size: 24px; margin-bottom: 24px;">
        Trying to sign in to Koyomi?
      </h1>

      <p style="line-height: 1.6;">
        We received a request to sign in to Koyomi,
        but this email address is not currently linked to an account
        that can sign in by email.
      </p>

      <p style="line-height: 1.6;">
        If you're a <strong>tattoo artist</strong> and don't have a Koyomi
        account yet, you can
        <a href="${signupUrl}">create an artist account and set up your studio</a>.
      </p>

      <p style="line-height: 1.6;">
        <strong>Looking to book a tattoo?</strong>
        You don't need to create an artist account.
        Book directly with your preferred artist.
      </p>

      <p style="margin-top: 32px; color: #71717a; font-size: 14px; line-height: 1.5;">
        If you didn't request this email, you can safely ignore it.
      </p>
    </div>
  `;

  /*
   * Never expose the raw email in an idempotency key.
   */
  const emailHash = createHash('sha256').update(normalizedEmail).digest('hex');

  /*
   * Changing the template creates a new key,
   * so updated email content can still be sent.
   */
  const templateHash = createHash('sha256').update(`${subject}\n${html}`).digest('hex').slice(0, 16);

  /*
   * Allow another legitimate help email after
   * the same 15-minute window used by our email limiter.
   */
  const timeBucket = Math.floor(Date.now() / IDEMPOTENCY_WINDOW_MS);

  const { error } = await resend.emails.send(
    {
      from,
      to: normalizedEmail,
      subject,
      html,
    },
    {
      idempotencyKey: `login-help/${emailHash}/${timeBucket}/${templateHash}`,
    },
  );

  if (error) {
    throw new Error(`Could not send login help email: ${error.message}`);
  }
}

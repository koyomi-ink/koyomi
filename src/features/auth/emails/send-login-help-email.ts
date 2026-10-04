import 'server-only';

import { createHash } from 'node:crypto';

import { createResendClient } from '@/libs/resend/resend-client';
import { getEnvVar } from '@/utils/get-env-var';
import { getURL } from '@/utils/get-url';

export async function sendLoginHelpEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const resend = createResendClient();

  const from = getEnvVar(process.env.RESEND_FROM_EMAIL, 'RESEND_FROM_EMAIL');

  const signupUrl = getURL('/signup');
  const loginUrl = getURL('/login');

  const subject = 'Koyomi login';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #18181b;">
      <h1 style="font-size: 24px; margin-bottom: 24px;">
        Trying to sign in to Koyomi?
      </h1>

      <p style="line-height: 1.6;">
        We received a request to sign in to Koyomi,
        but this email address is not linked to the login method selected.
      </p>

      <p style="line-height: 1.6;">
        If you normally sign in with Google, return to the
        <a href="${loginUrl}">login page</a> and choose
        <strong>Continue with Google</strong>.
      </p>

      <p style="line-height: 1.6;">
        If you're a <strong>tattoo artist</strong> and don't have a Koyomi
        account yet, you can create an artist account and set up your studio <a href="${signupUrl}">here</a>.
      </p>

      <p style="line-height: 1.6;">
        <strong>Looking to book a tattoo?</strong>
        You don't need to create an artist account. Book directly with you prefered artist.
      </p>

      <p style="margin-top: 32px; color: #71717a; font-size: 14px; line-height: 1.5;">
        If you didn't request this email, you can safely ignore it.
      </p>
    </div>
  `;

  /*
   * Do not put the raw email address in the
   * idempotency key.
   */
  const emailHash = createHash('sha256').update(normalizedEmail).digest('hex');

  /*
   * Changing the email template creates a new
   * idempotency key, avoiding Resend's 409 when
   * the request body changes.
   */
  const templateHash = createHash('sha256').update(`${subject}\n${html}`).digest('hex').slice(0, 16);

  const date = new Date().toISOString().slice(0, 10);

  const { error } = await resend.emails.send(
    {
      from,
      to: normalizedEmail,
      subject,
      html,
    },
    {
      idempotencyKey: `login-help/${emailHash}/${date}/${templateHash}`,
    },
  );

  if (error) {
    throw new Error(`Could not send login help email: ${error.message}`);
  }
}

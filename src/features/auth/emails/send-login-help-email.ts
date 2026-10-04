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

  /*
   * Do not put the raw email address in the
   * idempotency key.
   */
  const emailHash = createHash('sha256').update(normalizedEmail).digest('hex');

  const date = new Date().toISOString().slice(0, 10);

  const { error } = await resend.emails.send(
    {
      from,
      to: normalizedEmail,
      subject: 'Trying to sign in to Koyomi?',
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #18181b;">
            <h1 style="font-size: 24px; margin-bottom: 24px;">
              Trying to sign in to Koyomi?
            </h1>

            <p style="line-height: 1.6;">
              We received a request to sign in to Koyomi with this email address,
              but we couldn't send an email sign-in link.
            </p>

            <p style="line-height: 1.6;">
              If you normally sign in with Google, return to Koyomi and choose
              <strong>Continue with Google</strong>.
            </p>

            <p style="line-height: 1.6;">
              If you're a <strong>tattoo artist</strong> and don't have a Koyomi
              account yet, you can create an artist account and set up your studio.
            </p>

            <div style="margin: 32px 0;">
              <a
                href="${signupUrl}"
                style="
                  display: inline-block;
                  padding: 12px 18px;
                  background: #18181b;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: 600;
                "
              >
                Create an artist account
              </a>
            </div>

            <p style="line-height: 1.6;">
              <strong>Looking to book a tattoo?</strong>
              You don't need to create an artist account. Your client access
              will be provided through your tattoo artist's booking flow.
            </p>

            <p style="line-height: 1.6;">
              You can also return to the
              <a href="${loginUrl}">Koyomi sign-in page</a>.
            </p>

            <p style="margin-top: 32px; color: #71717a; font-size: 14px; line-height: 1.5;">
              If you didn't request this email, you can safely ignore it.
            </p>
          </div>
        `,
    },
    {
      /*
       * Resend retains idempotency keys for
       * 24 hours, so repeated requests for the
       * same address won't repeatedly send this
       * informational email.
       */
      idempotencyKey: `login-help/${emailHash}/${date}`,
    },
  );

  if (error) {
    throw new Error(`Could not send login help email: ${error.message}`);
  }
}

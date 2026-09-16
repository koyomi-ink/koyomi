import { signInWithEmail, signInWithOAuth } from '../../../features/auth/actions/auth-actions';
import { AuthUI } from '../../../features/auth/components/auth-ui';

export default async function SignUp() {
  return (
    <section className='py-xl m-auto flex h-full max-w-lg items-center'>
      <AuthUI mode='signup' signInWithOAuth={signInWithOAuth} signInWithEmail={signInWithEmail} />
    </section>
  );
}

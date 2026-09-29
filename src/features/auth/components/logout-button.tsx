import { logout } from '@/features/auth/actions/auth-actions';

export function LogoutButton() {
  return (
    <form action={logout}>
      <button type='submit'>
        Log out
      </button>
    </form>
  );
}
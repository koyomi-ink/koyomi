import { logout } from '@/features/auth/actions/auth-actions';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type='submit'>Log out</Button>
    </form>
  );
}

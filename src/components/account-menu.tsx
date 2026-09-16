'use client';

import { useRouter } from 'next/navigation';

import { ActionResponse } from '@/types/action-response';

import { Button } from './ui/button';

// export function AccountMenu({ signOut }: { signOut: () => Promise<ActionResponse> }) {
//   const router = useRouter();

//   async function handleLogoutClick() {
//     const response = await signOut();

//     if (response?.error) {
//       // TODO - add toast 'An error occurred while logging out. Please try again or contact support.'
//       console.log('failed')
//     } else {
//       router.refresh();
      
//       // TODO - add toast 'you have been logged out'
//     }
//   }

  return (
    <>
      <h1>ACCOUNT MENU</h1>
      {/* <Button onClick={handleLogoutClick}>Log out</Button> */}
    </>
  );
}

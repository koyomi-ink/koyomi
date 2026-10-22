import Image from 'next/image';
import Link from 'next/link';

import logo from '@/imgs/branding/logo/extended-red.png';

export function Logo() {
  return (
    <Link href='/' className='flex w-fit items-center gap-2'>
      <Image src={logo} width={40} height={40} alt='Koyomi logo mark' />
      <span className='font-alt text-xl text-white'>Koyomi</span>
    </Link>
  );
}

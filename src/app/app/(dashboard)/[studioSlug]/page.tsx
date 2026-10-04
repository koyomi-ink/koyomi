import { AppPanelTest } from '@/components/app-panel/app-panel-test';

export default function StudioPage() {
  return (
    <div className='space-y-1'>
      <h1 className='text-2xl font-semibold tracking-tight'>Home</h1>

      <p className='text-muted-foreground text-sm'>Bookings & insights</p>

      <AppPanelTest />
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';

type UnsavedChangesBarProps = {
  visible: boolean;
  saving?: boolean;
  onSave: () => void;
  onCancel: () => void;
};

export function UnsavedChangesBar({ visible, saving = false, onSave, onCancel }: UnsavedChangesBarProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      role='region'
      aria-label='Unsaved changes'
      className='bg-background flex flex-wrap items-center gap-3 rounded-xl border p-3 shadow-sm'
    >
      <span className='min-w-0 flex-1 text-sm font-semibold'>Changes were made</span>

      <div className='flex items-center gap-2'>
        <Button size='sm' onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>

        <Button size='sm' variant='outline' onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

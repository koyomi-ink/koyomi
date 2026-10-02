'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UnsavedChangesBar } from '@/components/unsaved-changes';

import { updateMainProfile } from '@/features/settings/actions/update-main-profile';
import { mainProfileSchema } from '@/features/settings/schemas/main-profile';

import { useAppPanel } from '@/components/app-panel/app-panel-provider';
import { formatSlugInput } from '@/utils/format-slug-input';

type StudioProfile = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
};

type MainProfileFormProps = {
  studio: StudioProfile;
};

export function MainProfileForm({
  studio,
}: MainProfileFormProps) {
  const router = useRouter();

  const [saved, setSaved] = useState(studio);

  const [name, setName] = useState(studio.name);
  const [slug, setSlug] = useState(studio.slug);
  const [bio, setBio] = useState(studio.bio ?? '');

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    setPanelDirty,
    setPanelSaving,
    registerDiscardHandler,
  } = useAppPanel();

  const hasChanges =
    name !== saved.name ||
    slug !== saved.slug ||
    bio !== (saved.bio ?? '');

  useEffect(() => {
    setPanelDirty(hasChanges);

    return () => {
      setPanelDirty(false);
    };
  }, [hasChanges, setPanelDirty]);

  useEffect(() => {
    setPanelSaving(isPending);

    return () => {
      setPanelSaving(false);
    };
  }, [isPending, setPanelSaving]);

  const resetForm = useCallback(() => {
    setName(saved.name);
    setSlug(saved.slug);
    setBio(saved.bio ?? '');
    setError(null);
  }, [saved]);

  useEffect(() => {
    registerDiscardHandler(resetForm);

    return () => {
      registerDiscardHandler(null);
    };
  }, [registerDiscardHandler, resetForm]);

  function handleSave() {
    setError(null);

    const parsed = mainProfileSchema.safeParse({
      name,
      slug,
      bio,
    });

    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ??
          'Please check your information.'
      );
      return;
    }

    startTransition(async () => {
      const result = await updateMainProfile(
        saved.id,
        parsed.data
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      const previousSlug = saved.slug;

      const updatedStudio: StudioProfile = {
        ...saved,
        name: parsed.data.name,
        slug: parsed.data.slug,
        bio: parsed.data.bio || null,
      };

      setSaved(updatedStudio);
      setName(updatedStudio.name);
      setSlug(updatedStudio.slug);
      setBio(updatedStudio.bio ?? '');

      if (updatedStudio.slug !== previousSlug) {
        setPanelDirty(false);
        setPanelSaving(false);

        window.location.replace(
          `/app/${updatedStudio.slug}/settings`
        );
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className='flex min-h-full flex-col gap-6'>
      <div className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='studio-name'>
            Studio name
          </Label>

          <Input
            id='studio-name'
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            maxLength={100}
            disabled={isPending}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='studio-slug'>
            Booking link
          </Label>

          <div className='flex items-center gap-2'>
            <span className='shrink-0 text-sm text-muted-foreground'>
              koyomi.ink/
            </span>

          <Input
            id='studio-slug'
            value={slug}
            onChange={(event) =>
              setSlug(
                formatSlugInput(event.target.value)
              )
            }
            maxLength={50}
            disabled={isPending}
          />
          </div>

          <p className='text-xs text-muted-foreground'>
            Changing this will change your public booking URL.
          </p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='studio-bio'>
            Description
          </Label>

          <Textarea
            id='studio-bio'
            value={bio}
            onChange={(event) =>
              setBio(event.target.value)
            }
            maxLength={50}
            rows={5}
            disabled={isPending}
          />

          <p className='text-right text-xs text-muted-foreground'>
            {bio.length}/50
          </p>
        </div>

        {error && (
          <p
            role='alert'
            className='text-sm text-destructive'
          >
            {error}
          </p>
        )}
      </div>

      {hasChanges && (
        <div className='sticky bottom-0 z-10 mt-auto bg-background pt-3'>
          <UnsavedChangesBar
            visible={hasChanges}
            saving={isPending}
            onSave={handleSave}
            onCancel={resetForm}
          />
        </div>
      )}
    </div>
  );
}
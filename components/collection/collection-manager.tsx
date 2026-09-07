'use client';
/* oxlint-disable next/no-img-element -- thumbnails may use temporary object URLs */

import { useRef, useState } from 'react';
import { Check, LogOut, Trash2, Upload } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { hex } from '@/lib/color';
import { signIn, type Config, type Photo } from '@/lib/collection';

type CollectionManagerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: Config;
  connected: boolean;
  photos: Photo[];
  token: string;
  onTokenChange: (token: string) => void;
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
  message: string;
  onMessageChange: (message: string) => void;
  onAddFiles: (files: FileList | null) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
};

export function CollectionManager({
  open,
  onOpenChange,
  config,
  connected,
  photos,
  token,
  onTokenChange,
  busy,
  onBusyChange,
  message,
  onMessageChange,
  onAddFiles,
  onRemove,
}: CollectionManagerProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const handleSignIn = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    onBusyChange(true);

    try {
      const session = await signIn(config, email, password);
      onTokenChange(session.access_token);
      setPassword('');
      onMessageChange('Signed in.');
    } catch (error) {
      onMessageChange((error as Error).message);
    } finally {
      onBusyChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="collection-dialog">
        <DialogTitle>Make room for more.</DialogTitle>
        <DialogDescription>
          {connected
            ? 'Add images to your collection. Each one becomes a color.'
            : 'All 132 Are.na images are included. New uploads remain temporary until Supabase is connected.'}
        </DialogDescription>

        {!connected && (
          <div className="connection-note">
            <span className="status-dot" />
            Are.na connected · Supabase pending
          </div>
        )}

        {connected && !token ? (
          <form className="login-form" onSubmit={handleSignIn}>
            <label>
              Email
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <button className="dark-button" disabled={busy}>
              Sign in to manage
            </button>
          </form>
        ) : (
          <>
            <input
              ref={fileInput}
              className="sr-only"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(event) => {
                const input = event.currentTarget;
                void onAddFiles(input.files).finally(() => {
                  input.value = '';
                });
              }}
            />
            <button
              disabled={busy}
              className="upload-area"
              onClick={() => fileInput.current?.click()}
            >
              <Upload size={22} />
              <span>
                {busy
                  ? 'Working…'
                  : connected
                    ? 'Add photographs'
                    : 'Try more images'}
              </span>
              <small>JPEG, PNG, WebP, AVIF · up to 15 MB each</small>
            </button>
            <button className="glass-button import-button" disabled>
              <Check size={13} /> Are.na share · 132 imported
            </button>
          </>
        )}

        <output className="manager-message">{message}</output>

        {photos.length > 0 && (
          <div className="manage-list">
            {photos.map((photo) => (
              <div className="manage-row" key={photo.id}>
                <img src={photo.url} alt="" />
                <div>
                  <span>{photo.title}</span>
                  <small>
                    {hex(photo.rgb)}
                    {photo.bundled
                      ? ' · Are.na'
                      : photo.temporary
                        ? ' · preview'
                        : ''}
                  </small>
                </div>
                {(!connected || token) && (
                  <button
                    aria-label={`Remove ${photo.title}`}
                    disabled={busy}
                    onClick={() => setPendingDelete(photo.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {token && (
          <button
            className="signout"
            onClick={() => {
              onTokenChange('');
              onMessageChange('Signed out.');
            }}
          >
            <LogOut size={12} /> Sign out
          </button>
        )}

        <p className="manager-footnote">
          {connected
            ? 'Only your configured editor account can make changes.'
            : 'Cloud setup is prepared in the project. Connect Supabase to keep your collection across devices.'}
        </p>

        <AlertDialog
          open={Boolean(pendingDelete)}
          onOpenChange={(isOpen) => {
            if (!isOpen && !busy) setPendingDelete(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogTitle>Remove this image?</AlertDialogTitle>
            <AlertDialogDescription>
              The image will leave this collection. Its original source file is
              kept.
            </AlertDialogDescription>
            <div className="flex justify-end gap-3">
              <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={busy}
                onClick={async () => {
                  if (!pendingDelete) return;
                  await onRemove(pendingDelete);
                  setPendingDelete(null);
                }}
              >
                Remove
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}

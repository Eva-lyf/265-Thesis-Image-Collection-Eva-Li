'use client';

import type { ReactNode } from 'react';
import styles from './info-popover.module.css';

type InfoPopoverProps = {
  label: string;
  children: ReactNode;
};

export default function InfoPopover({ label, children }: InfoPopoverProps) {
  return (
    <details
      className={styles.infoPopover}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') event.currentTarget.open = true;
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'touch') event.currentTarget.open = false;
      }}
    >
      <summary
        aria-label={label}
        onClick={(event) => {
          if (event.detail > 0 && window.matchMedia('(hover: hover)').matches) {
            event.preventDefault();
            (event.currentTarget.parentElement as HTMLDetailsElement).open =
              true;
          }
        }}
      >
        ?
      </summary>
      <div className={styles.infoPanel}>{children}</div>
    </details>
  );
}

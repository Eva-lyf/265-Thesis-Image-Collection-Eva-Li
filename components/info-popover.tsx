import type { ReactNode } from 'react';
import styles from './info-popover.module.css';

type InfoPopoverProps = {
  label: string;
  children: ReactNode;
};

export default function InfoPopover({ label, children }: InfoPopoverProps) {
  return (
    <details className={styles.infoPopover}>
      <summary aria-label={label}>?</summary>
      <div className={styles.infoPanel}>{children}</div>
    </details>
  );
}

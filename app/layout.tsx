import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '265ThesisBrainstormCollectionEvaLI',
  description:
    'A meal collection by Eva Li. Explore photographs through their nutrients.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

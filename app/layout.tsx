import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: '265ThesisBrainstormCollectionEvaLI', description: 'An image collection by Eva Li. Explore photographs through their colors.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }

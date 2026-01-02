import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Headache Tracker',
  description: 'Track and manage your headaches effectively',
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

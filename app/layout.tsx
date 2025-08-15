import './globals.css';
import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';

const ibmPlexSans = IBM_Plex_Sans({
  display: 'swap',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Coffee Afictionado',
  description: 'Discover your local coffee shops',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${ibmPlexSans.className} flex flex-col min-h-screen`}>
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-violet-900 py-6 text-lg text-white mt-8">
          <div className="text-center">By Michael R Smith - SmithDev Labs</div>
        </footer>
      </body>
    </html>
  );
}
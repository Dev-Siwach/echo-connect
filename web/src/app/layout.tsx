import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'EcoConnect — Local Environmental Action Assistant',
  description:
    'Tell us what you have in plain words. We help you find the right local route: repair, reuse, donate, e-waste, or recycle.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 antialiased selection:bg-brand-200">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-200">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg sm:text-xl text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded-md"
            >
              <span className="text-2xl" aria-hidden="true">🌱</span>
              <span>EcoConnect</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-zinc-600">
              <Link
                href="/browse"
                className="hover:text-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded px-1"
              >
                Browse
              </Link>
              <Link
                href="/about"
                className="hover:text-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded px-1"
              >
                About
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-8">
          {children}
        </main>

        <footer className="mt-auto border-t border-zinc-200 bg-white text-zinc-500 text-xs py-6">
          <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="font-medium text-zinc-700">EcoConnect Faridabad</p>
              <p>AWS Environmental Hacks 2026 · Built with Amazon Bedrock</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/about#disclaimer"
                className="hover:text-zinc-900 underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded"
              >
                Data disclaimer & methodology
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

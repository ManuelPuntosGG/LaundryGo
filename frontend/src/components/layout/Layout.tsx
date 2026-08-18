import { type ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-ambient-glow text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex flex-col justify-start">
        {children}
      </main>
      <Footer />
    </div>
  );
}

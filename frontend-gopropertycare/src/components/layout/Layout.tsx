import { type ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-emerald-600 selection:text-white relative">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-10 sm:pb-12 flex flex-col justify-start relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}

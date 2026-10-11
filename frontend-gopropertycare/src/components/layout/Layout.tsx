import { type ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { DustParticlesBackground } from '@/components/ui/DustParticlesBackground';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-ambient-glow text-slate-900 flex flex-col selection:bg-emerald-600 selection:text-white relative">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex flex-col justify-start">
        {children}
      </main>
      <Footer />
      <DustParticlesBackground />
    </div>
  );
}

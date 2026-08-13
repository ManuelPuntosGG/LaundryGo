import { type ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-primary-500 to-indigo-700 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-14 sm:pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}

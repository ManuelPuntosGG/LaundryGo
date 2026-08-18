import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  children,
  maxWidth = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    // Lock body scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Handle Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-3xl shadow-2xl border border-slate-200 w-full p-6 sm:p-8 my-auto max-h-[90vh] overflow-y-auto ${maxWidthStyles[maxWidth]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthContext, useAuthContext } from './auth-context';

// oxlint-disable-next-line react/only-export-components
export { useAuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

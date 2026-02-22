import React, { useEffect, useState } from 'react';
import { api, getLoginUrl } from '../api/client';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.me()
      .then(() => setReady(true))
      .catch(() => {
        window.location.href = getLoginUrl();
      });
  }, []);

  if (!ready) return <div style={{ padding: 40 }}>Loading...</div>;
  return <>{children}</>;
}
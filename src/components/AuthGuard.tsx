import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.me()
      .then(() => setReady(true))
      .catch(() => navigate('/login', { replace: true }));
  }, []);

  if (!ready) return <div style={{ padding: 40 }}>Loading...</div>;
  return <>{children}</>;
}
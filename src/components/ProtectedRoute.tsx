import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';

interface Props {
  children: React.ReactNode;
  requiredType: 'admin' | 'client';
}

export default function ProtectedRoute({ children, requiredType }: Props) {
  const { auth } = useStore();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    const loginPath = requiredType === 'admin' ? '/admin/login' : '/';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (auth.userType !== requiredType && !auth.impersonating) {
    const loginPath = requiredType === 'admin' ? '/admin/login' : '/';
    return <Navigate to={loginPath} replace />;
  }

  return <>{children}</>;
}

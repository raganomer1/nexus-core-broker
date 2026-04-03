import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { ADMIN_ROUTE_PERMISSIONS } from '@/lib/rbac';

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

/** Wraps an admin page — checks that the employee has at least one of the required permissions */
export function AdminPageGuard({ children, routeKey }: { children: React.ReactNode; routeKey: keyof typeof ADMIN_ROUTE_PERMISSIONS }) {
  const { hasAnyPermission, getFirstAccessibleAdminPath } = useStore();
  const requiredPerms = ADMIN_ROUTE_PERMISSIONS[routeKey];
  if (!requiredPerms || hasAnyPermission(requiredPerms)) {
    return <>{children}</>;
  }
  return <Navigate to={getFirstAccessibleAdminPath()} replace />;
}

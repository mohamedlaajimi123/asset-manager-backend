// src/components/auth/Guards.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface DecodedToken {
  userId: string;
  role: string;
  exp: number;
}

function decodeJwt<T>(token: string): T | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join(''),
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

// 1. Universal Guard: Requires any logged-in user
export const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// 2. Role Guard: Requires a specific role (e.g., 'admin')
interface RoleGuardProps {
  allowedRoles: string[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const decoded = decodeJwt<DecodedToken>(token);
  const normalizedAllowedRoles = allowedRoles.map((role) => role.toUpperCase());

  if (!decoded?.role) {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = decoded.role.toUpperCase();

  if (!normalizedAllowedRoles.includes(normalizedRole)) {
    return <Navigate to="/assets/all" replace />;
  }

  return <Outlet />;
};

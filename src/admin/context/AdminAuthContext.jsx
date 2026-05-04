/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import adminApi from '../services/adminApi';
import {
  clearAdminSession,
  getAdminUser,
  isAdminAuthenticated,
  setAdminToken,
  setAdminUser,
} from '../store/adminAuth';

const AdminAuthContext = createContext(null);

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function normalizeRole(role) {
  return String(role ?? 'ADMIN').replace(/^ROLE_/, '').toUpperCase();
}

function buildAdminProfile(profile, fallback = {}) {
  const rawName = profile?.name ?? fallback.name ?? fallback.email ?? 'Administrator';
  const name = rawName.trim() || 'Administrator';
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'AD';

  return {
    ...fallback,
    ...profile,
    adminId: profile?.adminId ?? fallback.adminId ?? null,
    name,
    displayName: name,
    initials,
    email: profile?.email ?? fallback.email ?? '',
    role: normalizeRole(profile?.role ?? fallback.role),
    active: Boolean(profile?.active ?? fallback.active ?? true),
  };
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(getAdminUser);
  const [authenticated, setAuthenticated] = useState(isAdminAuthenticated);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      return undefined;
    }

    let ignore = false;

    const restoreProfile = async () => {
      try {
        const response = await adminApi.get('/admin/me');
        const user = buildAdminProfile(response.data, getAdminUser());

        if (ignore) {
          return;
        }

        setAdminUser(user);
        setAdmin(user);
        setAuthenticated(true);
      } catch {
        if (ignore) {
          return;
        }

        clearAdminSession();
        setAdmin(null);
        setAuthenticated(false);
      }
    };

    restoreProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const login = async (email, password) => {
    const response = await adminApi.post('/login/admin', { email, password });
    const token = response.data;
    const claims = decodeJwtPayload(token);
    const role = claims?.role ?? 'ROLE_ADMIN';
    const sub = claims?.sub ?? '';
    const adminId = sub.includes(':') ? Number(sub.split(':')[1]) : null;

    if (!String(role).toUpperCase().includes('ADMIN')) {
      throw new Error('This account does not have admin access.');
    }

    const fallbackUser = buildAdminProfile({ email, adminId, role });

    setAdminToken(token);

    let user;
    try {
      const profileResponse = await adminApi.get('/admin/me');
      user = buildAdminProfile(profileResponse.data, fallbackUser);
    } catch (error) {
      clearAdminSession();
      throw error;
    }

    setAdminUser(user);
    setAdmin(user);
    setAuthenticated(true);
    return user;
  };

  const logout = () => {
    clearAdminSession();
    setAdmin(null);
    setAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, authenticated, login, logout, setAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  }
  return context;
}

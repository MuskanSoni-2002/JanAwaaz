import { useEffect, useState, createContext, useContext } from 'react';
import {
  getOfficerUser,
  isOfficerAuthenticated,
  clearOfficerSession,
  setOfficerToken,
  setOfficerUser,
} from '../store/officerAuth';
import officerApi from '../services/officerApi';

const OfficerAuthContext = createContext(null);

/**
 * Decode the JWT payload (no verification — that's the backend's job).
 * Returns the parsed claims object or null on failure.
 */
function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function normalizeRole(role) {
  return String(role ?? 'OFFICER').replace(/^ROLE_/, '').toUpperCase();
}

function buildOfficerProfile(profile, fallback = {}) {
  const rawName = profile?.name ?? fallback.name ?? fallback.email ?? 'Officer';
  const name = rawName.trim() || 'Officer';
  const nameParts = name.split(/\s+/).filter(Boolean);
  const initials = nameParts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'OF';

  return {
    ...fallback,
    ...profile,
    officerId: profile?.officerId ?? fallback.officerId ?? null,
    name,
    displayName: name,
    initials,
    email: profile?.email ?? fallback.email ?? '',
    role: normalizeRole(profile?.role ?? fallback.role),
    departmentId: profile?.departmentId ?? fallback.departmentId ?? null,
    departmentName: profile?.departmentName ?? fallback.departmentName ?? '',
    forcePasswordChange: Boolean(profile?.forcePasswordChange ?? fallback.forcePasswordChange),
  };
}

export function OfficerAuthProvider({ children }) {
  const [officer, setOfficer] = useState(getOfficerUser);
  const [authenticated, setAuthenticated] = useState(isOfficerAuthenticated);

  useEffect(() => {
    if (!isOfficerAuthenticated()) {
      return undefined;
    }

    let ignore = false;

    const restoreOfficerProfile = async () => {
      try {
        const response = await officerApi.get('/officers/me');
        const user = buildOfficerProfile(response.data, getOfficerUser());

        if (ignore) {
          return;
        }

        setOfficerUser(user);
        setOfficer(user);
        setAuthenticated(true);
      } catch {
        if (ignore) {
          return;
        }

        clearOfficerSession();
        setOfficer(null);
        setAuthenticated(false);
      }
    };

    restoreOfficerProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const login = async (email, password) => {
    // Backend returns a raw JWT string (not a JSON object)
    const response = await officerApi.post('/login/officer', { email, password });
    const token = response.data; // plain string

    // Decode JWT claims to get role and officer ID
    const claims = decodeJwtPayload(token);
    const role = claims?.role ?? 'ROLE_OFFICER';

    // sub is "OFFICER:123" — extract the numeric ID
    const sub = claims?.sub ?? '';
    const officerId = sub.includes(':') ? sub.split(':')[1] : null;

    // Reject non-officer tokens
    if (!role.toUpperCase().includes('OFFICER')) {
      throw new Error('This account does not have officer access.');
    }

    const fallbackUser = buildOfficerProfile({
      email,
      officerId: officerId ? Number(officerId) : null,
      role,
    });

    setOfficerToken(token);
    let user;

    try {
      const profileResponse = await officerApi.get('/officers/me');
      user = buildOfficerProfile(profileResponse.data, fallbackUser);
    } catch (error) {
      clearOfficerSession();
      throw error;
    }

    setOfficerUser(user);
    setOfficer(user);
    setAuthenticated(true);
    return user;
  };

  const logout = () => {
    clearOfficerSession();
    setOfficer(null);
    setAuthenticated(false);
  };

  return (
    <OfficerAuthContext.Provider value={{ officer, authenticated, login, logout, setOfficer }}>
      {children}
    </OfficerAuthContext.Provider>
  );
}

export function useOfficerAuth() {
  const ctx = useContext(OfficerAuthContext);
  if (!ctx) throw new Error('useOfficerAuth must be used inside OfficerAuthProvider');
  return ctx;
}


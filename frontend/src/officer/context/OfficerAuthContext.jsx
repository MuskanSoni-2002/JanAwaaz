import { useState, createContext, useContext } from 'react';
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

export function OfficerAuthProvider({ children }) {
  const [officer, setOfficer] = useState(getOfficerUser);
  const [authenticated, setAuthenticated] = useState(isOfficerAuthenticated);

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

    const user = {
      email,
      role,
      officerId: officerId ? Number(officerId) : null,
      // firstName / lastName will be filled if the backend ever exposes them
      // For now derive initials from the email local part
      firstName: email.split('@')[0].split('.')[0] ?? '',
      lastName: email.split('@')[0].split('.')[1] ?? '',
    };

    setOfficerToken(token);
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


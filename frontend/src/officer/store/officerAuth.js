// Officer-specific auth store (completely separate from citizen store)
const OFFICER_TOKEN_KEY = 'officer_token';
const OFFICER_USER_KEY = 'officer_user';

export function getOfficerToken() {
  return localStorage.getItem(OFFICER_TOKEN_KEY);
}

export function setOfficerToken(token) {
  localStorage.setItem(OFFICER_TOKEN_KEY, token);
}

export function getOfficerUser() {
  try {
    const raw = localStorage.getItem(OFFICER_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setOfficerUser(user) {
  localStorage.setItem(OFFICER_USER_KEY, JSON.stringify(user));
}

export function clearOfficerSession() {
  localStorage.removeItem(OFFICER_TOKEN_KEY);
  localStorage.removeItem(OFFICER_USER_KEY);
}

export function isOfficerAuthenticated() {
  return !!getOfficerToken();
}

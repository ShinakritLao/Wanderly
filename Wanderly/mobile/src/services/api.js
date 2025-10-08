import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.122:8000';

async function handleResponse(res) {
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    if (!res.ok) throw new Error(data.message || `${res.status} ${res.statusText}`);
    return data;
  } catch {
    if (!res.ok) throw new Error(`${res.status} ${text}`);
    return text;
  }
}

export async function signInWithGoogle(idToken) {
  const res = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });
  return handleResponse(res);
}

export async function signUpWithEmail(email, password, name) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  return handleResponse(res);
}

export async function signInWithEmail(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function fetchDashboard(jwt) {
  const res = await fetch(`${API_URL}/dashboard`, {
    method: "GET",
    headers: { Authorization: `Bearer ${jwt}` },
  });
  return handleResponse(res);
}

export async function logout(jwt) {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
  });
  return handleResponse(res);
}

export const resetPassword = async (email, newPassword) => {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword }),
  });
  return handleResponse(res);
};

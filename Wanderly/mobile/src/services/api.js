const API_URL = process.env.EXPO_PUBLIC_API_URL;

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

// --- Auth existing functions ---
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

// --- Forgot Password Flow ---
export async function requestOtp(email) {
  const res = await fetch(`${API_URL}/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
}

export async function verifyOtpAndResetPassword(email, otp, newPassword) {
  const res = await fetch(`${API_URL}/auth/verify-otp-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword }),
  });
  return handleResponse(res);
}
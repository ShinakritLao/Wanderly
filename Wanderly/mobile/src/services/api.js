const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ----------------------------
// HANDLE RESPONSE
// ----------------------------
async function handleResponse(res) {
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    if (!res.ok)
      throw new Error(data.message || data.detail || `${res.status} ${res.statusText}`);
    return data;
  } catch {
    if (!res.ok) throw new Error(`${res.status} ${text}`);
    return text;
  }
}

// ----------------------------
// AUTH FUNCTIONS
// ----------------------------

// Google Sign-In
export async function signInWithGoogle(idToken) {
  const res = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });
  return handleResponse(res);
}

// Email Sign-Up with OTP
export async function sendOtpForSignUp(email) {
  const res = await fetch(`${API_URL}/auth/send-otp-signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
}

export async function verifyOtpSignUp({ email, otp, password, name }) {
  const res = await fetch(`${API_URL}/auth/verify-otp-signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, password, name }),
  });
  return handleResponse(res);
}

// Email Sign-In
export async function signInWithEmail({ email, password }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

// Protected dashboard route
export async function fetchDashboard(jwt) {
  const res = await fetch(`${API_URL}/dashboard`, {
    method: "GET",
    headers: { Authorization: `Bearer ${jwt}` },
  });
  return handleResponse(res);
}

// ----------------------------
// OTP / PASSWORD RESET
// ----------------------------

// Request OTP
export async function requestOtp(email) {
  const res = await fetch(`${API_URL}/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
}

// Verify OTP + Reset Password
export async function verifyOtpAndResetPassword({ email, otp, newPassword }) {
  const res = await fetch(`${API_URL}/auth/verify-otp-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword }),
  });
  return handleResponse(res);
}

// ----------------------------
// SLIDER CAPTCHA
// ----------------------------

export async function getSliderCaptcha() {
  const res = await fetch(`${API_URL}/captcha/slider/generate`);
  return handleResponse(res);
}

export async function verifySliderCaptcha({ token, position, tolerance = 5 }) {
  const res = await fetch(`${API_URL}/captcha/slider/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, position, tolerance }),
  });
  return handleResponse(res);
}

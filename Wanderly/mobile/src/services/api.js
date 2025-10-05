const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.122:8000"; 

// Check response error and convert to JSON.
async function handleResponse(res) {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Request failed: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
* Sign in with Google OAuth 
* Backend: /auth/google
*/
export async function signInWithGoogle(idToken) {
  const res = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });
  return handleResponse(res); // -> { jwt, user }
}

/**
* Sign up with Email & Password
* Backend: /auth/signup
*/
export async function signUpWithEmail(email, password, name) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  return handleResponse(res);
}

/**
* Sign in with Email & Password
* Backend: /auth/login
*/
export async function signInWithEmail(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

/**
* Fetch user dashboard (protected)
* Backend: /dashboard
*/
export async function fetchDashboard(jwt) {
  const res = await fetch(`${API_URL}/dashboard`, {
    method: "GET",
    headers: { Authorization: `Bearer ${jwt}` },
  });
  return handleResponse(res); // -> { user }
}

/**
* Logout user (optional)
* Backend: /auth/logout (ถ้ามี)
*/
export async function logout(jwt) {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
  });
  return handleResponse(res);
}

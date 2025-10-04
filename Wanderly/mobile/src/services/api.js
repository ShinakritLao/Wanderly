const API_URL = "http://192.168.1.122:8000"; // Backend server URL (local network)
// const API_URL = "http://localhost:8000"; // Alternative: localhost

// Send Google ID token to backend to get JWT
export async function signInWithGoogle(idToken) {
  const res = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }), // Send id_token in request body
  });
  if (!res.ok) throw new Error("Login failed"); // Throw error if backend rejects
  return res.json(); // Response: { jwt: "...", user: {...} }
}

// Fetch user dashboard data using JWT
export async function fetchDashboard(jwt) {
  const res = await fetch(`${API_URL}/dashboard`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${jwt}` }, // Send JWT in Authorization header
  });
  if (!res.ok) throw new Error("Unauthorized"); // Throw error if JWT invalid
  return res.json(); // Response: { user: {...} }
}

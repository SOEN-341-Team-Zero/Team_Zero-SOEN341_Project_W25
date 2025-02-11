const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function login(username: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/login/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid login credentials");
  }

  return response.json();
}

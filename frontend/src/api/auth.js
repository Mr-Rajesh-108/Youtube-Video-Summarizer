import { apiRequest, saveTokens, clearTokens } from "./client";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * Register a new user.
 * Returns a success message — login is NOT automatic (email verification required).
 */
export async function signup({ name, email, password }) {
  const response = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Signup failed");
  return data;
}

/**
 * Login with email + password.
 * Saves access/refresh tokens and user info to localStorage.
 */
export async function login({ email, password }) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");

  saveTokens(data.accessToken, data.refreshToken);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

/**
 * Logout the current user - clears refresh token on server and local storage.
 */
export async function logout() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } finally {
    clearTokens();
  }
}

/**
 * Verify email using the token from the verification link.
 */
export async function verifyEmail(token) {
  const response = await fetch(`${BASE_URL}/auth/verify-email?token=${token}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Verification failed");
  return data;
}

/**
 * Update the authenticated user's profile (name / password).
 */
export async function updateProfile({ name, password }) {
  return apiRequest("/auth/update", {
    method: "PUT",
    body: { name, password },
  });
}

/**
 * Permanently delete the authenticated user's account.
 */
export async function deleteAccount() {
  return apiRequest("/auth/delete", { method: "DELETE" });
}

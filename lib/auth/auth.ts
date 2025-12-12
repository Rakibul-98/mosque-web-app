// lib/auth.ts

import { supabase } from "../../supabase";
import { User } from "../types";

export async function loginWithPin(
  pin: string,
  role: "admin" | "cashier"
): Promise<User | null> {
  try {
    console.log("Attempting login with PIN:", pin, "Role:", role);

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("pin", pin.trim())
      .eq("role", role)
      .eq("is_active", true)
      .limit(1);

    if (error) {
      console.error("Supabase error:", error);
      return null;
    }

    console.log("Found users:", users);

    if (!users || users.length === 0) {
      console.log("No user found with PIN:", pin, "and role:", role);
      return null;
    }

    const user = users[0];
    console.log("Logging in user:", user.name);

    // Store auth data
    if (typeof window !== "undefined") {
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("user_role", user.role);
      localStorage.setItem("user_name", user.name);
      console.log("Auth stored in localStorage");
    }

    return user;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  const userId = localStorage.getItem("user_id");
  const userRole = localStorage.getItem("user_role");

  console.log("Checking auth - User ID:", userId, "Role:", userRole);

  return !!userId && !!userRole;
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;

  const id = localStorage.getItem("user_id");
  const name = localStorage.getItem("user_name");
  const role = localStorage.getItem("user_role");

  if (!id || !name || !role) return null;

  return {
    id,
    name,
    role: role as "admin" | "cashier",
    pin: "",
    is_active: true,
    created_at: "",
  };
}

export function getUserRole(): "admin" | "cashier" | null {
  if (typeof window === "undefined") return null;
  const role = localStorage.getItem("user_role");
  return role as "admin" | "cashier" | null;
}

export function logout(): void {
  if (typeof window === "undefined") return;

  console.log("Logging out user");

  localStorage.removeItem("user_id");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_name");

  // Force redirect to home
  window.location.href = "/";
}

export function requireAuth(role?: "admin" | "cashier"): boolean {
  if (typeof window === "undefined") return false;

  console.log("requireAuth called with role:", role);

  if (!isAuthenticated()) {
    console.log("Not authenticated, redirecting to login");
    window.location.href = "/login";
    return false;
  }

  if (role && getUserRole() !== role) {
    console.log("Role mismatch, redirecting to home");
    window.location.href = "/";
    return false;
  }

  console.log("Auth check passed");
  return true;
}

// Add a function to check auth on page load
export function setupAuthCheck() {
  if (typeof window === "undefined") return;

  // Check if user is trying to access protected routes without auth
  const protectedRoutes = ["/cashier/", "/admin/"];
  const currentPath = window.location.pathname;

  const isProtectedRoute = protectedRoutes.some((route) =>
    currentPath.startsWith(route)
  );

  if (isProtectedRoute && !isAuthenticated()) {
    window.location.href = "/login";
  }
}

// Call this in your layout or app initialization
setupAuthCheck();

// app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginWithPin } from "../../lib/auth/auth";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "cashier";

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  // Check if already logged in
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const userRole = localStorage.getItem("user_role");

    if (userId && userRole) {
      console.log("Already logged in, redirecting...");
      if (userRole === "admin") {
        router.push("/admin/committee");
      } else {
        router.push("/cashier/transactions");
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDebugInfo("");
    setIsLoading(true);

    console.log("Login attempt:", { pin, role });

    try {
      const user = await loginWithPin(pin, role as "admin" | "cashier");

      console.log("Login result:", user);

      if (user) {
        setDebugInfo(`Login successful! Welcome ${user.name}`);

        // Small delay to show success message
        setTimeout(() => {
          if (user.role === "admin") {
            console.log("Redirecting to admin page");
            router.push("/admin/committee");
          } else {
            console.log("Redirecting to cashier page");
            router.push("/cashier/transactions");
          }
        }, 500);
      } else {
        setError("Invalid PIN. Please try again.");
        setDebugInfo("No user found with the provided PIN and role.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
      setDebugInfo(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Debug button to check localStorage
  const checkLocalStorage = () => {
    const items = {
      user_id: localStorage.getItem("user_id"),
      user_role: localStorage.getItem("user_role"),
      user_name: localStorage.getItem("user_name"),
    };
    console.log("LocalStorage:", items);
    setDebugInfo(`LocalStorage: ${JSON.stringify(items)}`);
  };

  // Clear localStorage for testing
  const clearStorage = () => {
    localStorage.clear();
    setDebugInfo("LocalStorage cleared");
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full mx-auto">
        {/* Debug buttons */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={checkLocalStorage}
            className="px-3 py-1 text-xs bg-gray-200 rounded"
          >
            Check Storage
          </button>
          <button
            onClick={clearStorage}
            className="px-3 py-1 text-xs bg-red-200 rounded"
          >
            Clear Storage
          </button>
        </div>

        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white font-bold">م</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {process.env.NEXT_PUBLIC_MOSQUE_NAME || "Masjid Al-Hidayah"}
          </h1>
          <p className="text-gray-600 mt-2">
            {role === "admin" ? "Committee Admin Portal" : "Cashier Portal"}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your 4-digit PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  className="w-full px-4 py-4 text-2xl text-center tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="●●●●"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Use PIN: <strong>1234</strong> for admin, <strong>5678</strong>{" "}
                for cashier
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || pin.length !== 4}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                role === "admin"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } disabled:opacity-50 disabled:cursor-not-allowed transition`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Logging in...
                </span>
              ) : (
                `Login as ${role === "admin" ? "Admin" : "Cashier"}`
              )}
            </button>
          </form>

          {/* Role Switch */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Want to login as {role === "admin" ? "Cashier" : "Admin"}?
            </p>
            <a
              href={`/login?role=${role === "admin" ? "cashier" : "admin"}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Switch to {role === "admin" ? "Cashier" : "Admin"} Login →
            </a>
          </div>

          {/* Public Access Link */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <a
              href="/"
              className="block text-center text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Public Dashboard
            </a>
          </div>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-mono">{debugInfo}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Contact mosque administration if you&apos;ve forgotten your PIN</p>
        </div>
      </div>
    </div>
  );
}

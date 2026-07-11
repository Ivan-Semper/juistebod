"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Login mislukt");
      }
    } catch {
      setError("Er is iets misgegaan. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#FAF9F6" }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
            JuisteBod.nl
          </p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight text-gray-900">
            Beheeromgeving
          </h1>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-900/5"
        >
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Gebruikersnaam
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20"
              placeholder="Gebruikersnaam"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Wachtwoord
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20"
              placeholder="Wachtwoord"
              required
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-inset ring-red-600/10">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl px-4 py-3 font-semibold text-white shadow-md transition-all hover:bg-[#162E6B] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "#1F3C88" }}
          >
            {isLoading ? "Bezig..." : "Inloggen"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-gray-400">
          Alleen voor medewerkers van JuisteBod.nl
        </p>
      </div>
    </div>
  );
}

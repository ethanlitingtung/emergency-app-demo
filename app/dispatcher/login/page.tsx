"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

const roles = [
  { id: "police", name: "Police", icon: "🚔", color: "bg-blue-600" },
  { id: "ambulance", name: "Ambulance", icon: "🚑", color: "bg-red-600" },
  { id: "fire", name: "Fire", icon: "🚒", color: "bg-orange-600" },
  { id: "lifeguard", name: "Lifeguard", icon: "🛟", color: "bg-teal-600" },
];

export default function DispatcherLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const login = async (role: string) => {
    setLoading(role);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, `${role}@demo.local`, "demo1234");
      router.push("/dispatcher");
    } catch (e) {
      console.error(e);
      setError("Login failed. Make sure the demo users exist in Firebase Auth.");
      setLoading(null);
    }
  };

  return (
    <main className="mx-auto max-w-xl p-6">
      <p className="mb-2 inline-block rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
        DEMO MODE — simulated dispatcher logins
      </p>
      <h1 className="mb-6 text-2xl font-bold">Dispatcher sign in</h1>
      <div className="grid grid-cols-2 gap-4">
        {roles.map((r) => (
          <button
            key={r.id}
            onClick={() => login(r.id)}
            disabled={loading !== null}
            className={`${r.color} flex flex-col items-center rounded-2xl p-8 text-white disabled:opacity-50`}
          >
            <span className="text-5xl">{r.icon}</span>
            <span className="mt-2 text-lg font-semibold">
              {loading === r.id ? "Signing in…" : `Log in as ${r.name}`}
            </span>
          </button>
        ))}
      </div>
      {error && <p className="mt-4 text-center text-red-600">{error}</p>}
    </main>
  );
}

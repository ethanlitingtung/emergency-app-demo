"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dispatcher");
      } else if (localStorage.getItem("profileCompleted") === "true") {
        router.replace("/services");
      } else {
        setChecking(false);
      }
    });
    return () => unsub();
  }, [router]);

  if (checking) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <p className="text-center text-gray-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <p className="mb-2 inline-block rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
        DEMO MODE — no real emergency services are contacted
      </p>
      <h1 className="mb-2 text-3xl font-bold">Emergency Dispatch Demo</h1>
      <p className="mb-8 text-gray-600">
        A demonstration of a faster way to reach help. Who are you?
      </p>
      <div className="space-y-4">
        <button
          onClick={() => router.push("/profile")}
          className="w-full rounded-2xl bg-red-600 p-6 text-left text-white"
        >
          <p className="text-2xl">🚨</p>
          <p className="mt-1 text-xl font-bold">I need help</p>
          <p className="text-red-100">Send an emergency alert as a user</p>
        </button>
        <button
          onClick={() => router.push("/dispatcher/login")}
          className="w-full rounded-2xl bg-gray-800 p-6 text-left text-white"
        >
          <p className="text-2xl">🎧</p>
          <p className="mt-1 text-xl font-bold">I&apos;m a dispatcher</p>
          <p className="text-gray-300">Sign in to the dispatch console</p>
        </button>
      </div>
    </main>
  );
}

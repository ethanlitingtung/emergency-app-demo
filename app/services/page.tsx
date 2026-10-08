"use client";

import { useRouter } from "next/navigation";

const services = [
  { id: "police", name: "Police", icon: "🚔", color: "bg-blue-600" },
  { id: "ambulance", name: "Ambulance", icon: "🚑", color: "bg-red-600" },
  { id: "fire", name: "Fire", icon: "🚒", color: "bg-orange-600" },
  { id: "lifeguard", name: "Lifeguard", icon: "🛟", color: "bg-teal-600" },
];

export default function ServicesPage() {
  const router = useRouter();

  return (
    <main className="mx-auto max-w-xl p-6">
      <p className="mb-2 inline-block rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
        DEMO MODE — no real emergency services are contacted
      </p>
      <h1 className="mb-6 text-2xl font-bold">Which service do you need?</h1>
      <button
        type="button"
        onClick={() => router.push("/profile")}
        className="mb-5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
      >
        Edit profile
      </button>
      <div className="grid grid-cols-2 gap-4">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => router.push(`/services/${s.id}`)}
            className={`${s.color} flex flex-col items-center rounded-2xl p-8 text-white active:scale-95`}
          >
            <span className="text-5xl">{s.icon}</span>
            <span className="mt-2 text-xl font-semibold">{s.name}</span>
          </button>
        ))}
      </div>
        <p className="mt-8 text-center text-sm">
          <button
            onClick={() => router.push("/dispatcher/login")}
            className="text-gray-500 underline"
          >
            Dispatcher? Sign in here
          </button>
        </p>
    </main>
  );
}


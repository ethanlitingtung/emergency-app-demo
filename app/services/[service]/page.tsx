"use client";

import { useParams, useRouter } from "next/navigation";

const types: Record<string, string[]> = {
  police: ["Theft", "Assault", "Burglary", "Traffic accident", "Vandalism", "Other"],
  ambulance: ["Cardiac emergency", "Breathing difficulty", "Serious injury", "Stroke", "Allergic reaction", "Other"],
  fire: ["Building fire", "Vehicle fire", "Gas leak", "Wildfire", "Rescue", "Other"],
  lifeguard: ["Drowning", "Beach injury", "Missing swimmer", "Marine animal encounter", "Other"],
};

const names: Record<string, string> = {
  police: "Police",
  ambulance: "Ambulance",
  fire: "Fire",
  lifeguard: "Lifeguard",
};

export default function TypesPage() {
  const params = useParams();
  const router = useRouter();
  const service = params.service as string;
  const list = types[service] ?? ["Other"];

  return (
    <main className="mx-auto max-w-xl p-6">
      <p className="mb-2 inline-block rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
        DEMO MODE — no real emergency services are contacted
      </p>
      <h1 className="mb-6 text-2xl font-bold">
        {names[service] ?? service}: what&apos;s happening?
      </h1>
      <div className="space-y-3">
        {list.map((t) => (
          <button
            key={t}
            onClick={() => router.push(`/services/${service}/${encodeURIComponent(t)}`)}
            className="w-full rounded-xl border border-gray-300 bg-white p-4 text-left text-lg font-medium active:bg-gray-100"
          >
            {t}
          </button>
        ))}
      </div>
    </main>
  );
}

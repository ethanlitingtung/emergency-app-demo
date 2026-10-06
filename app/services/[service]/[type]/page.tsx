"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatIncidentType } from "@/lib/incident";

const names: Record<string, string> = {
  police: "Police",
  ambulance: "Ambulance",
  fire: "Fire",
  lifeguard: "Lifeguard",
};

const HOLD_MS = 3000;
const COUNTDOWN_S = 5;

function getPosition(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 8000 });
  });
}

export default function ConfirmPage() {
  const params = useParams();
  const router = useRouter();
  const service = params.service as string;
  const type = formatIncidentType(params.type as string);

  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const holdTimer = useRef<number | null>(null);

  const cancelHold = () => {
    if (holdTimer.current) window.clearInterval(holdTimer.current);
    holdTimer.current = null;
    setProgress(0);
  };

  const startHold = () => {
    const start = Date.now();
    holdTimer.current = window.setInterval(() => {
      const p = (Date.now() - start) / HOLD_MS;
      if (p >= 1) {
        cancelHold();
        setCountdown(COUNTDOWN_S);
      } else {
        setProgress(p);
      }
    }, 50);
  };

  const sendAlert = useCallback(async () => {
    setSending(true);
    setError("");
    try {
      const position = await getPosition();
      const profileSnap = await getDoc(doc(db, "profiles", "demo-user"));
      const profile = profileSnap.exists() ? profileSnap.data() : {};
      const ref = await addDoc(collection(db, "incidents"), {
        service,
        type,
        userId: "demo-user",
        profile,
        location: position
          ? {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
            }
          : null,
        status: "new",
        createdAt: serverTimestamp(),
      });
      router.push(`/incident/${ref.id}`);
    } catch (e) {
      console.error(e);
      setError("Couldn't send the alert. Check your connection and try again.");
      setSending(false);
      setCountdown(null);
    }
  }, [router, service, type]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      sendAlert();
      return;
    }
    const t = window.setTimeout(
      () => setCountdown((c) => (c === null ? null : c - 1)),
      1000
    );
    return () => window.clearTimeout(t);
  }, [countdown, sendAlert]);

  return (
    <main className="mx-auto max-w-xl p-6">
      <p className="mb-2 inline-block rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
        DEMO MODE — no real emergency services are contacted
      </p>
      <h1 className="mb-2 text-2xl font-bold">Confirm your alert</h1>
      <p className="mb-6 text-gray-600">
        {names[service] ?? service} · {type}
      </p>

      {countdown === null && !sending && (
        <button
          onPointerDown={startHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onContextMenu={(e) => e.preventDefault()}
          className="relative block h-40 w-full touch-none select-none overflow-hidden rounded-2xl bg-red-600 text-xl font-bold text-white"
        >
          <div
            className="absolute inset-y-0 left-0 bg-red-800"
            style={{ width: `${progress * 100}%` }}
          />
          <span className="relative">
            PRESS AND HOLD
            <br />
            to send alert
          </span>
        </button>
      )}

      {countdown !== null && !sending && (
        <div className="text-center">
          <p className="mb-4 text-3xl font-bold">Sending in {countdown}…</p>
          <button
            onClick={() => setCountdown(null)}
            className="w-full rounded-2xl bg-gray-800 py-4 text-xl font-bold text-white"
          >
            CANCEL
          </button>
        </div>
      )}

      {sending && <p className="text-center text-xl">Sending your alert…</p>}
      {error && <p className="mt-4 text-center text-red-600">{error}</p>}

      <p className="mt-6 text-center text-sm text-gray-500">
        Your profile and location will be sent with this alert.
      </p>
    </main>
  );
}


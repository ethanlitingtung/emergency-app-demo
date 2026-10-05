"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const names: Record<string, string> = {
  police: "Police",
  ambulance: "Ambulance",
  fire: "Fire",
  lifeguard: "Lifeguard",
};

const statusLabels: Record<string, string> = {
  new: "Sent",
  acknowledged: "Acknowledged",
  en_route: "On the way",
  resolved: "Resolved",
};

const statusOrder = ["new", "acknowledged", "en_route", "resolved"];

export default function IncidentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [incident, setIncident] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "incidents", id), (snap) => {
      if (snap.exists()) setIncident({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [id]);

  useEffect(() => {
    const q = query(
      collection(db, "incidents", id, "messages"),
      orderBy("createdAt")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [id]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await addDoc(collection(db, "incidents", id, "messages"), {
      text,
      sender: "user",
      createdAt: serverTimestamp(),
    });
  };

  if (!incident) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <p className="text-center text-gray-500">Loading…</p>
      </main>
    );
  }

  const stepIndex = statusOrder.indexOf(incident.status);

  return (
    <main className="mx-auto max-w-xl p-6">
      <p className="mb-2 inline-block rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
        DEMO MODE — no real emergency services are contacted
      </p>
      <div className="mb-6 rounded-2xl bg-green-50 p-6 text-center">
        <p className="text-5xl">✅</p>
        <h1 className="mt-2 text-2xl font-bold">Alert sent</h1>
        <p className="text-gray-600">
          {names[incident.service] ?? incident.service} · {incident.type}
        </p>
      </div>

      <h2 className="mb-3 text-lg font-semibold">Status</h2>
      <ol className="mb-6 space-y-2">
        {statusOrder.map((s, i) => (
          <li key={s} className="flex items-center gap-3">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                i <= stepIndex ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {i + 1}
            </span>
            <span className={i <= stepIndex ? "font-medium" : "text-gray-400"}>
              {statusLabels[s]}
            </span>
          </li>
        ))}
      </ol>

      <h2 className="mb-3 text-lg font-semibold">Messages</h2>
      <div className="mb-3 h-64 space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400">
            No messages yet. A dispatcher will message you here.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
              m.sender === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "bg-white text-gray-800 shadow"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="mb-6 flex gap-2">
        <input
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
          placeholder="Type a message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
        >
          Send
        </button>
      </form>

      <button
        onClick={() => router.push("/services")}
        className="w-full rounded-lg bg-gray-800 py-3 text-lg font-semibold text-white"
      >
        Send another alert
      </button>
    </main>
  );
}

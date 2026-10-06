"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { formatIncidentType } from "@/lib/incident";

const statusLabels: Record<string, string> = {
  new: "New",
  acknowledged: "Acknowledged",
  en_route: "En route",
  resolved: "Resolved",
};

const nextStatus: Record<string, string | null> = {
  new: "acknowledged",
  acknowledged: "en_route",
  en_route: "resolved",
  resolved: null,
};

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <dt className="w-40 shrink-0 text-gray-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function DispatcherIncidentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [incident, setIncident] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState("");
  const [checking, setChecking] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editType, setEditType] = useState("");
  const [editStatus, setEditStatus] = useState("new");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u: User | null) => {
      setChecking(false);
      if (!u) router.push("/dispatcher/login");
    });
    return () => unsub();
  }, [router]);

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

  const advanceStatus = async () => {
    const next = nextStatus[incident.status];
    if (!next) return;
    await updateDoc(doc(db, "incidents", id), { status: next });
  };

  const beginEditing = () => {
    setEditType(formatIncidentType(incident.type ?? ""));
    setEditStatus(incident.status ?? "new");
    setEditError("");
    setEditing(true);
  };

  const saveIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    const type = editType.trim();
    if (!type) {
      setEditError("Enter an emergency type.");
      return;
    }
    setSavingEdit(true);
    setEditError("");
    try {
      await updateDoc(doc(db, "incidents", id), { type, status: editStatus });
      setEditing(false);
    } catch (e) {
      console.error(e);
      setEditError("Couldn't save the emergency. Please try again.");
    } finally {
      setSavingEdit(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await addDoc(collection(db, "incidents", id, "messages"), {
      text,
      sender: "dispatcher",
      createdAt: serverTimestamp(),
    });
  };

  if (checking || !incident) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="text-center text-gray-500">Loading…</p>
      </main>
    );
  }

  const p = incident.profile ?? {};
  const loc = incident.location;
  const next = nextStatus[incident.status];

  return (
    <main className="mx-auto max-w-2xl p-6">
      <button
        onClick={() => router.push("/dispatcher")}
        className="mb-4 text-sm text-blue-600"
      >
        ← Back to queue
      </button>
      <p className="mb-2 inline-block rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
        DEMO MODE — simulated dispatcher console
      </p>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{formatIncidentType(incident.type)}</h1>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold">
          {statusLabels[incident.status] ?? incident.status}
        </span>
      </div>

      {!editing ? (
        <button
          type="button"
          onClick={beginEditing}
          className="mb-4 text-sm font-medium text-blue-700 underline"
        >
          Edit emergency
        </button>
      ) : (
        <form onSubmit={saveIncident} className="mb-6 space-y-3 rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold">Edit emergency</h2>
          <label className="block text-sm font-medium">
            Emergency type
            <input
              value={editType}
              onChange={(e) => setEditType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Status
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          {editError && <p className="text-sm text-red-600">{editError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={savingEdit}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {savingEdit ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {next && (
        <button
          onClick={advanceStatus}
          className="mb-6 w-full rounded-xl bg-green-600 py-3 text-lg font-semibold text-white"
        >
          Mark as {statusLabels[next]}
        </button>
      )}

      <section className="mb-4 rounded-xl border border-gray-200 p-4">
        <h2 className="mb-2 text-lg font-semibold">Caller</h2>
        <dl className="space-y-1 text-sm">
          <Row label="Name" value={p.fullName} />
          <Row label="Phone" value={p.phone} />
          <Row label="Blood type" value={p.bloodType} />
          <Row label="Medical conditions" value={p.medicalConditions} />
          <Row label="Medications" value={p.medications} />
          <Row label="Allergies" value={p.allergies} />
          <Row label="Accessibility needs" value={p.accessibilityNeeds} />
          <Row label="Emergency contact" value={p.emergencyContactName} />
          <Row label="Contact phone" value={p.emergencyContactPhone} />
        </dl>
      </section>

      <section className="mb-6 rounded-xl border border-gray-200 p-4">
        <h2 className="mb-2 text-lg font-semibold">Location</h2>
        {loc ? (
          <a
            href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)} — open in Maps
          </a>
        ) : (
          <p className="text-sm text-gray-500">Location not available</p>
        )}
      </section>

      <h2 className="mb-3 text-lg font-semibold">Messages</h2>
      <div className="mb-3 h-64 space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400">No messages yet.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
              m.sender === "dispatcher"
                ? "ml-auto bg-blue-600 text-white"
                : "bg-white text-gray-800 shadow"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
          placeholder="Message the caller…"
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
    </main>
  );
}


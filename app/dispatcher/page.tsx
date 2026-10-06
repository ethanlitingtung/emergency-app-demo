"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, deleteDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { formatIncidentType } from "@/lib/incident";

const statusColors: Record<string, string> = {
  new: "bg-red-100 text-red-800",
  acknowledged: "bg-yellow-100 text-yellow-800",
  en_route: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
};

export default function DispatcherDashboard() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [incidents, setIncidents] = useState<any[]>([]);
  const [checking, setChecking] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u: User | null) => {
      setChecking(false);
      if (!u) {
        router.push("/dispatcher/login");
      } else {
        setRole(u.email?.split("@")[0] ?? "");
      }
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!role) return;
    const q = query(collection(db, "incidents"), where("service", "==", role));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a: any, b: any) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setIncidents(list);
    });
    return () => unsub();
  }, [role]);

  const logout = async () => {
    await signOut(auth);
    router.push("/dispatcher/login");
  };

  const removeHandledIncident = async (id: string) => {
    if (!window.confirm("Delete this handled emergency from the queue?")) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "incidents", id));
    } catch (e) {
      console.error(e);
      window.alert("Couldn't delete this emergency. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (checking) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="text-center text-gray-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="mb-1 inline-block rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
            DEMO MODE — simulated dispatcher console
          </p>
          <h1 className="text-2xl font-bold capitalize">{role} dispatch queue</h1>
        </div>
        <button
          onClick={logout}
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold"
        >
          Sign out
        </button>
      </div>

      {incidents.length === 0 ? (
        <p className="rounded-xl bg-gray-50 p-6 text-center text-gray-500">
          No incidents yet. New alerts for {role} will appear here live.
        </p>
      ) : (
        <ul className="space-y-3">
          {incidents.map((inc) => (
            <li key={inc.id} className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <button
                onClick={() => router.push(`/dispatcher/incidents/${inc.id}`)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">{formatIncidentType(inc.type)}</p>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${
                      statusColors[inc.status] ?? "bg-gray-100"
                    }`}
                  >
                    {inc.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {inc.profile?.fullName ?? "Unknown caller"}
                  {inc.createdAt?.toDate
                    ? ` · ${inc.createdAt.toDate().toLocaleString()}`
                    : ""}
                </p>
              </button>
              {inc.status === "resolved" && (
                <div className="border-t border-gray-100 px-4 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeHandledIncident(inc.id)}
                    disabled={deletingId === inc.id}
                    className="text-sm font-medium text-red-700 underline disabled:opacity-50"
                  >
                    {deletingId === inc.id ? "Deleting…" : "Delete handled emergency"}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const inputStyle =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-red-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    bloodType: "",
    medicalConditions: "",
    medications: "",
    allergies: "",
    accessibilityNeeds: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [field]: e.target.value });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await setDoc(doc(db, "profiles", "demo-user"), {
      ...form,
      updatedAt: new Date().toISOString(),
    });
    setSaving(false);
    router.push("/services");
  };

  return (
    <main className="mx-auto max-w-xl p-6">
      <p className="mb-2 inline-block rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
        DEMO MODE — no real emergency services are contacted
      </p>
      <h1 className="mb-6 text-2xl font-bold">Your profile</h1>
      <form onSubmit={save} className="space-y-4">
        <Field label="Full name">
          <input required className={inputStyle} value={form.fullName} onChange={update("fullName")} />
        </Field>
        <Field label="Phone number">
          <input required type="tel" className={inputStyle} value={form.phone} onChange={update("phone")} />
        </Field>
        <Field label="Blood type">
          <input className={inputStyle} placeholder="e.g. O+" value={form.bloodType} onChange={update("bloodType")} />
        </Field>
        <Field label="Medical conditions">
          <textarea className={inputStyle} rows={2} value={form.medicalConditions} onChange={update("medicalConditions")} />
        </Field>
        <Field label="Medications">
          <textarea className={inputStyle} rows={2} value={form.medications} onChange={update("medications")} />
        </Field>
        <Field label="Allergies">
          <input className={inputStyle} value={form.allergies} onChange={update("allergies")} />
        </Field>
        <Field label="Accessibility needs">
          <input className={inputStyle} placeholder="e.g. wheelchair user, hard of hearing" value={form.accessibilityNeeds} onChange={update("accessibilityNeeds")} />
        </Field>
        <Field label="Emergency contact name">
          <input className={inputStyle} value={form.emergencyContactName} onChange={update("emergencyContactName")} />
        </Field>
        <Field label="Emergency contact phone">
          <input type="tel" className={inputStyle} value={form.emergencyContactPhone} onChange={update("emergencyContactPhone")} />
        </Field>
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-red-600 py-3 text-lg font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </main>
  );
}

"use client";

import { usePathname, useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/services") return null;

  return (
    <nav className="mx-auto w-full max-w-4xl px-6 pt-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
        aria-label="Go back"
      >
        ← Back
      </button>
    </nav>
  );
}

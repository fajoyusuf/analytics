"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-lg border border-rose-800 bg-rose-950/40 p-6 text-rose-100">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="mt-2 text-sm">{error.message}</p>
      <button className="mt-4 rounded bg-rose-500 px-3 py-1 text-sm text-white" onClick={() => reset()}>
        Retry
      </button>
    </div>
  );
}

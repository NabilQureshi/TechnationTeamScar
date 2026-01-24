import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 shadow">
        <h1 className="text-4xl font-semibold tracking-tight">Solace</h1>
        <p className="mt-3 text-zinc-300">
          A supportive chatbot to help you reflect, feel heard, and plan calmer days.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:opacity-90"
            href="/chat"
          >
            Open Chat (Guest)
          </Link>
          <Link
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-800"
            href="/login"
          >
            Sign up / Login
          </Link>
          <Link
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-800"
            href="/onboarding"
          >
            Onboarding
          </Link>
          <Link
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-800"
            href="/calendar"
          >
            Calendar
          </Link>
        </div>

        <p className="mt-8 text-xs text-zinc-400">
          Solace is not a medical service. If you are in danger or need urgent help, contact local emergency services.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
          <h1 className="text-2xl font-semibold">Login</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Hook this up to Firebase Auth next.
          </p>
  
          <div className="mt-6 space-y-3">
            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              placeholder="Email"
              type="email"
            />
            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              placeholder="Password"
              type="password"
            />
  
            <button className="w-full rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:opacity-90">
              Continue
            </button>
          </div>
        </div>
      </main>
    );
  }
  
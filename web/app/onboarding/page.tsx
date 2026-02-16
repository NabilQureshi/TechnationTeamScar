export default function OnboardingPage() {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
          <h1 className="text-2xl font-semibold">Onboarding</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Quick questions to personalize Solace (Finch-style).
          </p>
  
          <div className="mt-6 space-y-4">
            <input className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Name" />
            <textarea className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="What are you struggling with right now?" />
            <textarea className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="School/workload stressors?" />
            <textarea className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Fitness / eating habits / social anxiety notes?" />
  
            <button className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:opacity-90">
              Save & Continue
            </button>
          </div>
        </div>
      </main>
    );
  }
  
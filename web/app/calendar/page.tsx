export default function CalendarPage() {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <p className="mt-2 text-sm text-zinc-300">
            This is where we’ll connect Google Calendar and insert “stress relief blocks”.
          </p>
  
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:opacity-90">
              Connect Google Calendar
            </button>
            <button className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-800">
              Generate calmer schedule
            </button>
          </div>
  
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
            Events preview will appear here…
          </div>
        </div>
      </main>
    );
  }
  
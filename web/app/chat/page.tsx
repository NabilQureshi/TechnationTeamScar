export default function ChatPage() {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h1 className="text-2xl font-semibold">Chat</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Guest chat page (not personalized yet).
          </p>
  
          <div className="mt-6 h-[420px] rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
            Messages will go here…
          </div>
  
          <div className="mt-4 flex gap-2">
            <input
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              placeholder="Type a message..."
            />
            <button className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:opacity-90">
              Send
            </button>
          </div>
        </div>
      </main>
    );
  }
  
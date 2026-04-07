'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-left py-8">
        <h1 className="text-5xl font-bold tracking-tight">
          <span className="text-[#DA291C]">Glory Glory</span>
        </h1>
        <p className="text-lg text-white/50 max-w-xl mt-3">
          The smartest person in the pub, in your pocket. AI-powered match companion for Manchester United.
        </p>
      </section>

      {/* Navigation */}
      <nav className="grid grid-cols-1 gap-3">
        <Link href="/matches" className="block p-5 border border-white/10 hover:border-[#DA291C]/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Match Centre</h2>
              <p className="text-sm text-white/50 mt-1">Live scores, events, and stats</p>
            </div>
            <span className="text-white/30">→</span>
          </div>
        </Link>

        <Link href="/goals" className="block p-5 border border-white/10 hover:border-[#DA291C]/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Goals Archive</h2>
              <p className="text-sm text-white/50 mt-1">Every goal, fully tagged</p>
            </div>
            <span className="text-white/30">→</span>
          </div>
        </Link>

        <Link href="/chat" className="block p-5 border border-white/10 hover:border-[#DA291C]/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Ask Glory</h2>
              <p className="text-sm text-white/50 mt-1">Natural language about United</p>
            </div>
            <span className="text-white/30">→</span>
          </div>
        </Link>
      </nav>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/10">
        <p className="text-sm text-white/30">
          GGMU
        </p>
      </footer>
    </div>
  );
}

'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <div>
        <h1 className="text-[2.75rem] font-bold tracking-tight leading-none">
          <span className="text-[#DA291C]">Glory Glory</span>
        </h1>
        <p className="text-base text-white/40 mt-3 leading-relaxed">
          The smartest person in the pub, in your pocket.
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {[
          { href: '/matches', label: 'Match Centre', desc: 'Live scores, events, stats' },
          { href: '/goals', label: 'Goals Archive', desc: 'Every goal, fully tagged' },
          { href: '/chat', label: 'Ask Glory', desc: 'Natural language about United' },
        ].map(({ href, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between py-3 border-b border-white/5 hover:border-white/20 transition-colors group"
          >
            <div>
              <h2 className="text-base font-medium group-hover:text-[#DA291C] transition-colors">{label}</h2>
              <p className="text-sm text-white/35 mt-0.5">{desc}</p>
            </div>
            <span className="text-white/20 group-hover:text-white/50 transition-colors">→</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="pt-8">
        <p className="text-xs text-white/20 tracking-widest uppercase">GGMU</p>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Glory Glory - Man Utd AI Match Companion",
  description: "The smartest person in the pub, in your pocket. AI-powered Manchester United match companion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <nav className="sticky top-0 z-50 bg-[#0B0523]/90 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#DA291C] rounded-lg flex items-center justify-center font-bold text-xl">
                  GG
                </div>
                <span className="text-xl font-bold tracking-tight">Glory Glory</span>
              </a>
              <div className="flex gap-6">
                <a href="/goals" className="hover:text-[#DA291C] transition-colors font-medium">Goals</a>
                <a href="/matches" className="hover:text-[#DA291C] transition-colors font-medium">Match</a>
                <a href="/chat" className="hover:text-[#DA291C] transition-colors font-medium">Chat</a>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
          {children}
        </main>
        <footer className="border-t border-white/10 mt-16 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-white/50 text-sm">
            Glory Glory — For the fans, by the fans. GGMU.
          </div>
        </footer>
      </body>
    </html>
  );
}

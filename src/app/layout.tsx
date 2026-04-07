import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Glory Glory — Man United",
  description: "AI-powered match companion for Manchester United fans",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full antialiased">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {children}
        </div>
      </body>
    </html>
  );
}

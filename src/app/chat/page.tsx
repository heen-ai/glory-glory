'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatGoalsForAI } from '@/lib/goals';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Welcome to Glory Glory! I'm your Man Utd companion. Ask me anything about United goals, players, matches, or tactics. For example:\n\n• \"Show me all Rashford goals from outside the box\"\n• \"What's the best goal we've scored this season?\"\n• \"Has Bruno ever scored a header at Old Trafford?\""
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const goalsContext = formatGoalsForAI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, goalsContext }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble thinking right now. Try again in a moment." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-4xl font-bold">Ask Glory Glory</h1>
        <p className="text-white/50 mt-1">Natural language search through United's history</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 scrollbar-hide">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] border px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-[#DA291C] text-white'
                  : 'bg-white/10 text-white'
              }`}
            >
              {msg.content.split('\n').map((line, j) => (
                <p key={j} className={j > 0 ? 'mt-2' : ''}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 border px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white/50 border animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-white/50 border animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-white/50 border animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about any United goal, player, or match..."
          className="flex-1"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </form>

      {/* Example Queries */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-white/50 text-sm mb-3">Try these:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Rashford volleys this season",
            "Last minute winners",
            "Goals in the Manchester derby",
            "All headers from corners"
          ].map((example) => (
            <button
              key={example}
              onClick={() => setInput(example)}
              className="text-sm bg-white/5 hover:bg-white/10 px-3 py-1 border transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

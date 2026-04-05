import { NextRequest, NextResponse } from 'next/server';

const MINIMAX_API = 'https://api.minimax.io/v1/text/chatcompletion_v2';

export async function POST(request: NextRequest) {
  try {
    const { message, goalsContext } = await request.json();

    const minimaxKey = process.env.MINIMAX_API_KEY;
    if (!minimaxKey) {
      return NextResponse.json(
        { error: 'MiniMax API key not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = `You are Glory Glory, a passionate Manchester United AI companion. You know everything about United's history, tactics, players, and matches.

You have access to a goals database. When users ask about goals, please search through the database and return relevant results.

Format your responses with enthusiasm and fan energy.

GOALS DATABASE:
${goalsContext || 'No goals data available.'}

When users ask about specific goals:
1. Find matching goals from the database
2. Include: scorer, opponent, date, minute, goal type, YouTube link if available
3. Add brief commentary about the goal

Keep responses conversational and knowledgeable, like a well-informed mate watching the match with you.`;

    const response = await fetch(MINIMAX_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${minimaxKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MiniMax API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'AI service error', response: "Sorry, I'm having trouble thinking right now." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || "No response generated.";

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal error', response: "Sorry, I'm having trouble thinking right now." },
      { status: 500 }
    );
  }
}

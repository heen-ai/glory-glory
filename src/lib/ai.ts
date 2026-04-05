const MINIMAX_API = 'https://api.minimax.io/v1/text/chatcompletion_v2';
const MINIMAX_KEY = process.env.MINIMAX_API_KEY || '';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chat(
  userMessage: string,
  goalsContext: string,
  matchContext?: string
): Promise<string> {
  const systemPrompt = `You are Glory Glory, a passionate Manchester United AI companion. You know everything about United's history, tactics, players, and matches.

You have access to a goals database. When users ask about goals, please search through the database and return relevant results.

Format your responses with enthusiasm and fan energy. Use emojis sparingly but effectively.

GOALS DATABASE:
${goalsContext}
${matchContext ? `\nCURRENT MATCH DATA:\n${matchContext}` : ''}

When users ask about specific goals:
1. Find matching goals from the database
2. Include: scorer, opponent, date, minute, goal type, YouTube link if available
3. Add brief commentary about the goal

Keep responses conversational and knowledgeable, like a well-informed mate watching the match with you.`;

  try {
    const response = await fetch(MINIMAX_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MINIMAX_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`MiniMax API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response generated.';
  } catch (error) {
    console.error('AI chat error:', error);
    return 'Sorry, I\'m having trouble thinking right now. Try again in a moment.';
  }
}

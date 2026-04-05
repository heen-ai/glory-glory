import { NextResponse } from 'next/server';

const SPORTSRC_BASE = 'https://api.sportsrc.org/v2';

export async function GET() {
  try {
    const response = await fetch(`${SPORTSRC_BASE}/scores`, {
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    if (!response.ok) {
      throw new Error(`SportSRC API error: ${response.status}`);
    }

    const data = await response.json();
    const matches = data.data || data;

    // Filter for Man Utd
    const manUtdMatch = matches.find((m: any) =>
      m.home_team?.toLowerCase().includes('manchester united') ||
      m.away_team?.toLowerCase().includes('manchester united') ||
      m.home_team?.toLowerCase().includes('man utd') ||
      m.away_team?.toLowerCase().includes('man utd')
    );

    if (!manUtdMatch) {
      return NextResponse.json({ match: null, message: 'No Man Utd match found' });
    }

    return NextResponse.json({ match: manUtdMatch });
  } catch (error) {
    console.error('Matches API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch match data', match: null },
      { status: 500 }
    );
  }
}

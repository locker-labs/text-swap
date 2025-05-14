import { NextRequest, NextResponse } from 'next/server';

const SocialDataApiKey = process.env.SOCIALDATA_API_KEY; // Keep secret keys in .env

if (!SocialDataApiKey) {
  throw new Error('Missing SOCIALDATA_API_KEY in environment variables');
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ tweetId: string }> }) {
  const { tweetId } = await params;
  if (!tweetId) {
    return NextResponse.json({ error: 'Missing tweetId' }, { status: 400 });
  }

  if (!SocialDataApiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
  }

  try {
    const externalResponse = await fetch(`https://api.socialdata.tools/twitter/tweets/${tweetId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SocialDataApiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!externalResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch from SocialData API' }, { status: externalResponse.status });
    }

    const data = await externalResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

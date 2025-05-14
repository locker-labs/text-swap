'use strict';
// 'use server';

import { NextRequest, NextResponse } from 'next/server';
import { ReclaimClient } from '@reclaimprotocol/zk-fetch';
import { transformForOnchain } from "@reclaimprotocol/js-sdk";

export async function GET(request: NextRequest, { params }: { params: Promise<{ tweetId: string }> }) {
  try {

      const { tweetId } = await params;

    if (!tweetId || typeof tweetId !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing tweetId' }, { status: 400 });
    }

    const client = new ReclaimClient(process.env.NEXT_PUBLIC_RECLAIM_APP_ID!, process.env.NEXT_PUBLIC_RECLAIM_APP_SECRET!)

    const publicOptions = {
        method: 'GET', // or POST
        headers: {
            accept: 'application/json',
        }
    }

    const privateOptions = {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SOCIALDATA_API_KEY}`,
        }
    }


    const URL = `https://api.socialdata.tools/twitter/tweets/${tweetId}`
    const proof = await client.zkFetch(
        URL,
        publicOptions,
        privateOptions
    )
    console.log('proof:', proof);

    const onchainProof = transformForOnchain(proof!);
    console.log('onchainProof:', onchainProof);


    

    // Do something with the data here (e.g., logging, processing, forwarding)
    const result = {
      message: 'Data received successfully',
      data: { proof, onchainProof },
      received: {
        URL,
        publicOptions,
        privateOptions,
      },
    };

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
  }
}

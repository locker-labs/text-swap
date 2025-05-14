"use client"

import { ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { pollTwitter } from "@/services/pollTwitter";
import RedeemDelegation from "./RedeemDelegation";
import { TweetData } from "@/types/TweetData"
import { TwitterUser } from "@/services/twitterOAuth";

const PollingInterval = process.env.NEXT_PUBLIC_POLL_INTERVAL_MS ? parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL_MS)/1000 : 5;
let _count = 0;

export default function FetchTweetData({ userId, twitterUser }: { userId: string; twitterUser: TwitterUser; }) {
    const [intervalId, setIntervalId] = useState<null | any>(null);
    const [tweetData, setTweetData] = useState<null | TweetData>(null);

    // on component mount, start polling for the transaction
    useEffect(() => {
        if (_count) return;
        _count++;

        const _intervalId = setInterval(async () => {
            const _tweetData = await pollTwitter(userId);

            if (_tweetData) {
                console.log('Valid Tweet found, clearing interval')
                // stop polling
                clearInterval(_intervalId);
                setIntervalId(null);

                // set the tweet data
                setTweetData(_tweetData);
                console.log('tweetData:', _tweetData);
            }
        }, 1000 * PollingInterval)
        console.log('setting interval', _intervalId);
        setIntervalId(_intervalId);

        return () => {
            if (intervalId) {
                console.log('clearing interval');
                clearInterval(intervalId);
            }
        }
    }, [])

    if (!tweetData) {
        return <div className="w-full bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <span className="text-white text-[16px] font-[Roboto]">
                Looking for a valid tweet...
            </span>
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
    }

    return <div>
        <div onClick={() => {
            window.open(tweetData.tweetLink, '_blank');
        }} className="mb-[20px] w-full bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <span className="text-white text-[16px] font-[Roboto]">
                View Tweet
            </span>
            <ExternalLink className="h-5 w-5" />
          </div>

        <RedeemDelegation {...{...tweetData, ...twitterUser}} />
    </div>
}
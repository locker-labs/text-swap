"use client"

import { useEffect, useState } from "react";
import { pollTwitter } from "@/services/pollTwitter";
import RedeemDelegation from "./RedeemDelegation";
import { TweetData } from "@/types/TweetData"
const PollingInterval = process.env.NEXT_PUBLIC_POLL_INTERVAL_MS ? parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL_MS)/1000 : 3;

export default function FetchTweetData() {
    const [intervalId, setIntervalId] = useState<null | any>(null);
    const [tweetData, setTweetData] = useState<null | TweetData>(null);

    // on component mount, start polling for the transaction
    useEffect(() => {
        const _intervalId = setInterval(async () => {
            const _tweetData = await pollTwitter('userId');

            if (_tweetData) {
                // stop polling
                if (intervalId) {
                    clearInterval(intervalId);
                    setIntervalId(null);
                }

                // set the tweet data
                setTweetData(_tweetData);
                console.log('tweetData:', _tweetData);
            }
        }, 1000 * PollingInterval)
        setIntervalId(_intervalId);
    }, [])

    if (!tweetData) {
        return <>Fetching Tweet...</>
    }

    return <RedeemDelegation {...tweetData} />
}
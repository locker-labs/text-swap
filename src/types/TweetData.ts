import { Address } from "viem";

export type TweetData = {
    tokenAmount: number;
    tokenAddress: Address;
    tweetId: string;
    tweetLink: string;
}
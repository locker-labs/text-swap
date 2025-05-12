import moment from 'moment';
import { Address } from 'viem';
const botName = 'locker_money';
const PollingInterval = process.env.NEXT_PUBLIC_POLL_INTERVAL_MS ? parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL_MS)/1000 : 3;
const SocialDataApiKey = process.env.NEXT_PUBLIC_SOCIALDATA_API_KEY;

if (!SocialDataApiKey) {
    throw new Error('NEXT_PUBLIC_SOCIALDATA_API_KEY is not set');
}

export async function pollTwitter(userId: string) {
    // @dev for testing
    // return {
    //     tokenAmount: 1.5,
    //     tokenAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    //     tweetId: '1921137267071934542'
    // };

    console.log('Polling Twitter...');
    let tweetObj = null;

    try {
        const rawResponse = await fetch(`https://api.socialdata.tools/twitter/user/${userId}/tweets-and-replies`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SocialDataApiKey}`,
                'Accept': 'application/json'
            }
        });
        const response = await rawResponse.json();

        console.log('response.tweets', response.tweets);

        localStorage.setItem('latestTweets', JSON.stringify(response.tweets));

        const now = moment().subtract(1 + PollingInterval, 'seconds');

        // processing tweets
        for (const tweet of response.tweets) {
            // @dev comment below if block for testing
            // if (!moment(tweet.tweet_created_at).isAfter(now)) {
            //     continue;
            // }

            if (!tweet.full_text.includes(`@${botName}`)) {
                continue;
            }

            tweetObj = tweet;
            break;
        }
    } catch (error) {
        console.error('Error fetching tweets:', error);
    }

    if (!tweetObj) {
        return;
    }

    // parse tweet id and content
    const tweetId = tweetObj.id_str;
    const tweetText = tweetObj.full_text;
    console.log('Tweet ID:', tweetId);
    console.log('Tweet content:', tweetText);

    // extract token amount and token address from tweet full_text
    const regex: RegExp = /token:\s*(0x[a-fA-F0-9]{40})\s+amount:\s*([\d.]+)/;

    const match: RegExpMatchArray | null = tweetText.match(regex);

    if (!match) {
        console.error(`Invalid tweet format. Expected format: "@${botName} token: <token_address> amount: <amount>"`);
        return;
    }

    const tokenAddress = match[1] as Address;
    const tokenAmount: number = parseFloat(match[2]);
    console.log('Token amount:', tokenAmount);
    console.log('Token address:', tokenAddress);

    return { tokenAmount, tokenAddress, tweetId };
}
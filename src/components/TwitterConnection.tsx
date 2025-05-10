"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Loader2, Twitter } from "lucide-react";
import { initiateTwitterOAuth, getCurrentTwitterUser, TwitterUser } from "@/services/twitterOAuth";
import { useSearchParams } from "next/navigation";
import FetchTweetData from "@/components/FetchTweetData";

export default function TwitterConnection({
  twitterUser,
  setTwitterUser,
}: {
  twitterUser: TwitterUser | null;
  setTwitterUser: (user: TwitterUser | null) => void;
}) {
  const [startPolling, setStartPolling] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [tweetText, setTweetText] = useState<string>("");
  const searchParams = useSearchParams();

  // Check for connection status and errors from search params
  useEffect(() => {
    // Check if we just completed a successful Twitter connection
    if (searchParams.get("twitter_connected") === "true") {
      const user = getCurrentTwitterUser();
      if (user) {
        setTwitterUser(user);

        // Generate tweet text with a sample token address
        const tokenAddress = "0x1234567890abcdef1234567890abcdef12345678";
        setTweetText(`@locker_money buy token: ${tokenAddress} amount: 100`);
      }
    }

    // Check for errors
    const error = searchParams.get("error");
    if (error) {
      console.error("Twitter connection error:", error);
      setIsConnecting(false);
    }
  }, [searchParams]);

  // Check for existing Twitter user on component mount
  useEffect(() => {
    const user = getCurrentTwitterUser();
    if (user) {
      setTwitterUser(user);

      // Generate tweet text with a sample token address
      const tokenAddress = "0x1234567890abcdef1234567890abcdef12345678";
      setTweetText(`@locker_money buy token: ${tokenAddress} amount: 100`);
    }
  }, []);

  const handleConnectTwitter = async () => {
    setIsConnecting(true);
    try {
      await initiateTwitterOAuth();
    } catch (error) {
      console.error("Failed to connect Twitter:", error);
      setIsConnecting(false);
    }
  };

  if (twitterUser) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Twitter className="h-6 w-6 text-blue-400" />
            <h3 className="text-lg font-semibold">Twitter Connected!</h3>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>

          <p className="text-gray-300 mb-4">
            Your Twitter account{" "}
            <span className="font-bold text-blue-400">
              @{twitterUser.username}
            </span>{" "}
            has been connected.
          </p>

          <div className="bg-blue-900/30 border border-blue-700 rounded-md p-4 mb-4">
            <p className="text-gray-200 mb-2 font-semibold">
              Send this tweet to complete your purchase:
            </p>
            <div className="bg-gray-900 p-3 rounded-md">
              <p className="text-blue-400">{tweetText}</p>
            </div>
          </div>

          <a
            onClick={() => {
              setStartPolling(true);
            }}
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              tweetText
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <span>Open Twitter & Send Tweet</span>
            <Twitter className="h-5 w-5" />
          </a>
        </div>
        {startPolling && <FetchTweetData />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <Twitter className="h-6 w-6 text-blue-400" />
          <h3 className="text-lg font-semibold">
            Connect Your Twitter Account
          </h3>
        </div>

        <p className="text-gray-300 mb-4">
          Connect your Twitter account to complete the purchase process. You'll
          need to send a tweet to confirm your transaction.
        </p>
      </div>

      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleConnectTwitter}
        disabled={isConnecting}
      >
        <span>{isConnecting ? "Connecting..." : "Connect Twitter"}</span>
        {isConnecting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Twitter className="h-5 w-5" />
        )}
      </button>
    </div>
  );
} 
"use client";

import { useState } from "react";
import { CheckCircle, Loader2, Twitter } from "lucide-react";

export default function TwitterConnection() {
    const [username, setUsername] = useState<string>("");
    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [tweetText, setTweetText] = useState<string>("");

    const handleConnectTwitter = async () => {
        setIsConnecting(true);

        try {
            // In a real implementation, this would integrate with Twitter OAuth
            // For demo purposes, we'll just simulate the connection
            setTimeout(() => {
                setIsConnected(true);
                setIsConnecting(false);
                // Example tweet text
                const tokenAddress = "0x1234567890abcdef1234567890abcdef12345678";
                setTweetText(`@locker_money buy token: ${tokenAddress} amount: 100`);
            }, 1500);
        } catch (error) {
            console.error("Error connecting Twitter:", error);
            setIsConnecting(false);
        }
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    };

    if (isConnected) {
        return (
            <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                    <div className="flex items-center space-x-2 mb-4">
                        <Twitter className="h-6 w-6 text-blue-400" />
                        <h3 className="text-lg font-semibold">Twitter Connected!</h3>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>

                    <p className="text-gray-300 mb-4">
                        Your Twitter account <span className="font-bold text-blue-400">@{username}</span> has been connected.
                    </p>

                    <div className="bg-blue-900/30 border border-blue-700 rounded-md p-4 mb-4">
                        <p className="text-gray-200 mb-2 font-semibold">Send this tweet to complete your purchase:</p>
                        <div className="bg-gray-900 p-3 rounded-md">
                            <p className="text-blue-400">{tweetText}</p>
                        </div>
                    </div>

                    <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                        <span>Open Twitter & Send Tweet</span>
                        <Twitter className="h-5 w-5" />
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                <div className="flex items-center space-x-2 mb-4">
                    <Twitter className="h-6 w-6 text-blue-400" />
                    <h3 className="text-lg font-semibold">Connect Your Twitter Account</h3>
                </div>

                <p className="text-gray-300 mb-4">
                    Connect your Twitter account to complete the purchase process. You'll need to send a tweet to confirm your transaction.
                </p>

                <div className="mb-4">
                    <label htmlFor="twitter-username" className="block text-sm font-medium text-gray-300 mb-1">
                        Twitter Username
                    </label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-600 bg-gray-700 text-gray-400">
                            @
                        </span>
                        <input
                            type="text"
                            id="twitter-username"
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                            placeholder="username"
                            value={username}
                            onChange={handleUsernameChange}
                        />
                    </div>
                </div>
            </div>

            <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleConnectTwitter}
                disabled={isConnecting || !username.trim()}
            >
                <span>
                    {isConnecting ? "Connecting..." : "Connect Twitter"}
                </span>
                {isConnecting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <Twitter className="h-5 w-5" />
                )}
            </button>
        </div>
    );
} 
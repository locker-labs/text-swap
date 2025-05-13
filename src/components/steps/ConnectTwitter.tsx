"use client";

import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { initiateTwitterOAuth, getCurrentTwitterUser, TwitterUser } from "@/services/twitterOAuth";
import { useSearchParams } from "next/navigation";

export default function ConnectTwitter({
  setTwitterUser
}: {
  setTwitterUser: (user: TwitterUser | null) => void;
}) {
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const searchParams = useSearchParams();

    // Check for connection status and errors from search params
    useEffect(() => {
        // Check if we just completed a successful Twitter connection
        if (searchParams.get('twitter_connected') === 'true') {
            const user = getCurrentTwitterUser();
            if (user) {
                setTwitterUser(user);
            }
        }

        // Check for errors
        const error = searchParams.get('error');
        if (error) {
            console.error('Twitter connection error:', error);
            setIsConnecting(false);
        }
    }, [searchParams]);

    // Check for existing Twitter user on component mount
    useEffect(() => {
        const user = getCurrentTwitterUser();
        if (user) {
            setTwitterUser(user);
        }
    }, []);

    const handleConnectTwitter = async () => {
        setIsConnecting(true);
        try {
            await initiateTwitterOAuth();
        } catch (error) {
            console.error('Failed to connect Twitter:', error);
            setIsConnecting(false);
        }
    };


  return (
    <div className={`max-w-[545px] px-[40px] flex flex-col text-center items-center border-[2px] border-[#D3D3D3] rounded-lg shadow-md overflow-hidden`}>

        <h3 className="text-[#000000] mt-[20px] text-[26px] text-xl font-bold font-[Roboto]">
          Connect Twitter
        </h3>
        <p className="text-[#5D5D5D] mt-[12px] text-[16px] font-base font-[Roboto]">
          Link your Twitter account to register your username with
        </p>
        <p className="text-[#5D5D5D] text-[16px] font-base font-[Roboto]">
           your gator account
        </p>

        {/* Info card */}
        <div className="w-full mt-[20px] mx-[20px] p-[20px] border border-[#D6EAFD] bg-[#D6EAFD] rounded-lg text-left flex items-center justify-start">
          <Info color="#D6EAFD" fill="#1E90FF" className="mr-[12px]" />
          <p className="text-[#1E90FF] text-[16px] font-[Roboto]">
            Your will be redirected to Twitter to authorize access.
          </p>
        </div>

        <div className="w-full mt-[20px] mx-[20px] p-[20px] border border-[#D3D3D3] bg-[#ffffff] rounded-lg text-left">
          <p className="mb-[12px] text-[#000000] text-[20px] font-medium font-[Roboto]">Why connect your twitter?</p>
          <p className="mt-[6px] text-[#000000] text-[16px] font-base font-[Roboto]">✅  Verifies your Identity publicly</p>
          <p className="mt-[6px] text-[#000000] text-[16px] font-base font-[Roboto]">📢  Acts as Public Proof of Consent</p>
          <p className="mt-[6px] text-[#000000] text-[16px] font-base font-[Roboto]">🔒  Prevents Abuse & Sybil Attacks</p>
          <p className="mt-[6px] text-[#000000] text-[16px] font-base font-[Roboto]">⚙️  Triggers the On-Chain Action</p>
        </div>

        <button
          onClick={handleConnectTwitter}
          disabled={isConnecting}
          className="cursor-pointer mt-[32px] mb-[25px] w-full bg-[#4F46E5] text-[#FFFFFF] font-bold p-[14px] rounded-lg font-[Roboto] text-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? "Connecting..." : "Connect Twitter"}
        </button>
    </div>
  );
}

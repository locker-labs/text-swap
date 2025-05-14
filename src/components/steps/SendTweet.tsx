import { Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { TwitterUser } from "@/services/twitterOAuth";
import copy from 'clipboard-copy';
import FetchTweetData from "@/components/FetchTweetData";

export default function SendTweet({ twitterUser, setStartPolling, startPolling } : {
  twitterUser: TwitterUser | null;
  setStartPolling: React.Dispatch<React.SetStateAction<boolean>>;
  startPolling: boolean;
}) {
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const tokenAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
    const tweetText = `@locker_money buy token: ${tokenAddress} amount: 0.001`;

    return (<div>
      <div className={`max-w-[545px] px-[40px] flex flex-col text-center items-center border-[2px] border-[#D3D3D3] rounded-lg shadow-md overflow-hidden`}>

        <h3 className="text-[#000000] mt-[20px] text-[26px] text-xl font-bold font-[Roboto]">
          Tweet
        </h3>
        <p className="text-[#5D5D5D] mt-[12px] text-[16px] font-base font-[Roboto]">
          Send a tweet to complete your tokens purchase
        </p>

        {/* Info card */}
        <div className="w-full mt-[20px] mx-[20px] p-[20px] border border-[#D6EAFD] bg-[#D6EAFD] rounded-lg text-left">
          <p className="text-[#1E90FF] text-[16px] font-[Roboto]">
            Your Twitter account <strong>@{twitterUser?.username ?? 'username'}</strong> has been connected. Share a tweet with the required format below. Once verified, your transaction will be completed.
          </p>
        </div>

        <div className="w-full mt-[20px] mx-[20px] p-[20px] border border-[#D3D3D3] bg-[#ffffff] rounded-lg text-left">
          <p className="mb-[12px] text-[#000000] text-[20px] font-medium font-[Roboto]">Tweet format:</p>
          <div className="bg-[#F7F7F7] py-[10px] px-3 rounded-xl">
            <div onClick={isCopied ? (() => {}) : (() => {
                copy(tweetText).then(() => {
                    setIsCopied(true);
                    setStartPolling(true);
                    setTimeout(() => {
                        setIsCopied(false);
                    }, 2000);
                });
            })} className={`w-full flex items-center justify-end ${isCopied ? 'cursor-default' : 'cursor-pointer'}`}>
                {isCopied ? <CheckCircle size={16} color="#000000" /> : <Copy size={16} color="#000000" />}
            </div>
            <p className="text-black">{tweetText}</p>
          </div>
        </div>

        <a
            onClick={() => {
              setStartPolling(prev => !prev);
            }}
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              tweetText
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer mt-[32px] mb-[25px] w-full bg-[#4F46E5] text-[#FFFFFF] font-bold p-[14px] rounded-lg font-[Roboto] text-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Open Twitter & Send Tweet</span>
          </a>
      </div>

      {/* @dev for testing, replace twitterUser with !twitterUser */}
      {twitterUser && startPolling && <div className={`mt-[20px] max-w-[545px] p-[40px] flex flex-col text-center items-center border-[2px] border-[#D3D3D3] rounded-lg shadow-md overflow-hidden`}>
        <FetchTweetData userId={twitterUser.id} twitterUser={twitterUser} />
      </div>}
    </div>
    )
}
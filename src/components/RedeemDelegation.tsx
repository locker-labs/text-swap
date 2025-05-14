"use client"

import { TweetData } from "@/types/TweetData"
import { useState, useEffect } from "react";
import { Address, Hex } from "viem";
import { useSessionAccount } from "@/providers/SessionAccountProvider";
import { usePermissions } from "@/providers/PermissionProvider";
import { Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { config } from "@/config";
import { redeemDelegationsWithText, swapFromTwitter, redeemTransaction } from "@/utils/permissionHelpers";
import { TwitterUser } from "@/services/twitterOAuth";

let _count = 0;

export default function RedeemDelegation(props: TweetData & TwitterUser) {
    const { tokenAddress, tokenAmount, tweetId, id: tweetUserId, username: xHandle } = props;

    const { permission, smartAccount: delegatorAddress } = usePermissions();
    const [loading, setLoading] = useState(false);
    const [txHash, setTxHash] = useState<Hex | null>(null);

    const { createSessionAccount, sessionAccount } = useSessionAccount();
    console.log("sessionAccount in RedeemDelegation.tsx:", sessionAccount);

    if (!sessionAccount) {
        createSessionAccount();
    }

    const handleRedeemPermission = async () => {
    if (!permission) return;
    if (!sessionAccount) return;

    setLoading(true);
    try {
      const { accountMeta, context, signerMeta } = permission;
      console.log('context in RedeemDelegation.tsx:', context);
      console.log('accountMeta in RedeemDelegation.tsx:', accountMeta);
      console.log('signerMeta in RedeemDelegation.tsx:', signerMeta);

      if (!signerMeta) {
        console.error("No signer meta found");
        setLoading(false);
        return;
      }
      const { delegationManager } = signerMeta;


      if (accountMeta) {
        console.log("Deploying your gator account...");
        // a user op using sendUserOperationWithDelegation to deploy the account
        const firstUOHash = await redeemTransaction({
          sessionAccount,
          delegationManager: delegationManager as Address,
          context,
          accountMeta,
        });
        console.log("gator account deployment userOp Hash:", firstUOHash);
      }

      // Validate required parameters
      if (!context || !delegationManager) {
        console.error("Missing required parameters for delegation");
        setLoading(false);
        return;
      }

      console.log('swapFromTwitter inputs:', {
          sessionAccount,
          permissionData: permission,
          xHandle,
          tweetUserId,
          delegatorAddress: delegatorAddress!,
          tokenAddress,
          tokenAmount,
          tweetId
      })
      const redeemTxHash = await swapFromTwitter({
          sessionAccount,
          permissionData: permission,
          xHandle,
          tweetUserId,
          delegatorAddress: delegatorAddress!,
          tokenAddress,
          tokenAmount,
          tweetId
      });

      setTxHash(redeemTxHash);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

    // invoke handleRedeemPermission on component mount
    useEffect(() => {
        if (!_count) {
            _count++;
            handleRedeemPermission();
        }
    }, [])

    return (
      <div className="w-full space-y-4">
        {txHash && <div className="bg-green-800 border-2 border-green-600 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-white mb-2">
            Transaction Successful!
          </h3>
          <p className="text-gray-300 mb-4">
            Your transaction has been processed and confirmed on the blockchain.
          </p>

          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            onClick={() =>
              window.open(`${config.ethScanerUrl}/tx/${txHash}`, "_blank")
            }
          >
            <span>View on Etherscan</span>
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>}

        <div className="space-y-6">
          <button onClick={handleRedeemPermission} disabled={loading} className="w-full bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <span>
              {loading ? "Processing Transaction..." : "Redeem Delegation"}
            </span>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    );
}
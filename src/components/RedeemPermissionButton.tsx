"use client";

import { useState } from "react";
import { createPublicClient, Hex, http } from "viem";
import { sepolia } from "viem/chains";
import { pimlicoClient } from "@/services/pimlicoClient";
import { bundlerClient } from "@/services/bundlerClient";
import { useSessionAccount } from "@/providers/SessionAccountProvider";
import { usePermissions } from "@/providers/PermissionProvider";
import { Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { config } from "@/config";
import { redeemTransaction } from "@/utils/permissionHelpers";

export default function RedeemPermissionButton({
  tokenAddress,
  tokenAmount
} : {
  tokenAddress: Hex;
  tokenAmount: number;
}) {
  const { permission } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<Hex | null>(null);

  const { createSessionAccount, sessionAccount } = useSessionAccount();
  if (!sessionAccount) {
    createSessionAccount();
  }
  /**
   * Handles the redemption of delegation permissions.
   * Retrieves stored permission data, sends a user operation with delegation,
   * and updates the transaction hash state.
   * @returns {Promise<void>}
   */

  const handleRedeemPermission = async () => {
    if (!permission) return;
    if (!sessionAccount) return;

    setLoading(true);
    try {
      const { accountMeta, context, signerMeta } = permission;

      if (!signerMeta) {
        console.error("No signer meta found");
        setLoading(false);
        return;
      }
      const { delegationManager } = signerMeta;

      // Validate required parameters
      if (!context || !delegationManager) {
        console.error("Missing required parameters for delegation");
        setLoading(false);
        return;
      }

      const redeemTxHash = await redeemTransaction({
        sessionAccount,
        delegationManager,
        context,
        accountMeta,
        tokenAddress,
        tokenAmount
      });

      setTxHash(redeemTxHash);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (txHash) {
    return (
      <div className="space-y-4">
        <div className="bg-green-800 border-2 border-green-600 p-6 rounded-lg shadow-md">
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
        </div>

        <div className="space-y-6">
          <button
            className="w-full bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleRedeemPermission}
            disabled={loading}
          >
            <span>
              {loading ? "Processing Transaction..." : "Redeem Permission"}
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

  return (
    <div className="space-y-6">
      <button
        className="w-full bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleRedeemPermission}
        disabled={loading}
      >
        <span>
          {loading ? "Processing Transaction..." : "Redeem Permission"}
        </span>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <CheckCircle className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}

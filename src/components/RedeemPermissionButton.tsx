"use client";

import { useState } from "react";
import {
  createPublicClient,
  Hex,
  http,
  parseAbi,
  parseEther,
  zeroHash,
} from "viem";
import { pimlicoClient } from "@/services/pimlicoClient";
import { useSessionAccount } from "@/providers/SessionAccountProvider";
import { usePermissions } from "@/providers/PermissionProvider";
import { Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { config } from "@/config";
import { redeemTransaction } from "@/utils/permissionHelpers";

export default function RedeemPermissionButton() {
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
      // Encode redeemDelegations callData
      const redeemData =
        "0xe9ae5c53000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000678db9b1e94b5b69df7e401ddbede43491141047db30000000000000000000000000000000000000000000000000000000000000000cef6d2090000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000056000000000000000000000000000000000000000000000000000000000000005a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000005168b2570f9591684187ba04681ede95d4a3ad1c000000000000000000000000972b715e7c5db5be41c26f11be937fc0d275e163ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003c00000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000220000000000000000000000000d10b97905a320b13a0608f7e9cc506b56747df19000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000068213a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000099f2e9bf15ce5ec84685604836f71ab835dbbded00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001046bb45c8d673d4ea75321280db34899413c069000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000068228b80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000417c2fd1a2afd00623159ed06d1fd98d108211199f778183fab3f4ebeb1b2bf54325d2740d94475d261e6e8e08ccf5aeff830fbfd7656d2e92c7a4cfafb4af94d01b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000345168b2570f9591684187ba04681ede95d4a3ad1c00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000";
      const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();
      // const bumpedRedeemData = await bumpEthValue(
      //   redeemData,
      //   parseEther("0.000003").toString()
      // );
      // console.log("bumpedRedeemData", redeemData);

      // const mode = zeroHash;

      // const wrapperCalldata = wrapInExecute(sessionAccount.address, )
      // console.log("redeemData", wrapperCalldata);

      // const tx = await bundlerClient.sendUserOperation({
      //   account: sessionAccount,
      //   nonce: await sessionAccount.getNonce(),
      //   calls: [
      //     {
      //       to: sessionAccount.address,
      //       data: wrapperCalldata,
      //       value: 0n,
      //     },
      //   ],
      //   ...fee,
      // });
      // console.log("tx", tx);

      const redeemTxHash = await redeemTransaction(
        sessionAccount,
        delegationManager,
        context,
        accountMeta
      );
      console.log("redeemTxHash", redeemTxHash);

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

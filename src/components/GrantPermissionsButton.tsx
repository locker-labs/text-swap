"use client";

import { useState } from "react";
import { createClient, custom, parseEther } from "viem";
import { sepolia } from "viem/chains";
import { erc7715ProviderActions } from "@metamask/delegation-toolkit/experimental";
import { usePermissions } from "@/providers/PermissionProvider";
import { Loader2, CheckCircle } from "lucide-react";
import { useSessionAccount } from "@/providers/SessionAccountProvider";

export default function GrantPermissionsButton() {
  const { savePermission } = usePermissions();
  const { sessionAccount, createSessionAccount } = useSessionAccount();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Handles the permission granting process for native token streaming.
   *
   * This function:
   * 1. Creates a Viem client with ERC-7715 provider actions
   * 2. Sets up permission parameters including:
   *    - Chain ID (Sepolia testnet)
   *    - Expiry time (24 hours from current time)
   *    - Signer details (delegate address from env var)
   *    - Native token stream permission configuration
   * 3. Grants the permissions through the MetaMask snap
   * 4. Stores the granted permissions using the PermissionProvider
   * 5. Updates the application step
   *
   * @throws {Error} If delegate address is not configured
   * @async
   */
  const handleGrantPermissions = async () => {
    if (!sessionAccount) {
      createSessionAccount();
    }
    setIsLoading(true);

    try {
      const client = createClient({
        transport: custom(window.ethereum),
      }).extend(erc7715ProviderActions());

      const currentTime = Math.floor(Date.now() / 1000);
      const oneDayInSeconds = 24 * 60 * 60;
      const expiry = currentTime + oneDayInSeconds;

      const permissions = await client.grantPermissions([
        {
          chainId: sepolia.id,
          expiry,
          signer: {
            type: "account",
            data: {
              address: "0x3E1F92b36190E03DF15b22BA18EE3AbA958dF80E",
              // address: sessionAccount?.address as `0x${string}`,
            },
          },
          permission: {
            type: "native-token-stream",
            data: {
              initialAmount: 100n, // 1 WEI
              amountPerSecond: 100n, // 100 WEI per second
              startTime: currentTime,
              maxAmount: parseEther("0.001"), // 0.001 ETH
              justification:
                "Buy tokens on your behalf when you send verified messages from Twitter.",
            },
          },
        },
      ]);
      console.log("permissions:", permissions);
      savePermission(permissions[0]);
    } catch (error) {
      console.error("Error granting permissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="w-full cursor-pointer mt-[18px] mb-[25px] bg-[#4F46E5] hover:bg-blue-700 cursor-pointer text-white font-bold font-[Roboto] p-[14px] text-[16px] rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleGrantPermissions}
      disabled={isLoading}
    >
      <span>
        {isLoading ? "Granting Permissions..." : "Grant Permissions"}
      </span>
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <CheckCircle className="h-5 w-5" />
      )}
    </button>
  );
}

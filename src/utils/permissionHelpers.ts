import { MetaMaskSmartAccount } from "@metamask/delegation-toolkit";
import { bundlerClient } from "@/services/bundlerClient";
import { publicClient } from "@/services/publicClient";
import { pimlicoClient } from "@/services/pimlicoClient";
import { Hex } from "viem";



export const redeemTransaction = async (sessionAccount: MetaMaskSmartAccount, delegationManager: Hex, context: Hex, accountMeta: any) => {
    const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();
    const nonce = await sessionAccount.getNonce();
    const hash = await bundlerClient.sendUserOperationWithDelegation({
      publicClient,
      account: sessionAccount,
      nonce,
      calls: [
        {
          to: sessionAccount.address,
          data: "0x",
          value: 1n,
          permissionsContext: context,
          delegationManager,
        },
      ],
      ...fee,
      accountMetadata: accountMeta,
    });
    const { receipt } = await bundlerClient.waitForUserOperationReceipt({
        hash,
    });
    Object.defineProperty(sessionAccount, "getNonce", {
      value: async () => nonce + 1n,
      writable: true,
    });
    if (!await sessionAccount.isDeployed()) {
         Object.defineProperty(sessionAccount, "isDeployed", {
           value: async () => true,
           writable: true,
         });
    }
   
    return receipt.transactionHash;
    }
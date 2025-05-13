import { MetaMaskSmartAccount } from "@metamask/delegation-toolkit";
import { bundlerClient } from "@/services/bundlerClient";
import { publicClient } from "@/services/publicClient";
import { pimlicoClient } from "@/services/pimlicoClient";
import { Hex } from "viem";

import * as pkg from "@metamask/delegation-toolkit";
const { getDeleGatorEnvironment, toMetaMaskSmartAccount, Implementation, overrideDeployedEnvironment, createExecution, encodeExecutionCalldatas } = pkg;
import { http, createPublicClient, encodeFunctionData, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createBundlerClient } from "viem/account-abstraction";
import { sepolia as chain } from "viem/chains";
import { createPimlicoClient } from "permissionless/clients/pimlico";

import dotenv from "dotenv";
dotenv.config();

export async function redeemDelegationsWithText({
  sessionAccount,
  permissionData
}: {
  permissionData: any;
  sessionAccount: MetaMaskSmartAccount;
}) {

  // Encode handle string to bytes (hex)
  const handleBytes = stringToHex('locker_money');
  console.log("handleBytes:", handleBytes);

  const SINGLE_DEFAULT_MODE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  
  const redeemCalldata = encodeExecutionCalldatas([
      [createExecution(sessionAccount.address, 1n, "0x")]
  ])
  
  const redeemDelegationsWithText = encodeFunctionData({
      abi: [{
          name: 'redeemDelegationsWithText',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
              { name: 'handle', type: 'bytes' },
              { name: 'permissionContexts', type: 'bytes[]' },
              { name: 'modes', type: 'bytes32[]' },
              { name: 'calldatas', type: 'bytes[]' },
          ],
          outputs: []
      }],
      functionName: 'redeemDelegationsWithText',
      // todo fill in individual arguments
      args: [handleBytes, [permissionData.context as `0x${string}`], [SINGLE_DEFAULT_MODE], redeemCalldata]
  });
  
  
  const { fast: fee2 } = await pimlicoClient.getUserOperationGasPrice();
  const nonce2 = await sessionAccount.getNonce();
  
  
  const hash = await bundlerClient.sendUserOperation({
      account: sessionAccount,
      verificationGasLimit: 1_000_000n,
      nonce: nonce2,
      calls: [
          {
              to: sessionAccount.address,
              data: redeemDelegationsWithText,
              value: 0n,
          },
      ],
      ...fee2,
  });
  
  console.log("hash:", hash);
  
  const { receipt } = await bundlerClient.waitForUserOperationReceipt({
      hash,
  });
  
  console.log("receipt:", receipt);

  return hash;
}



export const redeemTransaction = async ({
  sessionAccount,
  delegationManager,
  context,
  accountMeta,
} : {
  sessionAccount: MetaMaskSmartAccount,
  delegationManager: Hex,
  context: Hex,
  accountMeta: any,
  tokenAddress: Hex,
  tokenAmount: number,
}) => {
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
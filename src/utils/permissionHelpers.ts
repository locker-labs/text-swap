import { MetaMaskSmartAccount } from "@metamask/delegation-toolkit";
import { bundlerClient } from "@/services/bundlerClient";
import { publicClient } from "@/services/publicClient";
import { pimlicoClient } from "@/services/pimlicoClient";
import { getReclaimClient } from "@/services/reclaimClient";
import { ReclaimClient } from '@reclaimprotocol/zk-fetch';
import { Address, Hex } from "viem";
import { transformForOnchain } from "@reclaimprotocol/js-sdk";
import * as pkg from "@metamask/delegation-toolkit";
const { getDeleGatorEnvironment, toMetaMaskSmartAccount, Implementation, overrideDeployedEnvironment, createExecution, encodeExecutionCalldatas } = pkg;
import { http, createPublicClient, encodeFunctionData, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createBundlerClient } from "viem/account-abstraction";
import { sepolia as chain } from "viem/chains";
import { createPimlicoClient } from "permissionless/clients/pimlico";

import dotenv from "dotenv";
dotenv.config();

const SOCIALDATA_API_KEY = process.env.NEXT_PUBLIC_SOCIALDATA_API_KEY;
if (!SOCIALDATA_API_KEY) {
    throw new Error("SOCIALDATA_API_KEY environment variable is required");
}

export const swapFromTwitter = async ({
  sessionAccount,
  permissionData,
  xHandle,
  tweetUserId,
  delegatorAddress,
  tokenAddress,
  tokenAmount,
  tweetId
} : {
  sessionAccount: MetaMaskSmartAccount,
  permissionData: any,
  delegationManager: Hex,
  xHandle: string,
  tweetUserId: string,
  delegatorAddress: Address,
  tokenAddress: Hex,
  tokenAmount: number,
  tweetId: string
}) => {

    // Encode handle string to bytes (hex)
    const handleBytes = stringToHex(xHandle);
    console.log("handleBytes:", handleBytes);

    const SINGLE_DEFAULT_MODE = "0x0000000000000000000000000000000000000000000000000000000000000000";

    const client = new ReclaimClient(process.env.NEXT_PUBLIC_RECLAIM_APP_ID!, process.env.NEXT_PUBLIC_RECLAIM_APP_SECRET!)

    const publicOptions = {
        method: 'GET', // or POST
        headers: {
            accept: 'application/json',
        }
    }

    const privateOptions = {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SOCIALDATA_API_KEY}`,
        }
    }

    // const getUserUrl = `https://api.socialdata.tools/twitter/user/${xHandle}`
    // const userResponse = await fetch(getUserUrl, publicOptions);
    // const user = await userResponse.json();
    // console.log('user:', user);

    const URL = `https://api.socialdata.tools/twitter/tweets/${tweetId}`
    const proof = await client.zkFetch(
        URL,
        publicOptions,
        privateOptions
    )
    console.log('proof:', proof);


    if (delegatorAddress !== permissionData.address) {
        throw new Error("Delegator address registered is not the same as the one in the permission data");
    }

    const swapAmount = BigInt(tokenAmount * 1e18);
    const redeemCalldata = encodeExecutionCalldatas([
        [createExecution(sessionAccount.address, swapAmount, "0x")]
    ])

    const onchainProof = transformForOnchain(proof!);
    console.log('onchainProof:', onchainProof);

    const txArgs = [onchainProof, tokenAddress, swapAmount, handleBytes, [permissionData.context as `0x${string}`], [SINGLE_DEFAULT_MODE], redeemCalldata]
    console.log('txArgs:', JSON.stringify(txArgs, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value, 2));
    const redeemDelegationsWithText = encodeFunctionData({
        abi: [{
            "inputs": [
                {
                    "components": [
                        {
                            "components": [
                                { "internalType": "string", "name": "provider", "type": "string" },
                                { "internalType": "string", "name": "parameters", "type": "string" },
                                { "internalType": "string", "name": "context", "type": "string" }
                            ],
                            "internalType": "struct Claims.ClaimInfo",
                            "name": "claimInfo",
                            "type": "tuple"
                        },
                        {
                            "components": [
                                {
                                    "components": [
                                        { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
                                        { "internalType": "address", "name": "owner", "type": "address" },
                                        { "internalType": "uint32", "name": "timestampS", "type": "uint32" },
                                        { "internalType": "uint32", "name": "epoch", "type": "uint32" }
                                    ],
                                    "internalType": "struct Claims.CompleteClaimData",
                                    "name": "claim",
                                    "type": "tuple"
                                },
                                { "internalType": "bytes[]", "name": "signatures", "type": "bytes[]" }
                            ],
                            "internalType": "struct Claims.SignedClaim",
                            "name": "signedClaim",
                            "type": "tuple"
                        }
                    ],
                    "internalType": "struct Reclaim.Proof",
                    "name": "proof",
                    "type": "tuple"
                },
                { "internalType": "address", "name": "tokenAddress", "type": "address" },
                { "internalType": "uint256", "name": "swapAmount", "type": "uint256" },
                { "internalType": "bytes", "name": "handle", "type": "bytes" },
                { "internalType": "bytes[]", "name": "_permissionContexts", "type": "bytes[]" },
                { "internalType": "ModeCode[]", "name": "_modes", "type": "bytes32[]" },
                { "internalType": "bytes[]", "name": "_executionCallDatas", "type": "bytes[]" }
            ],
            "name": "redeemDelegationsWithTextTemp2",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }],
        functionName: 'redeemDelegationsWithTextTemp2',
        // USDC address on Sepolia
        args: [onchainProof, tokenAddress, swapAmount, handleBytes, [permissionData.context as `0x${string}`], [SINGLE_DEFAULT_MODE], redeemCalldata]
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


export const swapFromTwitter2 = async ({
  sessionAccount,
  permissionData,
  xHandle,
  tweetUserId,
  delegatorAddress,
  tokenAddress,
  tokenAmount,
  tweetId
} : {
  sessionAccount: MetaMaskSmartAccount,
  permissionData: any,
  delegationManager: Hex,
  xHandle: string,
  tweetUserId: string,
  delegatorAddress: Address,
  tokenAddress: Hex,
  tokenAmount: number,
  tweetId: string
}) => {
    const minOut = BigInt(tokenAmount);
    // const minOut = BigInt(tokenAmount * 1e6);
    // Encode handle string to bytes (hex)
    const handleBytes = stringToHex(xHandle);
    console.log("handleBytes:", handleBytes);

    const SINGLE_DEFAULT_MODE = "0x0000000000000000000000000000000000000000000000000000000000000000";

    const client = getReclaimClient();

    const publicOptions = {
        method: 'GET', // or POST
        headers: {
            accept: 'application/json',
        }
    }

    const privateOptions = {
        headers: {
            'Authorization': `Bearer ${SOCIALDATA_API_KEY}`,
        }
    }

    // const getUserUrl = `https://api.socialdata.tools/twitter/user/${xHandle}`
    // const userResponse = await fetch(getUserUrl, publicOptions);
    // const user = await userResponse.json();
    // console.log('user:', user);

    const URL = `https://api.socialdata.tools/twitter/tweets/${tweetId}`
    const proof = await client.zkFetch(
        URL,
        publicOptions,
        privateOptions
    )
    console.log('proof:', proof);

    if (delegatorAddress !== permissionData.address) {
        throw new Error("Delegator address registered is not the same as the one in the permission data");
    }

    const redeemCalldata = encodeExecutionCalldatas([
        [createExecution(sessionAccount.address, minOut, "0x")]
    ])

    const onchainProof = transformForOnchain(proof!);
    console.log('onchainProof:', onchainProof);

    const redeemDelegationsWithText = encodeFunctionData({
        abi: [{
            "inputs": [
                {
                    "components": [
                        {
                            "components": [
                                { "internalType": "string", "name": "provider", "type": "string" },
                                { "internalType": "string", "name": "parameters", "type": "string" },
                                { "internalType": "string", "name": "context", "type": "string" }
                            ],
                            "internalType": "struct Claims.ClaimInfo",
                            "name": "claimInfo",
                            "type": "tuple"
                        },
                        {
                            "components": [
                                {
                                    "components": [
                                        { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
                                        { "internalType": "address", "name": "owner", "type": "address" },
                                        { "internalType": "uint32", "name": "timestampS", "type": "uint32" },
                                        { "internalType": "uint32", "name": "epoch", "type": "uint32" }
                                    ],
                                    "internalType": "struct Claims.CompleteClaimData",
                                    "name": "claim",
                                    "type": "tuple"
                                },
                                { "internalType": "bytes[]", "name": "signatures", "type": "bytes[]" }
                            ],
                            "internalType": "struct Claims.SignedClaim",
                            "name": "signedClaim",
                            "type": "tuple"
                        }
                    ],
                    "internalType": "struct Reclaim.Proof",
                    "name": "proof",
                    "type": "tuple"
                },
                { "internalType": "address", "name": "tokenAddress", "type": "address" },
                { "internalType": "uint256", "name": "minOut", "type": "uint256" },
                { "internalType": "bytes", "name": "handle", "type": "bytes" },
                { "internalType": "bytes[]", "name": "_permissionContexts", "type": "bytes[]" },
                { "internalType": "ModeCode[]", "name": "_modes", "type": "bytes32[]" },
                { "internalType": "bytes[]", "name": "_executionCallDatas", "type": "bytes[]" }
            ],
            "name": "redeemDelegationsWithTextTemp2",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }],
        functionName: 'redeemDelegationsWithTextTemp2',
        // USDC address on Sepolia
        args: [onchainProof, tokenAddress, minOut, handleBytes, [permissionData.context as `0x${string}`], [SINGLE_DEFAULT_MODE], redeemCalldata]
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
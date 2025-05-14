import { MetaMaskSmartAccount } from "@metamask/delegation-toolkit";
import { bundlerClient } from "@/services/bundlerClient";
import { publicClient } from "@/services/publicClient";
import { pimlicoClient } from "@/services/pimlicoClient";
import { Address, Hex } from "viem";
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

    // dummy proof
    let onchainProof = {
  claimInfo: {
    context: '{"extractedParameters":{"data":"5d2\\r\\n{\\"tweet_created_at\\":\\"2025-05-14T00:22:48.000000Z\\",\\"id\\":1922447468689547734,\\"id_str\\":\\"1922447468689547734\\",\\"type\\":\\"tweet\\",\\"conversation_id_str\\":\\"1922447468689547734\\",\\"community_id_str\\":null,\\"community_name\\":null,\\"text\\":null,\\"full_text\\":\\"buy token: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238 ethAmount: 0.0001 @locker_money\\",\\"source\\":\\"<a href=\\\\\\"https:\\\\/\\\\/mobile.twitter.com\\\\\\" rel=\\\\\\"nofollow\\\\\\">Twitter Web App<\\\\/a>\\",\\"truncated\\":false,\\"in_reply_to_status_id\\":null,\\"in_reply_to_status_id_str\\":null,\\"in_reply_to_user_id\\":null,\\"in_reply_to_user_id_str\\":null,\\"in_reply_to_screen_name\\":null,\\"user\\":{\\"id\\":321867505,\\"id_str\\":\\"321867505\\",\\"name\\":\\"Michael Nivram\\",\\"screen_name\\":\\"mamemia\\",\\"location\\":\\"Africa\\",\\"url\\":null,\\"description\\":\\"You know what I mean\\",\\"protected\\":false,\\"verified\\":false,\\"followers_count\\":27,\\"friends_count\\":3,\\"listed_count\\":0,\\"favourites_count\\":1,\\"statuses_count\\":40,\\"created_at\\":\\"2011-06-22T08:02:11.000000Z\\",\\"profile_banner_url\\":null,\\"profile_image_url_https\\":\\"https:\\\\/\\\\/abs.twimg.com\\\\/sticky\\\\/default_profile_images\\\\/default_profile_normal.png\\",\\"can_dm\\":false},\\"quoted_status_id\\":null,\\"quoted_status_id_str\\":null,\\"is_quote_status\\":false,\\"quoted_status\\":null,\\"retweeted_status\\":null,\\"quote_count\\":0,\\"reply_count\\":0,\\"retweet_count\\":0,\\"favorite_count\\":0,\\"views_count\\":5,\\"bookmark_count\\":0,\\"lang\\":\\"en\\",\\"entities\\":{\\"user_mentions\\":[{\\"id_str\\":\\"1772791634394075136\\",\\"name\\":\\"Locker\\",\\"screen_name\\":\\"locker_money\\",\\"indices\\":[72,85]}],\\"urls\\":[],\\"hashtags\\":[],\\"symbols\\":[]},\\"is_pinned\\":false}\\r\\n0\\r\\n\\r\\n"},"providerHash":"0x271b2bb1c653ddac4e092024a460842afa4694ff4054d48aaa31e9f7bf10512f"}',
    parameters: '{"body":"","headers":{"User-Agent":"reclaim/0.0.1","accept":"application/json"},"method":"GET","responseMatches":[{"type":"regex","value":"(?<data>.*)"}],"responseRedactions":[],"url":"https://api.socialdata.tools/twitter/tweets/1922447468689547734"}',
    provider: 'http'
  },
  signedClaim: {
    claim: {
      epoch: 1,
      identifier: '0xe5ed9d4243707a3b9bdc61a787b1eb3660552f1cd690100b4122e95344d669dd' as `0x${string}`,
      owner: '0x7349853215c3753b3dfeb06df79e2c0d22e7a5a3' as `0x${string}`,
      timestampS: 1747194355
    },
    signatures: [
      '0x32eddde26a9a906446619f81914a15fe610d92dd774298f1f6e6c027f2c4023f62e6b384624beb82f1cb2d9be6fcb5e45d968da51c79fa361651f482607c3a9e1c'
    ] as `0x${string}`[]
  }
};
    // TODO: @marvin

    // try {
    //     const externalResponse = await fetch(`/api/reclaim/${tweetId}`, {
    //         method: 'GET',
    //     });
    //     if (!externalResponse.ok) {
    //         throw new Error(`Failed to fetch proof from server API`);
    //     }

    //     const data = await externalResponse.json();
    //     proof = data.data.proof;
    //     onchainProof = data.data.onchainProof;
    //     console.log('proof:', proof);
    //     console.log('onchainProof:', onchainProof);
    // } catch(e) {
    //     throw new Error(`Failed to fetch proof from server API: ${e}`);
    // }


    if (delegatorAddress !== permissionData.address) {
        throw new Error("Delegator address registered is not the same as the one in the permission data");
    }

    const swapAmount = BigInt(tokenAmount * 1e18);
    const redeemCalldata = encodeExecutionCalldatas([
        [createExecution(sessionAccount.address, swapAmount, "0x")]
    ])

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


// export const swapFromTwitter2 = async ({
//   sessionAccount,
//   permissionData,
//   xHandle,
//   tweetUserId,
//   delegatorAddress,
//   tokenAddress,
//   tokenAmount,
//   tweetId
// } : {
//   sessionAccount: MetaMaskSmartAccount,
//   permissionData: any,
//   delegationManager: Hex,
//   xHandle: string,
//   tweetUserId: string,
//   delegatorAddress: Address,
//   tokenAddress: Hex,
//   tokenAmount: number,
//   tweetId: string
// }) => {
//     const minOut = BigInt(tokenAmount);
//     // const minOut = BigInt(tokenAmount * 1e6);
//     // Encode handle string to bytes (hex)
//     const handleBytes = stringToHex(xHandle);
//     console.log("handleBytes:", handleBytes);

//     const SINGLE_DEFAULT_MODE = "0x0000000000000000000000000000000000000000000000000000000000000000";

//     const publicOptions = {
//         method: 'GET', // or POST
//         headers: {
//             accept: 'application/json',
//         }
//     }

//     const privateOptions = {
//         headers: {
//             'Authorization': `Bearer ${SOCIALDATA_API_KEY}`,
//         }
//     }

//     // const getUserUrl = `https://api.socialdata.tools/twitter/user/${xHandle}`
//     // const userResponse = await fetch(getUserUrl, publicOptions);
//     // const user = await userResponse.json();
//     // console.log('user:', user);

//     const URL = `https://api.socialdata.tools/twitter/tweets/${tweetId}`
//     const proof = await client.zkFetch(
//         URL,
//         publicOptions,
//         privateOptions
//     )
//     console.log('proof:', proof);

//     if (delegatorAddress !== permissionData.address) {
//         throw new Error("Delegator address registered is not the same as the one in the permission data");
//     }

//     const redeemCalldata = encodeExecutionCalldatas([
//         [createExecution(sessionAccount.address, minOut, "0x")]
//     ])

//     const onchainProof = transformForOnchain(proof!);
//     console.log('onchainProof:', onchainProof);

//     const redeemDelegationsWithText = encodeFunctionData({
//         abi: [{
//             "inputs": [
//                 {
//                     "components": [
//                         {
//                             "components": [
//                                 { "internalType": "string", "name": "provider", "type": "string" },
//                                 { "internalType": "string", "name": "parameters", "type": "string" },
//                                 { "internalType": "string", "name": "context", "type": "string" }
//                             ],
//                             "internalType": "struct Claims.ClaimInfo",
//                             "name": "claimInfo",
//                             "type": "tuple"
//                         },
//                         {
//                             "components": [
//                                 {
//                                     "components": [
//                                         { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
//                                         { "internalType": "address", "name": "owner", "type": "address" },
//                                         { "internalType": "uint32", "name": "timestampS", "type": "uint32" },
//                                         { "internalType": "uint32", "name": "epoch", "type": "uint32" }
//                                     ],
//                                     "internalType": "struct Claims.CompleteClaimData",
//                                     "name": "claim",
//                                     "type": "tuple"
//                                 },
//                                 { "internalType": "bytes[]", "name": "signatures", "type": "bytes[]" }
//                             ],
//                             "internalType": "struct Claims.SignedClaim",
//                             "name": "signedClaim",
//                             "type": "tuple"
//                         }
//                     ],
//                     "internalType": "struct Reclaim.Proof",
//                     "name": "proof",
//                     "type": "tuple"
//                 },
//                 { "internalType": "address", "name": "tokenAddress", "type": "address" },
//                 { "internalType": "uint256", "name": "minOut", "type": "uint256" },
//                 { "internalType": "bytes", "name": "handle", "type": "bytes" },
//                 { "internalType": "bytes[]", "name": "_permissionContexts", "type": "bytes[]" },
//                 { "internalType": "ModeCode[]", "name": "_modes", "type": "bytes32[]" },
//                 { "internalType": "bytes[]", "name": "_executionCallDatas", "type": "bytes[]" }
//             ],
//             "name": "redeemDelegationsWithTextTemp2",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         }],
//         functionName: 'redeemDelegationsWithTextTemp2',
//         // USDC address on Sepolia
//         args: [onchainProof, tokenAddress, minOut, handleBytes, [permissionData.context as `0x${string}`], [SINGLE_DEFAULT_MODE], redeemCalldata]
//     });


//     const { fast: fee2 } = await pimlicoClient.getUserOperationGasPrice();
//     const nonce2 = await sessionAccount.getNonce();


//     const hash = await bundlerClient.sendUserOperation({
//         account: sessionAccount,
//         verificationGasLimit: 1_000_000n,
//         nonce: nonce2,
//         calls: [
//             {
//                 to: sessionAccount.address,
//                 data: redeemDelegationsWithText,
//                 value: 0n,
//             },
//         ],
//         ...fee2,
//     });

//     console.log("hash:", hash);

//     const { receipt } = await bundlerClient.waitForUserOperationReceipt({
//         hash,
//     });

//     console.log("receipt:", receipt);

//     return hash;
// }

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
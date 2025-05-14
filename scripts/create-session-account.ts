import pkg from "@metamask/delegation-toolkit";
const { getDeleGatorEnvironment, toMetaMaskSmartAccount, Implementation, overrideDeployedEnvironment, createExecution, encodeExecutionCalldatas } = pkg;
import { http, createPublicClient, encodeFunctionData, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createBundlerClient } from "viem/account-abstraction";
import { sepolia as chain } from "viem/chains";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { ReclaimClient } from '@reclaimprotocol/zk-fetch';

import dotenv from "dotenv";
import { transformForOnchain } from "@reclaimprotocol/js-sdk";
dotenv.config();

const hybridDeleGatorImpl = '0xeAd4199Df434b147c29fF4B1e4E399407C42a2Fa'
const xHandle = "mamemia"
// MetaMask snap delegator address
const delegatorAddress = '0x2E6c29b8E392bcF37aEc500B619EdCacF41Ff0Bf';

const permissionData = {
    "chainId": "0xaa36a7",
    "address": "0x2E6c29b8E392bcF37aEc500B619EdCacF41Ff0Bf",
    "expiry": 1747267200,
    "isAdjustmentAllowed": true,
    "signer": {
        "type": "account",
        "data": {
            "address": "0x4E0adBA468695cF32D2e8A06ba85aa738d909261"
        }
    },
    "permission": {
        "type": "native-token-stream",
        "data": {
            "maxAmount": "0x38d7ea4c68000",
            "amountPerSecond": "0x3d986caee",
            "initialAmount": "0x64",
            "startTime": 1747180800,
            "justification": "Buy tokens on your behalf when you send verified messages from Twitter."
        }
    },
    "context": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000004e0adba468695cf32d2e8a06ba85aa738d9092610000000000000000000000002e6c29b8e392bcf37aec500b619edcacf41ff0bfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003c00000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000220000000000000000000000000d10b97905a320b13a0608f7e9cc506b56747df19000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000000003d986caee000000000000000000000000000000000000000000000000000000006823dd00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000099f2e9bf15ce5ec84685604836f71ab835dbbded00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001046bb45c8d673d4ea75321280db34899413c069000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000068252e8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041eadf5e1c7642a1b2a55fb7eee6e21020db962a64bfc8a0dd884b886e6dadf24b25db4026bc9a2d2c126844b7bd184a419e2bf0421532f2a5aeef0f1ee5febd131b00000000000000000000000000000000000000000000000000000000000000",
    "signerMeta": {
        "delegationManager": "0xdb9B1e94B5b69Df7e401DDbedE43491141047dB3"
    }
}


// Resolves the DeleGatorEnvironment for Linea Sepolia
const sepoliaChainId = 11155111
const deploySalt = "0x";
const privateKey = process.env.PRIVATE_KEY;
const SINGLE_DEFAULT_MODE = "0x0000000000000000000000000000000000000000000000000000000000000000";

if (!privateKey) {
    throw new Error("PRIVATE_KEY environment variable is required");
}


const environment = getDeleGatorEnvironment(sepoliaChainId);
// console.log("Environment: ", environment);

const customEnv: any = { ...environment, implementations: { ...environment.implementations, HybridDeleGatorImpl: hybridDeleGatorImpl }, }
// console.log("customEnv: ", customEnv);

export const publicClient = createPublicClient({
    transport: http(),
    chain,
});

export const owner = privateKeyToAccount(privateKey as `0x${string}`);

const smartAccountOg = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [owner.address, [], [], []],
    deploySalt,
    signatory: { account: owner },
});

console.log("smartAccountOg:", smartAccountOg.address);

// Now override the environment to use the custom implementation
overrideDeployedEnvironment(
    sepoliaChainId,
    "1.3.0",
    customEnv,
);

const smartAccountCustom = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [owner.address, [], [], []],
    deploySalt,
    signatory: { account: owner },
});

console.log("smartAccountCustom:", smartAccountCustom.address);


const rpcUrl = `https://public.pimlico.io/v2/${sepoliaChainId}/rpc?apikey=${process.env.PIMLICO_API_KEY}`;
export const bundlerClient = createBundlerClient({
    transport: http(rpcUrl)
});

const pimlicoClient = createPimlicoClient({
    transport: http(rpcUrl),
});

// Encode handle string to bytes (hex)
const handleBytes = stringToHex(xHandle);
console.log("handleBytes:", handleBytes);

const registerHandle = async () => {
    const setHandleDelegatorAddressData = encodeFunctionData({
        abi: [{
            name: 'setHandleDelegatorAddress',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'handle', type: 'bytes' },
                { name: 'delegatorAddress', type: 'address' }
            ],
            outputs: []
        }],
        functionName: 'setHandleDelegatorAddress',
        args: [handleBytes, delegatorAddress]
    });

    const data = setHandleDelegatorAddressData;
    console.log("data:", data);

    const nonce = await smartAccountCustom.getNonce();

    const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();
    console.log("fee:", fee);

    const userOperationHash = await bundlerClient.sendUserOperation({
        account: smartAccountCustom,
        verificationGasLimit: 500_000n,
        nonce,
        calls: [
            {
                to: smartAccountCustom.address,
                data,
                value: 0n
            }
        ],
        ...fee
    });

    console.log("User Operation Hash:", userOperationHash);

    const { receipt } = await bundlerClient.waitForUserOperationReceipt({
        hash: userOperationHash,
    });

    console.log("receipt:", receipt);
}

const redeemDelegation = async () => {

    if (delegatorAddress !== permissionData.address) {
        throw new Error("Delegator address registered is not the same as the one in the permission data");
    }

    const redeemCalldata = encodeExecutionCalldatas([
        [createExecution(smartAccountCustom.address, 1n, "0x")]
    ])

    const redeemDelegationsWithText = encodeFunctionData({
        abi: [{
            name: 'redeemDelegationsWithTextTemp',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'tokenAddress', type: 'address' },
                { name: 'minOut', type: 'uint256' },
                { name: 'handle', type: 'bytes' },
                { name: 'permissionContexts', type: 'bytes[]' },
                { name: 'modes', type: 'bytes32[]' },
                { name: 'calldatas', type: 'bytes[]' },
            ],
            outputs: []
        }],
        functionName: 'redeemDelegationsWithTextTemp',
        // USDC address on Sepolia
        args: ["0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", 1n, handleBytes, [permissionData.context as `0x${string}`], [SINGLE_DEFAULT_MODE], redeemCalldata]
    });


    const { fast: fee2 } = await pimlicoClient.getUserOperationGasPrice();
    const nonce2 = await smartAccountCustom.getNonce();


    const hash = await bundlerClient.sendUserOperation({
        account: smartAccountCustom,
        verificationGasLimit: 1_000_000n,
        nonce: nonce2,
        calls: [
            {
                to: smartAccountCustom.address,
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
}

const swapFromTwitter = async () => {
    const client = new ReclaimClient(process.env.RECLAIM_APP_ID!, process.env.RECLAIM_APP_SECRET!)

    const publicOptions = {
        method: 'GET', // or POST
        headers: {
            accept: 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SOCIALDATA_API_KEY}`,
        }
    }

    // const getUserUrl = `https://api.socialdata.tools/twitter/user/${xHandle}`
    // const userResponse = await fetch(getUserUrl, publicOptions);
    // const user = await userResponse.json();
    // console.log('user:', user);

    const URL = `https://api.socialdata.tools/twitter/tweets/1922447468689547734`
    const proof = await client.zkFetch(
        URL,
        publicOptions
    )
    console.log('proof:', proof);


    if (delegatorAddress !== permissionData.address) {
        throw new Error("Delegator address registered is not the same as the one in the permission data");
    }

    const redeemCalldata = encodeExecutionCalldatas([
        [createExecution(smartAccountCustom.address, 1n, "0x")]
    ])

    const onchainProof = transformForOnchain(proof!);

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
            "name": "redeemDelegationsWithText",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }],
        functionName: 'redeemDelegationsWithText',
        // USDC address on Sepolia
        args: [onchainProof, "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", 1n, handleBytes, [permissionData.context as `0x${string}`], [SINGLE_DEFAULT_MODE], redeemCalldata]
    });


    const { fast: fee2 } = await pimlicoClient.getUserOperationGasPrice();
    const nonce2 = await smartAccountCustom.getNonce();


    const hash = await bundlerClient.sendUserOperation({
        account: smartAccountCustom,
        verificationGasLimit: 1_000_000n,
        nonce: nonce2,
        calls: [
            {
                to: smartAccountCustom.address,
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
}

// await registerHandle();
// await redeemDelegation();
await swapFromTwitter();

console.log('exiting...')
process.exit(0)
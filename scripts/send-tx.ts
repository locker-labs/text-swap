import { http, createPublicClient, createWalletClient, stringToHex, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import dotenv from "dotenv";
import { ReclaimClient } from '@reclaimprotocol/zk-fetch';
import { transformForOnchain } from "@reclaimprotocol/js-sdk";
import pkg from "@metamask/delegation-toolkit";
const { createExecution, encodeExecutionCalldatas } = pkg;

dotenv.config();

// Constants from create-session-account.ts (or define as needed)
const xHandle = "mamemia";
const delegatorAddress = '0x2E6c29b8E392bcF37aEc500B619EdCacF41Ff0Bf'; // MetaMask snap delegator address
const permissionData = {
    "chainId": "0xaa36a7",
    "address": "0x2E6c29b8E392bcF37aEc500B619EdCacF41Ff0Bf",
    "expiry": 1747267200,
    "isAdjustmentAllowed": true,
    "signer": {
        "type": "account",
        "data": {
            "address": "0x2832DEA5c41B3301294BC430b0A7b05D5f00Bd39"
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
    "context": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000a5bb6bda490214a5fd356873f0d052490d6ee1e50000000000000000000000002e6c29b8e392bcf37aec500b619edcacf41ff0bfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003c00000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000220000000000000000000000000d10b97905a320b13a0608f7e9cc506b56747df19000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000000003d986caee000000000000000000000000000000000000000000000000000000006823dd00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000099f2e9bf15ce5ec84685604836f71ab835dbbded00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001046bb45c8d673d4ea75321280db34899413c069000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000068252e8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041e0e00d9795229228613589b7a7c9498d5f5f252783bd31e8015aed8efb565eb325ab65a3c61c29656a051c86f8a3219c41af84d3a2610c898bfe0a1c314dc0291b00000000000000000000000000000000000000000000000000000000000000" as Hex,
    "signerMeta": {
        "delegationManager": "0xdb9B1e94B5b69Df7e401DDbedE43491141047dB3" as Hex
    }
};
const SINGLE_DEFAULT_MODE = "0x0000000000000000000000000000000000000000000000000000000000000000" as Hex;

const main = async () => {
    const privateKey = process.env.PRIVATE_KEY as Hex | undefined;
    if (!privateKey) {
        throw new Error("PRIVATE_KEY environment variable is not set.");
    }

    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    if (!rpcUrl) {
        throw new Error("NEXT_PUBLIC_RPC_URL environment variable is not set.");
    }

    const account = privateKeyToAccount(privateKey);

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(rpcUrl),
    });

    const walletClient = createWalletClient({
        account,
        chain: sepolia,
        transport: http(rpcUrl),
    });

    const contractAddress = "0xA5bB6BDA490214A5fD356873F0d052490D6eE1e5" as Hex;

    const abi = [{
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
    }] as const;

    // --- Dynamically compute arguments ---
    const reclaimAppId = process.env.RECLAIM_APP_ID;
    const reclaimAppSecret = process.env.RECLAIM_APP_SECRET;

    if (!reclaimAppId) {
        throw new Error("RECLAIM_APP_ID environment variable is not set.");
    }
    // RECLAIM_APP_SECRET might be optional for some ReclaimClient use cases, but if zkFetch needs it, it should be checked.
    // For now, assuming it might be optional or handled if only appId is passed for zkFetch based on create-session-account snippet.
    // If zkFetch strictly requires it, this check should be enforced:
    if (!reclaimAppSecret) {
        throw new Error("RECLAIM_APP_SECRET environment variable is not set (required for ReclaimClient).");
    }

    const reclaimClient = new ReclaimClient(reclaimAppId, reclaimAppSecret);

    const publicOptions = {
        method: 'GET',
        headers: { accept: 'application/json' }
    };
    const privateOptions = {
        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SOCIALDATA_API_KEY}` }
    };
    const twitterApiUrl = `https://api.socialdata.tools/twitter/tweets/1922447468689547734`; // Hardcoded URL from create-session-account

    console.log("Fetching ZK proof...");
    const zkProof = await reclaimClient.zkFetch(twitterApiUrl, publicOptions, privateOptions);
    console.log('Raw zkProof:', zkProof);

    if (!zkProof) {
        throw new Error("Failed to fetch ZK proof.");
    }
    const onchainProof = transformForOnchain(zkProof);
    console.log('Onchain proof:', onchainProof);

    const handleBytes = stringToHex(xHandle);
    console.log("handleBytes:", handleBytes);

    // Use contractAddress for the target in createExecution, as this script sends to contractAddress
    const executionTargetAddress = contractAddress;
    const redeemCalldata = encodeExecutionCalldatas([
        [createExecution(executionTargetAddress, 1n, "0x")]
    ]);
    console.log("Redeem calldata:", redeemCalldata);

    if (delegatorAddress !== permissionData.address) {
        throw new Error("Delegator address in script constants does not match permissionData.address");
    }

    const tokenAddressArg = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as Hex;
    const minOutArg = 1n;
    const permissionContextsArg = [permissionData.context as Hex];
    const modesArg = [SINGLE_DEFAULT_MODE];

    const txArgs = [
        onchainProof,
        tokenAddressArg,
        minOutArg,
        handleBytes,
        permissionContextsArg,
        modesArg,
        redeemCalldata
    ] as const;
    // --- End dynamic arguments computation ---

    try {
        console.log("Sending transaction with dynamically computed args:", JSON.stringify(txArgs, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value, 2
        ));

        const hash = await walletClient.writeContract({
            address: contractAddress,
            abi,
            functionName: "redeemDelegationsWithText",
            args: txArgs,
        });

        console.log("Transaction sent. Hash:", hash);

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log("Transaction receipt:", receipt);

    } catch (error) {
        console.error("Error sending transaction:", error);
    }
};

main().catch(console.error);

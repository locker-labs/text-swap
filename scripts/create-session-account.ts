import pkg from "@metamask/delegation-toolkit";
const { getDeleGatorEnvironment, toMetaMaskSmartAccount, Implementation, overrideDeployedEnvironment, createExecution, encodeExecutionCalldatas } = pkg;
import { http, createPublicClient, encodeFunctionData, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createBundlerClient } from "viem/account-abstraction";
import { sepolia as chain } from "viem/chains";
import { createPimlicoClient } from "permissionless/clients/pimlico";

import dotenv from "dotenv";
dotenv.config();

const hybridDeleGatorImpl = '0x1B8051a47CEd2D018b19b5888FC9E8c384D3229A'
const xHandle = "mamemia"
// MetaMask snap delegator address
const delegatorAddress = '0x2E6c29b8E392bcF37aEc500B619EdCacF41Ff0Bf';

const permissionData = {
    "chainId": "0xaa36a7",
    "address": "0x2E6c29b8E392bcF37aEc500B619EdCacF41Ff0Bf",
    "expiry": 1747180800,
    "isAdjustmentAllowed": true,
    "signer": {
        "type": "account",
        "data": {
            "address": "0x798A5b29E92a052Bb16E32b93b6B6ae48F820c65"
        }
    },
    "permission": {
        "type": "native-token-stream",
        "data": {
            "maxAmount": "0x38d7ea4c68000",
            "amountPerSecond": "0x3d986caee",
            "initialAmount": "0x64",
            "startTime": 1747094400,
            "justification": "Buy tokens on your behalf when you send verified messages from Twitter."
        }
    },
    "context": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000798a5b29e92a052bb16e32b93b6b6ae48f820c650000000000000000000000002e6c29b8e392bcf37aec500b619edcacf41ff0bfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003c00000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000220000000000000000000000000d10b97905a320b13a0608f7e9cc506b56747df19000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000000003d986caee0000000000000000000000000000000000000000000000000000000068228b80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000099f2e9bf15ce5ec84685604836f71ab835dbbded00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001046bb45c8d673d4ea75321280db34899413c069000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000006823dd00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000416ccbcf18a91e177a8891e16e953a5bd45b2c3a1b6f2f52fa28f0dee9742b91af7afd38a616336b1fbfff170ab93f9c75fd5a5472bb6b64c4c796ce6d5af9fcd11c00000000000000000000000000000000000000000000000000000000000000",
    "signerMeta": {
        "delegationManager": "0xdb9B1e94B5b69Df7e401DDbedE43491141047dB3"
    }
}


// Resolves the DeleGatorEnvironment for Linea Sepolia
const sepoliaChainId = 11155111
const deploySalt = "0x";
const privateKey = process.env.PRIVATE_KEY;

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

    const SINGLE_DEFAULT_MODE = "0x0000000000000000000000000000000000000000000000000000000000000000";


    const redeemCalldata = encodeExecutionCalldatas([
        [createExecution(smartAccountCustom.address, 1n, "0x")]
    ])

    const redeemDelegationsWithText = encodeFunctionData({
        abi: [{
            name: 'redeemDelegationsWithText',
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
        functionName: 'redeemDelegationsWithText',
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

// await registerHandle();
await redeemDelegation();

console.log('exiting...')
process.exit(0)
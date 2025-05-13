import pkg from "@metamask/delegation-toolkit";
const { getDeleGatorEnvironment, toMetaMaskSmartAccount, Implementation, overrideDeployedEnvironment } = pkg;
import { http, createPublicClient, encodeFunctionData, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createBundlerClient } from "viem/account-abstraction";
import { sepolia as chain } from "viem/chains";
import { createPimlicoClient } from "permissionless/clients/pimlico";

import dotenv from "dotenv";
dotenv.config();

// Resolves the DeleGatorEnvironment for Linea Sepolia
const sepoliaChainId = 11155111
const hybridDeleGatorImpl = '0x79EbfdDD65796a0ac72707C62724010b30047C11';

const deploySalt = "0x";
const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;

if (!privateKey) {
    throw new Error("NEXT_PUBLIC_PRIVATE_KEY environment variable is required");
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
const handleBytes = stringToHex('locker_money');
console.log("handleBytes:", handleBytes);

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
    args: [handleBytes, '0x2E6c29b8E392bcF37aEc500B619EdCacF41Ff0Bf']
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
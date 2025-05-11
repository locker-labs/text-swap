import pkg from "@metamask/delegation-toolkit";
const { getDeleGatorEnvironment, toMetaMaskSmartAccount, Implementation } = pkg;
import { http, createPublicClient, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createBundlerClient } from "viem/account-abstraction";
import { sepolia as chain } from "viem/chains";
import { createPimlicoClient } from "permissionless/clients/pimlico";

import dotenv from "dotenv";
import { overrideDeployedEnvironment } from "@metamask/delegation-toolkit";
import { DeleGatorEnvironment } from "@metamask/delegation-toolkit";
dotenv.config();

// Resolves the DeleGatorEnvironment for Linea Sepolia
const sepoliaChainId = 11155111
const hybridDeleGatorImpl = '0x18948C8caD3092f24421f7563143377f8c2124bA'
const deploySalt = "0x";
const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
    throw new Error("PRIVATE_KEY environment variable is required");
}

console.log("privateKey: ", privateKey);

const environment = getDeleGatorEnvironment(sepoliaChainId);
console.log("Environment: ", environment);

const customEnv = { ...environment, implementations: { ...environment.implementations, HybridDeleGatorImpl: hybridDeleGatorImpl }, }
console.log("customEnv: ", customEnv);

export const publicClient = createPublicClient({
    transport: http(),
    chain,
});

const delegatorEnvironment: DeleGatorEnvironment = overrideDeployedEnvironment(
    sepoliaChainId,
    "1.3.0",
    environment,
);

export const owner = privateKeyToAccount(privateKey as `0x${string}`);

const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [owner.address, [], [], []],
    deploySalt,
    signatory: { account: owner },
});

console.log("Smart Account:", smartAccount.address);

// const rpcUrl = `https://public.pimlico.io/v2/${sepoliaChainId}/rpc?apikey=${process.env.PIMLICO_API_KEY}`;
// export const bundlerClient = createBundlerClient({
//     publicClient,
//     transport: http(rpcUrl)
// });

// const pimlicoClient = createPimlicoClient({
//     transport: http(rpcUrl),
// });

// const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();

// // Encode the function call to setHandleDelegatorAddress using viem's encodeFunctionData
// const setHandleDelegatorAddressData = encodeFunctionData({
//     abi: [{
//         name: 'setHandleDelegatorAddress',
//         type: 'function',
//         stateMutability: 'nonpayable',
//         inputs: [
//             { name: 'handle', type: 'string' },
//             { name: 'delegatorAddress', type: 'address' }
//         ],
//         outputs: []
//     }],
//     functionName: 'setHandleDelegatorAddress',
//     args: ['locker_money', '0x2E6c29b8E392bcF37aEc500B619EdCacF41Ff0Bf']
// });

// const userOperationHash = await bundlerClient.sendUserOperation({
//     account: smartAccount,
//     calls: [
//         {
//             to: smartAccount.address,
//             data: setHandleDelegatorAddressData,
//             value: 0n
//         }
//     ],
//     ...fee
// });

// console.log("User Operation Hash:", userOperationHash);
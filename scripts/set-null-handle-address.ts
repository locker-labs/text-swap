import pkg from "@metamask/delegation-toolkit";
const { getDeleGatorEnvironment, toMetaMaskSmartAccount, Implementation, overrideDeployedEnvironment, createExecution, encodeExecutionCalldatas } = pkg;
import { http, createPublicClient, encodeFunctionData, stringToHex, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createBundlerClient } from "viem/account-abstraction";
import { sepolia as chain } from "viem/chains";
import { createPimlicoClient } from "permissionless/clients/pimlico";

import dotenv from "dotenv";
dotenv.config();

const args = process.argv.slice(2);


const handle = args[0] ?? 'adobe40512';
const delegatorAddress = zeroAddress;
console.log("handle:", handle);

// Resolves the DeleGatorEnvironment for Linea Sepolia
const sepoliaChainId = 11155111
const hybridDeleGatorImpl = '0xF2846032bD52dd42FFfe639eCcd9B50777BDCc9D'
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
// 0xB031Cacdb585e8E49b1cEADfB125a9606a976418

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
const handleBytes = stringToHex(handle);
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

import { exec } from 'child_process';

// Replace 'yourfile.js' with the file you want to run
exec('bun run scripts/get-handle-address.ts ashugeth', (error, stdout, stderr) => {
    if (error) {
        console.error(`Execution error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout:\n${stdout}`);
    console.log('exiting...')
    process.exit(0)
});
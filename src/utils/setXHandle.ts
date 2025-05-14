import * as pkg from "@metamask/delegation-toolkit";
const { getDeleGatorEnvironment, toMetaMaskSmartAccount, Implementation, overrideDeployedEnvironment } = pkg;
import { encodeFunctionData, stringToHex, Address, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { publicClient } from "@/services/publicClient";
import { pimlicoClient } from "@/services/pimlicoClient";
import { bundlerClient } from "@/services/bundlerClient";
import { sessionAccountAddress } from "@/config";

import dotenv from "dotenv";
dotenv.config();

// Resolves the DeleGatorEnvironment for Linea Sepolia
const sepoliaChainId = 11155111;
const hybridDeleGatorImpl = '0xF2846032bD52dd42FFfe639eCcd9B50777BDCc9D'
const deploySalt = "0x";
const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;

if (!privateKey) {
    throw new Error("NEXT_PUBLIC_PRIVATE_KEY environment variable is required");
}

export const owner = privateKeyToAccount(privateKey as `0x${string}`);

export async function setHandleDelegatorAddress(username: string, delegatorAddress: Address): Promise<Hex> {
    const environment = getDeleGatorEnvironment(sepoliaChainId);
    // console.log("Environment: ", environment);

    const customEnv: any = { ...environment, implementations: { ...environment.implementations, HybridDeleGatorImpl: hybridDeleGatorImpl }, };
    // console.log("customEnv: ", customEnv);

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

    console.log("smartAccountCustom.address:", smartAccountCustom.address);
    console.log('sessionAccountAddress', sessionAccountAddress);

    // Encode handle string to bytes (hex)
    const handleBytes = stringToHex(username);
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
                to: sessionAccountAddress,
                data,
                value: 0n
            }
        ],
        ...fee
    });

    console.log("User Operation Hash:", userOperationHash);
    console.log('Waiting for user operation receipt...');

    const { receipt } = await bundlerClient.waitForUserOperationReceipt({
        hash: userOperationHash,
    });
    
    console.log("setHandleDelegatorAddress receipt:", receipt);

    return userOperationHash;
}
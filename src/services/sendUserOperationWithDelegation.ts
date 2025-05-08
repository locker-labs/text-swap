import { type Address, type Hex, toHex, createWalletClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { pimlicoClient } from "./pimlicoClient";
import { bundlerClient } from "./bundlerClient";
import { publicClient } from "./publicClient";
import { toMetaMaskSmartAccount, Implementation } from "@metamask/delegation-toolkit";


/**
 * Secrets
 */
const randomPrivateKey = process.env.NEXT_PUBLIC_RANDOM_PRIVATE_KEY as Address;
const privateKey = process.env.NEXT_PUBLIC_LOCKER_DELEGATE_OWNER_PRIVATE_KEY as Address;
const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string;
if (!randomPrivateKey) {
  throw new Error("NEXT_PUBLIC_RANDOM_PRIVATE_KEY is not set");
}
if (!privateKey) {
  throw new Error("NEXT_PUBLIC_LOCKER_DELEGATE_OWNER_PRIVATE_KEY is not set");
}
if (!apiKey) {
  throw new Error("NEXT_PUBLIC_ALCHEMY_API_KEY is not set");
}



/**
 * This function sends a user operation with delegation using the provided parameters.
 */
async function sendUserOperationWithDelegation({
  permissionsContext,
  delegationManager,
}) {
  const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();

  const nativeTokenValue = parseUnits('0.001', 18); // 0.001 ETH

  const nativeTokenTransferCall = {
    to: recipient,
    data: '0x' as Hex,
    value: nativeTokenValue,
  }

  const account = privateKeyToAccount(privateKey);

  const sessionAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [account.address, [], [], []],
    deploySalt: "0x",
    signatory: { account },
  });

  const userOperationHash = await bundlerClient.sendUserOperationWithDelegation({
    publicClient,
    account: sessionAccount, // userOp sender
    calls: [
      {
        to: recipient,
        data: '0x' as Hex,
        value: nativeTokenValue,
        permissionsContext: permissionsContext,
        delegationManager: delegationManager!,
      },
    ],
...fee,
// verificationGasLimit: BigInt(100_000),
// accountMetadata: accountMetadata,
});
console.log('userOperationHash', userOperationHash);

}

import { MetaMaskSmartAccount } from "@metamask/delegation-toolkit";
import { bundlerClient } from "@/services/bundlerClient";
import { publicClient } from "@/services/publicClient";
import { pimlicoClient } from "@/services/pimlicoClient";
import { Hex } from "viem";



export const redeemTransaction = async (
  sessionAccount: MetaMaskSmartAccount,
  delegationManager: Hex,
  context: Hex,
  accountMeta: any
) => {
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
  if (!(await sessionAccount.isDeployed())) {
    Object.defineProperty(sessionAccount, "isDeployed", {
      value: async () => true,
      writable: true,
    });
  }

  return receipt.transactionHash;
};

import {
  decodeFunctionData,
  encodeFunctionData,
  decodeAbiParameters,
  encodeAbiParameters,
  parseAbiParameters,
  parseEther,
  parseAbi,
} from "viem";
import { HybridDeleGatorAbi } from "@/consts/HybridDeleGatorAbi";
import { DelegationManagerAbi } from "@/consts/DelegationManagerAbi";

export async function bumpEthValue(
  wrapperCalldata: Hex, // the full outer blob you sent via sendUserOperation
  newEthAmount: string // e.g. "0.05"
): Promise<Hex> {
  // 1) Peel off the inner redeemDelegations(bytes[],bytes32[],bytes[]) blob
  //    by finding its selector "cef6d209"
  const selector = "cef6d209";
  const pos = wrapperCalldata.indexOf(selector);
  if (pos < 0) throw new Error("redeemDelegations selector not found");
  const inner = ("0x" + wrapperCalldata.slice(pos)) as Hex;

  // 2) Decode contexts, modes, execCallDatas
  const { args } = decodeFunctionData({ abi: HybridDeleGatorAbi, data: inner });
  const [contexts, modes, execCallDatas] = args as [Hex[], Hex[], Hex[]];

  // --- Step C: manually slice the single exec blob ---
  // execCallDatas[0] is something like:
  //   0x
  //     <32-byte address head>
  //     <32-byte value head>
  //     <32-byte dynamic-offset head>
  //     <32-byte length-of-bytes>
  //     (no data, since callData was empty)
  const raw = execCallDatas[0].slice(2); // drop "0x"

  // HEAD1: address is right-aligned in the first 64 hex chars (32 bytes)
  // so take those 64 hex, then take the last 40 chars for the address
  const head1 = raw.slice(0, 64);
  const targetHex = "0x" + head1.slice(24);

  // HEAD2: the next 64 hex is the old value
  const oldValueHex = raw.slice(64, 64 + 64);

  console.log("🔹 target:", targetHex);
  console.log("🔹 oldValue (hex):", oldValueHex);

  // --- Step D: build the new value hex, padded to 32 bytes ---
  const newValue = parseEther(newEthAmount); // BigInt
  let newValueHex = newValue.toString(16); // e.g. "de0b6b3a7640000"
  newValueHex = newValueHex.padStart(oldValueHex.length, "0");

  // --- Step E: re-encode the single exec (reuse the rest of the heads) ---
  // We keep head1 (address), then head2 = newValueHex, then keep the trailing data
  // which is everything after the first two 32-byte words:
  const trailing = raw.slice(64 * 2); // drop head1+head2 = first 128 hex chars
  const newExec = ("0x" + head1 + newValueHex + trailing) as Hex;

  const newRedeemBlob = encodeFunctionData({
    abi: HybridDeleGatorAbi,
    functionName: "redeemDelegations",
    args: [contexts, modes, [newExec]],
  });

  return newRedeemBlob;
}

import { config } from "@/config";
import { http, createWalletClient, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { erc7715ProviderActions, erc7710WalletActions } from "@metamask/delegation-toolkit/experimental";

import { LocalAccountSigner } from "@aa-sdk/core";
import { alchemy, sepolia as aaChain } from "@account-kit/infra";
import { createModularAccountAlchemyClient } from "@account-kit/smart-contracts";

const sessionOwnerPrivateKey = process.env.NEXT_PUBLIC_LOCKER_DELEGATE_OWNER_PRIVATE_KEY as Address;

if (!sessionOwnerPrivateKey) {
    throw new Error("NEXT_PUBLIC_LOCKER_DELEGATE_OWNER_PRIVATE_KEY is not set");
}

const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_ALCHEMY_API_KEY is not set");
}

// Your session account for requesting and redeeming should be same.
export const sesssionOwnerAccount = privateKeyToAccount(sessionOwnerPrivateKey);

export const sesssionOwnerWalletClient = createWalletClient({
  account: sesssionOwnerAccount,
  transport: http(),
  chain: config.chain,
})
.extend(erc7710WalletActions())
.extend(erc7715ProviderActions());

// 1. setup local account using locker delegate owner private key
const signer = LocalAccountSigner.privateKeyToAccountSigner(sessionOwnerPrivateKey);

// 2. create a smart account using locker delegate owner as owner
export const sessionAccountMAClient = await createModularAccountAlchemyClient({
  salt: BigInt(0),
  signer,
  chain: aaChain,
  transport: alchemy({ apiKey }),
});

export const sessionAccountAddress = sessionAccountMAClient.getAddress() as Address;

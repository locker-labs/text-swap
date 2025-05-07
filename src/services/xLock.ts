import { type Address, toHex, createWalletClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { LocalAccountSigner } from "@aa-sdk/core";
import { alchemy, sepolia as chain } from "@account-kit/infra";
import { createModularAccountAlchemyClient } from "@account-kit/smart-contracts";
import { xLockPluginActions, XLockPlugin, XLockPluginAbi } from "@/plugins/gens/xLock/x-lock/plugin";

const randomPrivateKey = process.env.NEXT_PUBLIC_RANDOM_PRIVATE_KEY as Address;

if (!randomPrivateKey) {
  throw new Error("NEXT_PUBLIC_RANDOM_PRIVATE_KEY is not set");
}

const privateKey = process.env.NEXT_PUBLIC_LOCKER_DELEGATE_OWNER_PRIVATE_KEY as Address;

if (!privateKey) {
  throw new Error("NEXT_PUBLIC_LOCKER_DELEGATE_OWNER_PRIVATE_KEY is not set");
}

const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_ALCHEMY_API_KEY is not set");
}


/**
 * Constants for the xLock plugin
 */
const pluginAddress = XLockPlugin.meta.addresses[chain.id];
console.log("Plugin:", pluginAddress);
const recipient = "0x0E0Ea5F87509486e7023C39A2cF5A959b39A7971";

// 1. setup local account using locker delegate owner private key
const signer = LocalAccountSigner.privateKeyToAccountSigner(privateKey);

// 2. create a smart account using locker delegate owner as owner
const maClient = await createModularAccountAlchemyClient({
  salt: BigInt(0),
  signer,
  chain,
  transport: alchemy({ apiKey }),
});
const maAddress = maClient.getAddress() as Address;
console.log("MA(v1):", maAddress);

// 3. install xLock plugin on the smart account
console.log("Extending client with xLock plugin");
const extendedClient = maClient.extend(xLockPluginActions);

// @ts-ignore
// SKIP IF ALREADY INSTALLED
try {
  const result = await extendedClient.installXLockPlugin({
    args: []
  })
  console.log("Plugin Installation Result:", result);
} catch (e) {
  // console.log("Plugin already installed");
}


// 4. set xLockerWallet as smart account address
const setXLockerWalletAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_xLockerWallet",
        "type": "address"
      }
    ],
    "name": "setXLockerWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const walletClient = createWalletClient({
  account: privateKeyToAccount(privateKey),
  chain,
  transport: http(),
});

console.log("Calling setXLockerWallet(maAddress) from EOA");
const hash = await walletClient.writeContract({
  address: pluginAddress,
  abi: setXLockerWalletAbi,
  functionName: 'setXLockerWallet',
  args: [maAddress],
});
console.log("setXLockerWallet Hash:", hash);

// 5. creata a userOp using smart account as signer
const xHandleHex = toHex("adobe40512");
console.log("Calling executeXTrnx");

const randomWalletClient = createWalletClient({
  account: privateKeyToAccount(randomPrivateKey),
  chain,
  transport: http(),
});

const executeXTrnxHash = await randomWalletClient.writeContract({
  address: pluginAddress,
  abi: XLockPluginAbi,
  functionName: 'executeXTrnx',
  args: [0, xHandleHex, recipient, parseUnits("0.0002", 18), '0x'],
});
console.log("executeXTrnx Hash:", executeXTrnxHash);
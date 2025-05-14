import { createPublicClient, http, stringToHex, toBytes, toHex, zeroAddress } from 'viem';
import { sepolia } from 'viem/chains';
const args = process.argv.slice(2);

const sessionAccountAddress = '0x3620DD4dFa2207D85C88286F2655e0f6E12EDb27';
const handle = args[0] ?? 'adobe40512';
console.log("handle:", handle);
console.log("sessionAccountAddress:", sessionAccountAddress);

const handleToAddressAbi = [
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "handleToAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const abi = handleToAddressAbi;

const client = createPublicClient({
  chain: sepolia,
  transport: http(),
});

const contract = {
  address: sessionAccountAddress,
  abi,
} as const;

const result = await client.readContract({
  ...contract,
  functionName: 'handleToAddress',
  args: [stringToHex(handle)],// locker_money
}) as string;

if (zeroAddress === result) {
  console.log("address not found");
}

console.log("result:", result);
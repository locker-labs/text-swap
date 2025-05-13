import { createPublicClient, http, stringToHex, toBytes, toHex, zeroAddress } from 'viem';
import { sepolia } from 'viem/chains';

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
  address: '0xf6464376912f18469bAdCE5e941361CD363cD0b1',
  abi,
} as const;

const result = await client.readContract({
  ...contract,
  functionName: 'handleToAddress',
  args: [stringToHex('locker_money')],
}) as string;

if (zeroAddress === result) {
  console.log("address not found");
}

console.log("result:", result);
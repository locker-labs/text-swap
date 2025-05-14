import { createPublicClient, http, stringToHex, toBytes, toHex, zeroAddress } from 'viem';
import { sepolia } from 'viem/chains';
const args = process.argv.slice(2);

const sessionAccountAddress = '0x8582186e2A9c3797DaE0636FFd53C83f09ab669F';
const handle = args[0] ?? 'ashugeth';
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
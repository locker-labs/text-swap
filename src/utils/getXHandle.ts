import { Address, stringToHex, zeroAddress } from 'viem';
import { publicClient } from '@/services/publicClient';
import { sessionAccountAddress } from '@/config';

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

const contract = {
  address: sessionAccountAddress,
  abi,
} as const;

export async function getXHandleAddress(handle: string) {

    const result = await publicClient.readContract({
        ...contract,
        functionName: 'handleToAddress',
        args: [stringToHex(handle)]
    }) as Address;

    if (zeroAddress === result) {
        console.log("address not found");
    }

    return result;
}
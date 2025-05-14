import { ReclaimClient } from '@reclaimprotocol/zk-fetch';

const RECLAIM_APP_ID = process.env.NEXT_PUBLIC_RECLAIM_APP_ID;
if (!RECLAIM_APP_ID) {
  throw new Error('RECLAIM_APP_ID is not set in the environment variables');
}
const RECLAIM_APP_SECRET = process.env.NEXT_PUBLIC_RECLAIM_APP_SECRET;
if (!RECLAIM_APP_SECRET) {
    throw new Error('RECLAIM_APP_SECRET is not set in the environment variables');
}

const reclaimClient = new ReclaimClient(RECLAIM_APP_ID, RECLAIM_APP_SECRET)

export function getReclaimClient() {
    return reclaimClient;
}
# Text Swap

## Problem
Buying memecoins or swapping assets directly from chat applications (Twitter, Discord, etc.) is cumbersome and error-prone.

## Solution
Leverage ERC-7710 & ERC-7715 to delegate spending permissions to an on-chain **Delegate Locker** contract.  
The contract may spend a user's funds **only** when presented with a valid **zkTLS proof** that the user actually posted the required chat message.

The current demo:
* Network: **Sepolia**
* Flow: Buy any token with ETH through **CoW Swap**

---

## End-to-End Flow

1. User opens the site; prompted to install MetaMask **Flask** if needed.
2. User connects to Twitter with OAuth.
3. The UI shows the **Delegator/Gator smart-account** address — user funds it with ETH.
4. A **UserOperation** creates an ERC-7715 delegation that allows Text Swap's **Delegate/session account** to spend up to a defined limit.
5. A background service watches Twitter for messages of the form:
   ```text
   @locker_money buy token: 0xTokenAddress amount: 1
   ```
6. When a matching tweet is found, **Reclaim Protocol** is used to generate a zkTLS proof of the tweet's existence.
7. The proof is submitted (via another UserOperation) to the **Delegate/session account** which, after verification, swaps the user's ETH for the requested token on **CoW Swap (Sepolia)**.
8. The purchased tokens are transferred back to the user's **Delegator/Gator account**.

---

## Roadmap
- [ ] OAuth flow for Twitter and Discord.
- [ ] Integrate zkTLS prover service.
- [ ] Support arbitrary ERC-20 amounts & decimals.
- [ ] Extend beyond ETH→Token swaps.
- [ ] Production deploy & audits.

---

### Developer Quick-Start (Sepolia)
```
pnpm i
pnpm dev
```
1. Set `.env.local` with:
   ```
   NEXT_PUBLIC_BASE_URL=https://<your-ngrok>.ngrok.app
   NEXT_PUBLIC_TWITTER_CLIENT_ID=...
   TWITTER_CLIENT_SECRET=...
   ```
2. Run an **ngrok** tunnel to expose port 3000.
3. Configure the same callback URL in the Twitter Developer Portal.

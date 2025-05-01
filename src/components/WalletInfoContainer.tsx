"use client";

import { usePermissions } from "@/providers/PermissionProvider";
import WalletInfo from "./WalletInfo";

export default function WalletInfoContainer() {
  const { smartAccount } = usePermissions();
  return (
    <div className="w-full max-w-4xl mx-auto p-3 space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
        {smartAccount && (
          <WalletInfo address={smartAccount} label="Your Account (Gator)" />
        )}
      </div>
    </div>
  );
}

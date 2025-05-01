"use client";
import { useEffect, useState } from "react";
import GrantPermissionsButton from "./GrantPermissionsButton";
import TwitterConnection from "./TwitterConnection";
import { usePermissions } from "@/providers/PermissionProvider";

export default function Steps() {
  const [step, setStep] = useState<number>(1);
  const { permission } = usePermissions();

  useEffect(() => {
    if (permission) {
      setStep(2);
    } else {
      setStep(1);
    }
  }, [permission]);

  return (
    <div className="max-w-4xl mx-auto p-3 space-y-8">
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <p className="text-gray-300 mb-4">
              Grant permissions to allow Locker to make transactions on your behalf.
              This will prompt you to:
            </p>
            <ol className="text-gray-300 list-decimal list-inside space-y-2">
              <li>
                Install two MetaMask snaps that handle ERC7715 permissions (if
                not already installed)
              </li>
              <li>Grant permissions to the Locker delegate address</li>
            </ol>
            <p className="text-gray-300 mt-4">
              After granting permissions, you'll connect your Twitter account to complete the process.
            </p>
          </div>
          <GrantPermissionsButton />
        </div>
      )}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <p className="text-gray-300">
              Connect your Twitter account and send a tweet to complete your transaction.
            </p>
            <div className="flex items-center gap-2 bg-blue-900/30 border border-blue-700 rounded-md p-3 mb-4 mt-4">
              <span className="text-blue-400">ℹ️</span>
              <p className="text-blue-200">
                Your tweet must be in the format: "@locker_money buy token: 0x... amount: 100"
              </p>
            </div>
          </div>
          <TwitterConnection />
        </div>
      )}
    </div>
  );
}

"use client";

import GrantPermissionsButton from "@/components/GrantPermissionsButton";
import { TwitterUser } from "@/services/twitterOAuth";
import { Info, Loader2 } from "lucide-react";
import { usePermissions } from "@/providers/PermissionProvider";

export default function GrantPermission({
  twitterUser,
  isXHandleSet,
}: {
  twitterUser: TwitterUser | null;
  isXHandleSet: boolean | null;
}) {
  const { permission } = usePermissions();
  console.log(permission)

    return (
      <div className={`max-w-[545px] px-[40px] flex flex-col text-center items-center border-[2px] border-[#D3D3D3] rounded-lg shadow-md overflow-hidden`}>

        <h3 className="text-[#000000] mt-[20px] text-[26px] text-xl font-bold font-[Roboto]">
          Grant Permission
        </h3>
        <p className="text-[#5D5D5D] mt-[12px] text-[16px] font-base font-[Roboto]">
          Authorize the dapp to use your tokens only after you tweet
        </p>

        {/* Info card */}
        <div className="w-full mt-[20px] mx-[20px] p-[20px] border border-[#D6EAFD] bg-[#D6EAFD] rounded-lg text-left flex items-start justify-start">
          <Info size={24} color="#D6EAFD" fill="#1E90FF" className="mr-[12px] min-w-fit" />
          <p className="text-[#1E90FF] text-[16px] font-[Roboto]">
            You'll see a MetaMask popup. This only authorizes the dapp to use tokens after you tweet. No tokens will be spent until then
          </p>
        </div>

        <p className="text-[#9DA4B1] mt-[22px] text-left">
          By granting permission, you confirm that you understand the dapp will only use your tokens after you post a tweet matching the required format
        </p>

        <GrantPermissionsButton />


        {permission && twitterUser && !isXHandleSet && <div className="w-full mb-[25px] mx-[20px] p-[20px] border border-[#D6EAFD] bg-[#D6EAFD] rounded-lg text-left flex items-center justify-start gap-[8px]">
          <Loader2 className="h-5 w-5 animate-spin" color="#1E90FF" />
          <p className="text-[#1E90FF] text-[16px] font-[Roboto]">
            Registering your xHandle with your gator account...
          </p>
        </div>}
    </div>
    )

}
import { useSteps } from "@/providers/StepProvider";
import InstallMetamaskFlask from "./steps/InstallMetamaskFlask";
import ConnectTwitter from "./steps/ConnectTwitter";
import GrantPermission from "./steps/GrantPermission";
import SendTweet from "./steps/SendTweet";
import { useState, useEffect } from "react";

import { TwitterUser } from "@/services/twitterOAuth";
import { usePermissions } from "@/providers/PermissionProvider";

export default function ActiveStep() {
    const [twitterUser, setTwitterUser] = useState<TwitterUser | null>(null);
    const { permission, removePermission } = usePermissions();
    const { activeStep, setActiveStep } = useSteps();

    /**
     * TODO: on getting permissions, set active step to 4
     * 
     */

    useEffect(() => {
        if (permission) {
            setActiveStep(4);
        } else {
            // @dev for testing, replace twitterUser with !twitterUser in next line
            if (twitterUser) {
                if (activeStep === 2) {
                    setActiveStep(3);
                }
            } else {
                if (activeStep === 3) {
                    setActiveStep(2);
                }
            }
        }
    }, [activeStep, twitterUser])

    function renderStep() {
        switch(activeStep) {
        case 1:
            return <InstallMetamaskFlask/>;
        case 2:
            return <ConnectTwitter setTwitterUser={setTwitterUser} />;
        case 3:
            return <GrantPermission/>;
        case 4:
            return <SendTweet twitterUser={twitterUser} />;
        default:
            return <>Success!</>;
        }
    }

    return <div className="flex items-center justify-center">
        {renderStep()}
    </div>
}
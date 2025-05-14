import { useSteps } from "@/providers/StepProvider";
import InstallMetamaskFlask from "./steps/InstallMetamaskFlask";
import ConnectTwitter from "./steps/ConnectTwitter";
import GrantPermission from "./steps/GrantPermission";
import SendTweet from "./steps/SendTweet";
import { useState, useEffect } from "react";

import { TwitterUser } from "@/services/twitterOAuth";
import { usePermissions } from "@/providers/PermissionProvider";
import { getXHandleAddress } from "@/utils/getXHandle";
import { Address, zeroAddress } from "viem";
import { setHandleDelegatorAddress } from "@/utils/setXHandle";

let _renderFlag = false;
let _isXHandleSetFlag = false;

const sampleTwitterUser = { id: '1796891124319109120', username: 'ashugeth', name: 'Ashu Gupta' }

export default function ActiveStep() {
    const [isXHandleSet, setIsXHandleSet] = useState<boolean | null>(null);
    const [startPolling, setStartPolling] = useState<boolean>(false);
    // @dev for testing, replace null with sampleTwitterUser in next line
    const [twitterUser, setTwitterUser] = useState<TwitterUser | null>(sampleTwitterUser);
    const { smartAccount, permission, removePermission } = usePermissions();
    const { activeStep, setActiveStep } = useSteps();

     // check if delegator address exists for xHandle on component mount
    useEffect(() => {
        console.log('_renderFlag', _renderFlag);
        if (_renderFlag) {
            return;
        };
        _renderFlag = true;
        
        (async function() {
            if (twitterUser) {
                if (null === isXHandleSet) {
                    const address = await getXHandleAddress(twitterUser.username);
                    if (zeroAddress === address) {
                        setIsXHandleSet(false);
                    } else {
                        setIsXHandleSet(true);
                    }
                }
            }
        })();
    }, []);


    // check if delegator address exists for xHandle on getting permission
    useEffect(() => {
        if (_isXHandleSetFlag) return;
        _isXHandleSetFlag = true;

      (async function() {
        if (permission && twitterUser) {
            const address = await getXHandleAddress(twitterUser.username);
            console.log(`handle: ${twitterUser.username} address: ${address}`);
            if (zeroAddress === address) {
                console.log('setting xHandle Delegator addresss');
                await setHandleDelegatorAddress(twitterUser.username, smartAccount as Address);
                setIsXHandleSet(true);
            } else {
                setIsXHandleSet(true);
            }
        }
        _isXHandleSetFlag = false;
      })();
    }, [permission, isXHandleSet]);


    // calculate and set active step
    useEffect(() => {
        if (permission && isXHandleSet) {
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
    }, [permission, activeStep, isXHandleSet, twitterUser])

    function renderStep() {
        switch(activeStep) {
        case 1:
            return <InstallMetamaskFlask/>;
        case 2:
            return <ConnectTwitter setTwitterUser={setTwitterUser} />;
        case 3:
            return <GrantPermission twitterUser={twitterUser} isXHandleSet={isXHandleSet} />;
        case 4:
            return <SendTweet twitterUser={twitterUser} setStartPolling={setStartPolling} startPolling={startPolling} />;
        default:
            return <>Success!</>;
        }
    }

    return <div className="flex items-center justify-center">
        {renderStep()}
    </div>
}
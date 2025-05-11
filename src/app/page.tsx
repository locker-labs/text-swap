"use client";
import Navbar from "@/components/Navbar";
import Steps from "@/components/Steps";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import InstallFlask from "@/components/InstallFlask";
import WalletInfoContainer from "@/components/WalletInfoContainer";
import Loader from "@/components/Loader";
import PermissionInfo from "@/components/PermissionInfo";
import StepIndicators from "@/components/StepIndicators";
import ActiveStep from "@/components/ActiveStep";
import { useSteps } from "@/providers/StepProvider";

export default function Home() {
  const { setActiveStep } = useSteps();
  const [isFlask, setIsFlask] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const detectFlask = async () => {
    if (window && window.ethereum) {
      const provider = window.ethereum;

      if (provider) {
        const clientVersion = await provider.request({
          method: "web3_clientVersion",
        });

        const isFlaskDetected = (clientVersion as string[])?.includes("flask");

        setIsFlask(isFlaskDetected);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    detectFlask();
  }, []);

  useEffect(() => {
    if (!isFlask) {
      setActiveStep(1);
    } else {
      setActiveStep(2);
    }
  }, [isFlask])

  return (
    <div className="min-h-screen bg-white text-[#6E6E6E] flex flex-col">
      <main className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <Navbar/>
        <StepIndicators />
        {isLoading ? <Loader /> : <ActiveStep />}
        {/* TODO: comment below */}
        <WalletInfoContainer />
        {/* TODO: comment below */}
        <PermissionInfo />
        {/* TODO: comment below */}
        {isLoading ? <Loader /> : isFlask ? <Steps /> : <InstallFlask />}
      </main>
      <Footer />
    </div>
  );
}

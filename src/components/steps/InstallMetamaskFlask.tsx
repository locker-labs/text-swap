import React from "react";

export default function InstallMetamaskFlask() {
  return (
    <div className={`max-w-[545px] flex flex-col text-center items-center border-[2px] border-[#FDE68A] rounded-lg shadow-md overflow-hidden`}>
        <div className="bg-[#FFFAE7] w-full">
        <h3 className="text-[#773410] mt-[20px] text-[26px] text-xl font-bold mb-4 font-[Roboto]">
          Install MetaMask Flask
        </h3>
        <p className="px-4 text-[#773410] mt-[12px] mb-[26px] text-[16px] font-medium font-[Roboto]">
          This application requires MetaMask Flask chrome extension to function. Follow the steps
          below to get started.
        </p>
        </div>

        <div className="sm:w-[calc(100%-40px)] sm:m-[20px] py-[20px] px-[20px] sm:px-[40px] sm:border sm:border-[#E1E1E1] sm:rounded-lg text-left">
          <p className="text-black text-[20px] md:text-[26px] text-xl font-bold mb-4 font-[Roboto]">Installation Steps:</p>

          <ol className="list-decimal list-inside space-y-4 text-gray-300">
            <li className="text-black font-[Roboto]">
              <a
                href="https://metamask.io/flask/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-2 cursor-pointer"
              >
                Visit MetaMask Flask
              </a>{" "}
              and click the &ldquo;Install MetaMask Flask&rdquo; button in your browser
            </li>
            <li className="text-black font-[Roboto]">Create a new wallet or import an existing account</li>
            <li className="text-black font-[Roboto]">Switch to the Ethereum Sepolia Network</li>
            <li className="text-black font-[Roboto]">Return to this page and refresh</li>
          </ol>
        </div>

        <button
          onClick={() => window.open("https://chromewebstore.google.com/detail/metamask-flask-developmen/ljfoeinjpaedjfecbmggjgodbgkmjkjk", "_blank")}
          className="cursor-pointer mb-[16px] w-[calc(100%-40px)] bg-[#E59811] text-[#FFFFFF] font-bold p-[14px] rounded-lg font-[Roboto] text-[16px]"
          >
            Get Metamask Flask
        </button>
    </div>
  );
}

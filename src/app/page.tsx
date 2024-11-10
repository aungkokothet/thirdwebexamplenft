"use client";

import Image from "next/image";
import { ConnectButton, useReadContract } from "thirdweb/react";
import { getContract, resolveMethod } from "thirdweb";
import { useState } from "react";
import thirdwebIcon from "@public/thirdweb.svg";
import { client } from "./client";

// Import required chains explicitly
import { polygon, polygonZkEvmTestnet } from "thirdweb/chains";

const supportedChains = [
  { id: "polygon", name: "Polygon Mainnet", chain: polygon },
  { id: "polygon-zkevm-testnet", name: "Polygon zkEVM Testnet", chain: polygonZkEvmTestnet },
];

export default function Home() {
  const [contractAddress, setContractAddress] = useState("");
  const [network, setNetwork] = useState(supportedChains[0].id);
  const [metadata, setMetadata] = useState<string | null>(null);

  // Determine selected chain based on user selection
  const selectedChain = supportedChains.find((chain) => chain.id === network)?.chain;

  // Set up the contract object based on selected network and address
  const contract = selectedChain
    ? getContract({
        client,
        address: contractAddress,
        chain: selectedChain, // Pass the imported chain object directly
      })
    : null;

  // Use readContract to fetch contract metadata URI with resolveMethod
  const { data, isLoading } = useReadContract({
    contract,
    method: resolveMethod("contractURI"),
  });

  // Update metadata state when data is fetched
  const fetchMetadata = () => {
    if (data) {
      setMetadata(data);
    } else {
      console.error("Failed to fetch metadata");
    }
  };

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <Header />

        <div className="flex justify-center mb-20">
          <ConnectButton
            client={client}
            appMetadata={{
              name: "Example App",
              url: "https://example.com",
            }}
          />
        </div>

        {/* Contract address input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contract Address
          </label>
          <input
            type="text"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            placeholder="Enter contract address"
            className="w-full px-4 py-2 border border-gray-700 rounded bg-zinc-800 text-white"
          />
        </div>

        {/* Network selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Network
          </label>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="w-full px-4 py-2 border border-gray-700 rounded bg-zinc-800 text-white"
          >
            {supportedChains.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </select>
        </div>

        {/* Fetch metadata button */}
        <button
          onClick={fetchMetadata}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
        >
          {isLoading ? "Loading..." : "Fetch Contract Metadata"}
        </button>

        {/* Display the metadata result */}
        {metadata && (
          <div className="mt-4 p-4 bg-zinc-900 rounded text-white">
            <h3 className="text-lg font-semibold mb-2">Contract Metadata (IPFS)</h3>
            <a
              href={`https://ipfs.io/ipfs/${metadata}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {metadata}
            </a>
          </div>
        )}

        <ThirdwebResources />
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <Image
        src={thirdwebIcon}
        alt=""
        className="size-[150px] md:size-[150px]"
        style={{
          filter: "drop-shadow(0px 0px 24px #a726a9a8)",
        }}
      />

      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        thirdweb SDK
        <span className="text-zinc-300 inline-block mx-1"> + </span>
        <span className="inline-block -skew-x-6 text-blue-500"> Next.js </span>
      </h1>

      <p className="text-zinc-300 text-base">
        Read the{" "}
        <code className="bg-zinc-800 text-zinc-300 px-2 rounded py-1 text-sm mx-1">
          README.md
        </code>{" "}
        file to get started.
      </p>
    </header>
  );
}

function ThirdwebResources() {
  return (
    <div className="grid gap-4 lg:grid-cols-3 justify-center">
      <ArticleCard
        title="thirdweb SDK Docs"
        href="https://portal.thirdweb.com/typescript/v5"
        description="thirdweb TypeScript SDK documentation"
      />

      <ArticleCard
        title="Components and Hooks"
        href="https://portal.thirdweb.com/typescript/v5/react"
        description="Learn about the thirdweb React components and hooks in thirdweb SDK"
      />

      <ArticleCard
        title="thirdweb Dashboard"
        href="https://thirdweb.com/dashboard"
        description="Deploy, configure, and manage your smart contracts from the dashboard."
      />
    </div>
  );
}

function ArticleCard(props: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <a
      href={props.href + "?utm_source=next-template"}
      target="_blank"
      className="flex flex-col border border-zinc-800 p-4 rounded-lg hover:bg-zinc-900 transition-colors hover:border-zinc-700"
    >
      <article>
        <h2 className="text-lg font-semibold mb-2">{props.title}</h2>
        <p className="text-sm text-zinc-400">{props.description}</p>
      </article>
    </a>
  );
}

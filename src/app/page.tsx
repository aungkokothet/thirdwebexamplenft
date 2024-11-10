"use client";

import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { useState, useEffect } from "react";
import { client } from "./client";
import { defineChain } from "thirdweb";
import Image from "next/image";

const myChain = defineChain(1442); // Polygon zkEVM Testnet

export default function Home() {
  const [contractAddress, setContractAddress] = useState("");
  const [metadata, setMetadata] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const contract = getContract({
    client,
    address: contractAddress || "0x0000000000000000000000000000000000000000",
    chain: myChain,
  });

  const { data, isLoading } = useReadContract({
    contract,
    method: "function contractURI() view returns (string)",
  });

  useEffect(() => {
    if (data) {
      setMetadata(data);
      // Fetch metadata from IPFS to retrieve the image URL
      fetch(`https://ipfs.io/ipfs/${data}`)
        .then((response) => response.json())
        .then((meta) => setImageUrl(meta.image))
        .catch(console.error);
    }
  }, [data]);

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <h1 className="text-3xl font-semibold text-white mb-6">Fetch Contract Metadata</h1>

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

        <button
          onClick={() => setMetadata(data || "Fetching...")}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
        >
          {isLoading ? "Loading..." : "Fetch Contract Metadata"}
        </button>

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

        {imageUrl && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Metadata Image</h3>
            <Image
              src={imageUrl}
              alt="Contract Metadata"
              width={400}
              height={400}
              className="rounded-lg"
            />
          </div>
        )}
      </div>
    </main>
  );
}

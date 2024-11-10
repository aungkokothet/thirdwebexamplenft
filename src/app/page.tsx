"use client";

import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { useState, useEffect } from "react";
import { client } from "./client";
import { defineChain } from "thirdweb";
import Image from "next/image";

const myChain = defineChain(2442); // Polygon zkEVM Testnet

export default function Home() {
  const [contractAddress, setContractAddress] = useState("");
  const [metadata, setMetadata] = useState<any | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Set up contract with Thirdweb
  const contract = getContract({
    client,
    address: contractAddress || "0x0000000000000000000000000000000000000000",
    chain: myChain,
  });

  // Use ReadContract to retrieve metadata URI
  const { data, isLoading } = useReadContract({
    contract,
    method: "function contractURI() view returns (string)",
  });

  // Fetch metadata from IPFS and parse image URL
  useEffect(() => {
    if (data) {
      fetch(`https://ipfs.io/ipfs/${data}`)
        .then((response) => response.json())
        .then((meta) => {
          setMetadata(meta);
          if (meta.image) {
            setImageUrl(meta.image.replace("ipfs://", "https://ipfs.io/ipfs/"));
          }
        })
        .catch(console.error);
    }
  }, [data]);

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <h1 className="text-3xl font-semibold text-white mb-6">GVN GSS NFT Collection</h1>

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
          <div className="mt-6 p-6 bg-zinc-900 rounded-lg text-white">
            <h3 className="text-lg font-semibold mb-4">NFT Details</h3>
            {imageUrl && (
              <Image
                src={imageUrl}
                alt="NFT Image"
                width={400}
                height={400}
                className="rounded-lg mb-4"
              />
            )}
            <div className="space-y-2">
              <p><strong>Name:</strong> {metadata.name || "N/A"}</p>
              <p><strong>Symbol:</strong> {metadata.symbol || "N/A"}</p>
              <p>
                <strong>Description:</strong>{" "}
                {metadata.description
                  ? metadata.description.split("\n").map((line, idx) => (
                      <span key={idx}>
                        {line}
                        <br />
                      </span>
                    ))
                  : "N/A"}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

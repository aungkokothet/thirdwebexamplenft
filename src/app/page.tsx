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
  const [metadataUri, setMetadataUri] = useState<string | null>(null); // Stores the contract metadata URI
  const [imageUrl, setImageUrl] = useState<string | null>(null); // Image URL extracted from metadata
  const [description, setDescription] = useState<string | null>(null); // Description from metadata
  const [name, setName] = useState<string | null>(null); // Name from metadata
  const [isError, setIsError] = useState(false); // Error flag

  // Setup the contract with the provided address
  const contract = getContract({
    client,
    address: contractAddress || "0x0000000000000000000000000000000000000000",
    chain: myChain,
  });

  // Use thirdweb's hook to read the contractURI from the contract
  const { data, isLoading } = useReadContract({
    contract,
    method: "function contractURI() view returns (string)", // Assumes this is the correct method signature
  });

  // Fetch metadata from IPFS when `data` (contractURI) is retrieved
  useEffect(() => {
    if (data) {
      // Set metadata URI from the contract
      setMetadataUri(data);

      // Fetch the JSON metadata using the metadata URI from IPFS
      fetch(`https://ipfs.io/ipfs/${data.replace("ipfs://", "")}`)
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch metadata");
          return response.json();
        })
        .then((meta) => {
          // Construct a valid image URL from IPFS
          const imageIpfsPath = meta.image.replace("ipfs://", "");
          const formattedImageUrl = `https://ipfs.io/ipfs/${imageIpfsPath}`;
          console.log("Image URL:", formattedImageUrl); // Debugging: Check the image URL
          
          setImageUrl(formattedImageUrl);
          setDescription(meta.description);
          setName(meta.name);
          setIsError(false);
        })
        .catch((error) => {
          console.error("Error fetching metadata from IPFS:", error);
          setIsError(true);
        });
    }
  }, [data]);

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <h1 className="text-3xl font-semibold text-white mb-6">Fetch Contract Metadata</h1>

        {/* Contract Address Input */}
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

        {/* Fetch Button */}
        <button
          onClick={() => setMetadataUri(data || "Fetching...")}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
        >
          {isLoading ? "Loading..." : "Fetch Contract Metadata"}
        </button>

        {/* Error Message */}
        {isError && (
          <div className="mt-4 p-4 bg-red-600 text-white rounded">
            <p>Error loading metadata. Please try again later.</p>
          </div>
        )}

        {/* Metadata URI Display */}
        {metadataUri && !isError && (
          <div className="mt-4 p-4 bg-zinc-900 rounded text-white">
            <h3 className="text-lg font-semibold mb-2">Contract Metadata (IPFS)</h3>
            <a
              href={`https://ipfs.io/ipfs/${metadataUri.replace("ipfs://", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {metadataUri}
            </a>
          </div>
        )}

        {/* Display Image, Name, and Description from IPFS Metadata */}
        {imageUrl && description && name && (
          <div className="mt-4 p-4 bg-zinc-900 rounded text-white">
            <h3 className="text-lg font-semibold mb-2">{name}</h3>
            <Image
              src={imageUrl}
              alt={name}
              width={400}
              height={400}
              className="rounded-lg"
            />
            <p className="mt-2">{description}</p>
          </div>
        )}
      </div>
    </main>
  );
}

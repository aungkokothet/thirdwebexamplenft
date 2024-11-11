"use client";

import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { useState, useEffect } from "react";
import { client } from "./client";
import { defineChain } from "thirdweb";
import Image from "next/image";
import { useRouter } from "next/navigation";

const myChain = defineChain(2442); // Polygon zkEVM Testnet

export default function Home() {
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [metadataUri, setMetadataUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // Detect contract address from the URL path dynamically
  useEffect(() => {
    const path = window.location.pathname.slice(1); // Remove leading slash
    if (path) {
      setContractAddress(path);
    } else {
      setIsError(true); // Set error if no contract address is provided
    }
  }, []);

  // Initialize the contract only if contractAddress is set
  const contract = contractAddress
    ? getContract({
        client,
        address: contractAddress,
        chain: myChain,
      })
    : null;

  // Use thirdweb's hook to read the contractURI from the contract
  const { data, isLoading } = useReadContract(
    contract
      ? {
          contract,
          method: "function contractURI() view returns (string)",
        }
      : null
  );

  // Fetch metadata from IPFS when `data` (contractURI) is retrieved
  useEffect(() => {
    if (data) {
      setMetadataUri(data);

      // Fetch the JSON metadata using the metadata URI from IPFS
      fetch(`https://ipfs.io/ipfs/${data.replace("ipfs://", "")}`)
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch metadata");
          return response.json();
        })
        .then((meta) => {
          const imageIpfsPath = meta.image.replace("ipfs://", "");
          setImageUrl(`https://ipfs.io/ipfs/${imageIpfsPath}`);
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
        <h1 className="text-3xl font-semibold text-white mb-6">Contract Metadata</h1>

        {/* Fallback Message if No Contract Address is Provided */}
        {!contractAddress && (
          <div className="mt-4 p-4 bg-gray-800 text-white rounded">
            <p>Please add a contract address to the URL, like this:</p>
            <code className="block mt-2 text-blue-400">https://yourdomain.com/[contractAddress]</code>
          </div>
        )}

        {/* Error Message if Contract Address is Invalid */}
        {isError && contractAddress && (
          <div className="mt-4 p-4 bg-red-600 text-white rounded">
            <p>Error loading metadata. Please check the contract address.</p>
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

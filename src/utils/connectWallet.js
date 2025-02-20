import { BrowserProvider } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";

export async function connectWallet() {
  const provider = await detectEthereumProvider();
  if (!provider) {
    alert("MetaMask not found. Please install MetaMask.");
    return null;
  }

  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    return { account: accounts[0], signer };
  } catch (error) {
    console.error("Error connecting to MetaMask:", error);
    return null;
  }
}

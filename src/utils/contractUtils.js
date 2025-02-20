import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants/contract";

export async function getContract() {
  if (!window.ethereum) {
    alert("MetaMask is not installed. Please install it.");
    return null;
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner(); // Ensure contract is signed
    return { contract: new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer), signer };
  } catch (error) {
    console.error("Error connecting to contract:", error);
    return null;
  }
}

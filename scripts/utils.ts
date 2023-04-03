import { ethers } from "ethers";
import dotenv from "dotenv"
dotenv.config()

const { MNEMONIC, AVALANCHE_FUJI_C_RPC_URL } = process.env
export const getDomain = (name: string, verifyingContract: string) => ({
  name,
  version: "1.0.1",
  chainId: 43113,
  verifyingContract,
})
export const getTime = (time: number) => Math.floor(new Date().getTime() / 1000.0) + time;

const numWallets = 5;
export function getSigners() {
  const provider = new ethers.providers.JsonRpcProvider(AVALANCHE_FUJI_C_RPC_URL as string);
  const wallets: ethers.Wallet[] = [];

  for (let i = 0; i < numWallets; i++) {
    const path = `m/44'/60'/0'/0/${i}`;
    const wallet = ethers.Wallet.fromMnemonic(MNEMONIC as string, path).connect(provider);
    wallets.push(wallet);
  }
  return wallets
  // Connect to JSON-RPC provider using a URL
}


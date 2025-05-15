import { useWeb3 as useWeb3Context } from "@/components/providers/web3-provider";

export const useWeb3 = () => {
  const context = useWeb3Context();
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}; 
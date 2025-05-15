import { useWeb3 } from "@/components/providers/web3-provider";
import { Button } from "./button";

export function ConnectWalletButton() {
  const { account, connect, disconnect, isConnected, isConnecting } = useWeb3();

  // Format address for display: 0x1234...5678
  const formatAddress = (address: string | null) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Handle click - connect or disconnect based on current state
  const handleClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <Button 
      onClick={handleClick}
      disabled={isConnecting}
      variant={isConnected ? "outline" : "default"}
    >
      {isConnecting
        ? "Connecting..."
        : isConnected
        ? formatAddress(account)
        : "Connect Wallet"}
    </Button>
  );
} 
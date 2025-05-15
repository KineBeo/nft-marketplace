"use client";

import { useState, useEffect } from "react";
import { useWeb3 } from "@/components/providers/web3-provider";
import { Button } from "./button";
import { ethers } from "ethers";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Copy, 
  ExternalLink, 
  LogOut, 
  Wallet, 
  User, 
  CircleDollarSign, 
  Clock, 
  ChevronDown,
  Image as ImageIcon,
  Tag
} from "lucide-react";
import { useToast } from "./use-toast";
import { Badge } from "./badge";
import Link from "next/link";
import { useNFT } from "@/hooks/useNFT";

export function UserProfileMenu() {
  const { account, connect, disconnect, isConnected, isConnecting, signer } = useWeb3();
  const { loadNFTs } = useNFT();
  const { toast } = useToast();
  const [balance, setBalance] = useState<string>("0");
  const [avatarSrc, setAvatarSrc] = useState<string>("");
  const [networkName, setNetworkName] = useState<string>("Ethereum");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [nftStats, setNftStats] = useState({ total: 0, listed: 0 });

  // Format address for display: 0x1234...5678
  const formatAddress = (address: string | null) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Generate avatar source based on address
  useEffect(() => {
    if (account) {
      // Use a service like Jazzicon or ENS avatar
      setAvatarSrc(`https://effigy.im/a/${account}.svg`);
    }
  }, [account]);

  // Fetch NFT stats when account changes or dropdown opens
  useEffect(() => {
    const fetchNFTStats = async () => {
      if (isConnected && account) {
        try {
          const nfts = await loadNFTs(false);
          const listed = nfts.filter(nft => nft.isListed).length;
          setNftStats({
            total: nfts.length,
            listed: listed
          });
        } catch (error) {
          console.error("Error fetching NFT stats:", error);
        }
      }
    };

    if (isDropdownOpen) {
      fetchNFTStats();
    }
  }, [isConnected, account, isDropdownOpen, loadNFTs]);

  // Fetch balance and network when account changes
  useEffect(() => {
    const getAccountInfo = async () => {
      if (signer && account && signer.provider) {
        try {
          // Get balance
          const balance = await signer.provider.getBalance(account);
          setBalance(parseFloat(ethers.formatEther(balance)).toFixed(4));
          
          // Get network
          const network = await signer.provider.getNetwork();
          setNetworkName(network.name === 'homestead' ? 'Ethereum' : network.name);
        } catch (error) {
          console.error("Error fetching account info:", error);
          setBalance("0");
        }
      }
    };

    if (isConnected) {
      getAccountInfo();
      
      // Refresh every 30 seconds
      const intervalId = setInterval(getAccountInfo, 30000);
      return () => clearInterval(intervalId);
    }
  }, [signer, account, isConnected]);

  // Copy address to clipboard
  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  // Open etherscan
  const openEtherscan = () => {
    if (account) {
      // Adjust network based on your deployment
      window.open(`https://sepolia.etherscan.io/address/${account}`, '_blank');
    }
  };

  if (!isConnected) {
    return (
      <Button 
        onClick={connect}
        disabled={isConnecting}
        className="relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:flex flex-col items-end">
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs px-2 py-0 h-5 bg-green-50 text-green-700 border-green-200">
            {networkName}
          </Badge>
          <span className="text-sm font-medium">{formatAddress(account)}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <CircleDollarSign className="h-3 w-3" />
          <span>{balance} ETH</span>
        </div>
      </div>
      
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden">
            <Avatar className="h-10 w-10 border border-gray-200 transition-all duration-300 hover:border-primary">
              <AvatarImage src={avatarSrc} alt="User avatar" />
              <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200">
                <User className="h-6 w-6 text-gray-600" />
              </AvatarFallback>
            </Avatar>
            <span className={`absolute -bottom-0 -right-0 flex h-3 w-3 ${isDropdownOpen ? 'translate-y-0' : 'translate-y-5'} transition-transform duration-300`}>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-2">
          <div className="flex items-center justify-between p-2">
            <DropdownMenuLabel className="p-0 text-lg">My Account</DropdownMenuLabel>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {networkName}
            </Badge>
          </div>
          <DropdownMenuSeparator />
          <div className="p-3 bg-gray-50 rounded-md mb-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border border-gray-200">
                <AvatarImage src={avatarSrc} alt="User avatar" />
                <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200">
                  <User className="h-6 w-6 text-gray-600" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium flex items-center gap-1">
                  {formatAddress(account)}
                  <button onClick={copyAddress} className="text-gray-400 hover:text-gray-600">
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center">
                  <Wallet className="h-3 w-3 mr-1" />
                  {balance} ETH
                </div>
              </div>
            </div>
            
            {/* NFT Stats */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-white rounded p-2 flex flex-col items-center">
                <div className="flex items-center text-xs text-gray-500">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  <span>My NFTs</span>
                </div>
                <span className="text-lg font-semibold">{nftStats.total}</span>
              </div>
              <div className="bg-white rounded p-2 flex flex-col items-center">
                <div className="flex items-center text-xs text-gray-500">
                  <Tag className="h-3 w-3 mr-1" />
                  <span>Listed</span>
                </div>
                <span className="text-lg font-semibold">{nftStats.listed}</span>
              </div>
            </div>
          </div>
          
          <Link href="/my-nfts" onClick={() => setIsDropdownOpen(false)}>
            <DropdownMenuItem className="cursor-pointer">
              <ImageIcon className="mr-2 h-4 w-4" />
              <span>My NFTs</span>
            </DropdownMenuItem>
          </Link>
          
          <Link href="/create" onClick={() => setIsDropdownOpen(false)}>
            <DropdownMenuItem className="cursor-pointer">
              <Tag className="mr-2 h-4 w-4" />
              <span>Create NFT</span>
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy Address</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openEtherscan} className="cursor-pointer">
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>View on Etherscan</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-xs text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>Auto-refresh every 30s</span>
          </div>
          <DropdownMenuItem onClick={disconnect} className="cursor-pointer text-red-600 mt-1">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 
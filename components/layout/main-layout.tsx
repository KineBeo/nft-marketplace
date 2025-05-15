import { ReactNode } from "react";
import { UserProfileMenu } from "@/components/ui/user-profile-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MainLayoutProps {
  children: ReactNode;
}

function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="flex space-x-8">
      <Link
        href="/"
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          isActive("/")
            ? "text-gray-900 bg-gray-100"
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
        }`}
      >
        Home
      </Link>
      <Link
        href="/my-nfts"
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          isActive("/my-nfts")
            ? "text-gray-900 bg-gray-100"
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
        }`}
      >
        My NFTs
      </Link>
      <Link
        href="/create"
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          isActive("/create")
            ? "text-gray-900 bg-gray-100"
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
        }`}
      >
        Create NFT
      </Link>
    </nav>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                NFT Marketplace
              </h1>
              <Navigation />
            </div>
            <UserProfileMenu />
          </div>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
} 
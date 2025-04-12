import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Navbar() {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch unread message count
  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ["/api/messages/unread"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/messages/unread");
        if (!res.ok) return 0;
        const data = await res.json();
        return data.count || 0;
      } catch (error) {
        return 0;
      }
    },
    enabled: !!user,
  });

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Services", href: "/services" },
    { name: "Equipment", href: "/equipment" },
    { name: "Network", href: "/network" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-primary font-heading font-bold text-2xl cursor-pointer">
                  HackConnect
                </span>
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a
                    className={`${
                      location === link.href
                        ? "border-primary text-neutral-900"
                        : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {link.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate("/messages")}
            >
              <MessageCircle className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="ml-3 relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-white">
                      {user?.avatar || user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Your Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className={`${
                    location === link.href
                      ? "bg-primary-light bg-opacity-10 border-primary text-primary"
                      : "border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700"
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-neutral-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-white">
                    {user?.avatar || user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-neutral-800">
                  {user?.name}
                </div>
                <div className="text-sm font-medium text-neutral-500">
                  {user?.email}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto relative"
                onClick={() => {
                  navigate("/messages");
                  setMobileMenuOpen(false);
                }}
              >
                <MessageCircle className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </div>
            <div className="mt-3 space-y-1">
              <Link href="/profile">
                <a
                  className="block px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Your Profile
                </a>
              </Link>
              <a
                className="block px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 cursor-pointer"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                Sign out
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

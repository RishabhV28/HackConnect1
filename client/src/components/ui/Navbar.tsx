import { Link, useLocation } from "wouter";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserContext } from "@/App";
import { useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, setUser } = useContext(UserContext);
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch unread messages count
  const { data: unreadMessages } = useQuery({
    queryKey: ['/api/unread-messages'],
    enabled: !!user,
  });

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/logout', {});
      setUser(null);
      setLocation('/login');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Check if the link is active
  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard">
                <span className="font-bold text-2xl text-primary cursor-pointer">
                  HackConnect
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/dashboard">
                <a className={`${isActive('/dashboard') || isActive('/') ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Dashboard
                </a>
              </Link>
              <Link href="/discover">
                <a className={`${isActive('/discover') ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Discover
                </a>
              </Link>
              <Link href="/messages">
                <a className={`${isActive('/messages') ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Messages
                </a>
              </Link>
              <Link href="/connections">
                <a className={`${isActive('/connections') ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Connections
                </a>
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/messages">
                  <Bell className="h-6 w-6" />
                  {unreadMessages?.count > 0 && (
                    <Badge 
                      variant="default" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                    >
                      {unreadMessages.count}
                    </Badge>
                  )}
                </Link>
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="ml-3 relative">
                  <AvatarWithFallback
                    src={user?.avatar}
                    name={user?.name}
                    className="h-8 w-8"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open main menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="text-left">HackConnect</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col space-y-4">
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <a className={`${isActive('/dashboard') || isActive('/') ? 'text-primary font-medium' : 'text-gray-600'} block px-3 py-2 rounded-md text-base`}>
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/discover" onClick={() => setMobileMenuOpen(false)}>
                    <a className={`${isActive('/discover') ? 'text-primary font-medium' : 'text-gray-600'} block px-3 py-2 rounded-md text-base`}>
                      Discover
                    </a>
                  </Link>
                  <Link href="/messages" onClick={() => setMobileMenuOpen(false)}>
                    <a className={`${isActive('/messages') ? 'text-primary font-medium' : 'text-gray-600'} block px-3 py-2 rounded-md text-base`}>
                      Messages
                    </a>
                  </Link>
                  <Link href="/connections" onClick={() => setMobileMenuOpen(false)}>
                    <a className={`${isActive('/connections') ? 'text-primary font-medium' : 'text-gray-600'} block px-3 py-2 rounded-md text-base`}>
                      Connections
                    </a>
                  </Link>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <a className={`${isActive('/profile') ? 'text-primary font-medium' : 'text-gray-600'} block px-3 py-2 rounded-md text-base`}>
                      Profile
                    </a>
                  </Link>
                  <div className="pt-4 border-t border-gray-200">
                    <Button 
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full justify-start px-3"
                    >
                      Log out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

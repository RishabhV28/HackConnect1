import { Link, useLocation } from "wouter";
import { Home, Search, MessageSquare, Users, User } from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();

  // Check if the link is active
  const isActive = (path: string) => {
    return location === path || (path === '/dashboard' && location === '/');
  };

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around">
        <Link href="/dashboard">
          <a className={`flex flex-col items-center py-2 px-3 ${isActive('/dashboard') ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        <Link href="/discover">
          <a className={`flex flex-col items-center py-2 px-3 ${isActive('/discover') ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
            <Search className="h-6 w-6" />
            <span className="text-xs mt-1">Discover</span>
          </a>
        </Link>
        <Link href="/messages">
          <a className={`flex flex-col items-center py-2 px-3 ${isActive('/messages') ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
            <MessageSquare className="h-6 w-6" />
            <span className="text-xs mt-1">Messages</span>
          </a>
        </Link>
        <Link href="/connections">
          <a className={`flex flex-col items-center py-2 px-3 ${isActive('/connections') ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
            <Users className="h-6 w-6" />
            <span className="text-xs mt-1">Network</span>
          </a>
        </Link>
        <Link href="/profile">
          <a className={`flex flex-col items-center py-2 px-3 ${isActive('/profile') ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </div>
  );
}

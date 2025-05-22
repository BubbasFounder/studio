'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, MessageCircle, BookOpen, Smile, Settings, LogOut, LogIn, UserPlus, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth-hook';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/mood', label: 'Mood', icon: Smile },
];

const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link href={href} legacyBehavior>
      <a
        className={cn(
          "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
          isActive ? "bg-primary text-primary-foreground" : "text-foreground/80"
        )}
      >
        <Icon className="mr-2 h-5 w-5" />
        {label}
      </a>
    </Link>
  );
};

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" legacyBehavior>
            <a className="flex items-center gap-2 text-2xl font-bold text-primary">
              <PawPrint className="h-8 w-8" />
              <span>Bubba's Friend</span>
            </a>
          </Link>
          
          {user && !loading && (
            <nav className="hidden md:flex items-center space-x-2">
              {navLinks.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
            </nav>
          )}

          <div className="flex items-center space-x-3">
            {loading ? (
              <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL || `https://placehold.co/100x100.png`} alt={user.displayName || user.email || 'User'} data-ai-hint="profile person" />
                      <AvatarFallback>{user.email ? user.email[0].toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.displayName || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" /> Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">
                    <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                  </Link>
                </Button>
              </div>
            )}
            {/* Mobile Menu Trigger (placeholder for now) */}
            <div className="md:hidden">
              {/* Consider using a Sheet component for mobile nav */}
              <Button variant="ghost" size="icon">
                 {user ? <PawPrint className="h-6 w-6" /> : <LogIn className="h-6 w-6"/>}
              </Button>
            </div>
          </div>
        </div>
         {/* Mobile Navigation Links - shown below header on mobile */}
         {user && !loading && (
            <nav className="md:hidden flex items-center justify-around space-x-1 py-2 border-t">
              {navLinks.map((link) => (
                <Link href={link.href} key={link.href} legacyBehavior>
                  <a
                    className={cn(
                      "flex flex-col items-center px-2 py-1 rounded-md text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      (usePathname() === link.href || (link.href !== "/" && usePathname().startsWith(link.href))) ? "text-primary" : "text-foreground/70"
                    )}
                  >
                    <link.icon className="h-5 w-5 mb-0.5" />
                    {link.label}
                  </a>
                </Link>
              ))}
                 <Link href="/settings" legacyBehavior>
                  <a
                    className={cn(
                      "flex flex-col items-center px-2 py-1 rounded-md text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      (usePathname() === "/settings" || usePathname().startsWith("/settings")) ? "text-primary" : "text-foreground/70"
                    )}
                  >
                    <Settings className="h-5 w-5 mb-0.5" />
                    Settings
                  </a>
                </Link>
            </nav>
          )}
      </div>
    </header>
  );
}

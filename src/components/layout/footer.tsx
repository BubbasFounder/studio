'use client';

import Link from 'next/link';
import { PawPrint } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border/50 py-8 text-sm text-muted-foreground">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <PawPrint className="h-5 w-5 mr-2 text-primary" />
          <p>&copy; {new Date().getFullYear()} Bubba's Friend. All rights reserved.</p>
        </div>
        <nav className="flex space-x-4">
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <Link href="/contact" className="hover:text-primary transition-colors">
            Contact Us
          </Link>
        </nav>
      </div>
    </footer>
  );
}

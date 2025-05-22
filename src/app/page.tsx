'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth-hook';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react'; // Using Loader2 for a spinner

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/chat');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading Bubba's Friend...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)]">
        <h1 className="text-5xl font-bold mb-6">
          Welcome to <span className="text-primary">Bubba's Friend</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
          Your personal AI companion for emotional support, journaling, and mood tracking. Let Bubba help you reflect and grow.
        </p>
        <div className="space-x-4">
          <Button asChild size="lg">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
        <div className="mt-12">
          <img src="https://placehold.co/300x300.png" alt="Bubba the Yorkie illustration" data-ai-hint="friendly dog" className="rounded-full shadow-lg" />
        </div>
      </div>
    );
  }

  // This part should ideally not be reached if the useEffect redirect works.
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="mt-4 text-lg">Redirecting...</p>
    </div>
  );
}
'use client';

import React from 'react';
import Sidebar from './Sidebar';
import FollowBar from '@/components/layout/FollowBar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If not authenticated, show only the children (which should be the login/register pages)
  if (status === 'unauthenticated') {
    return <>{children}</>;
  }

  // If loading, show a loading state
  if (status === 'loading') {
    return <div className="h-screen flex items-center justify-center bg-[var(--primary-bg)]">
      <p className="text-[var(--primary-text)]">Loading...</p>
    </div>;
  }

  // If authenticated, show the full layout
  return (
    <div className="h-screen bg-[var(--primary-bg)]">
      <div className="container h-full mx-auto xl:px-30 max-w-7xl">
        <div className="grid grid-cols-4 h-full">
          <Sidebar />
          <div className="col-span-3 lg:col-span-2 border-x border-[var(--border-color)]">
            {children}
          </div>
          <FollowBar />
        </div>
      </div>
    </div>
  );
};

export default Layout; 
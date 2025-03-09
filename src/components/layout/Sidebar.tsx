'use client';

import React from 'react';
import { BsHouseFill } from 'react-icons/bs';
import { FaUser } from 'react-icons/fa';
import { BiLogOut } from 'react-icons/bi';
import { GiChessKnight } from 'react-icons/gi';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Sidebar = () => {
  const router = useRouter();
  const { data: session } = useSession();
  
  const items = [
    {
      label: 'Lobby',
      href: '/',
      icon: BsHouseFill
    },
    {
      label: 'Play',
      href: 'https://anichess.com/pvp',
      icon: GiChessKnight,
      external: true
    },
    {
      label: 'Profile',
      href: `/users/${session?.user?.username}`,
      icon: FaUser
    }
  ];

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="col-span-1 h-full pr-4 md:pr-6">
      <div className="flex flex-col items-end">
        <div className="space-y-2 lg:w-[230px]">
          <Link href="/">
            <div className="p-4 hover:bg-[var(--hover-bg)] transition">
              <div className="w-[160px] flex items-center">
                <img 
                  src="/images/anichess.png" 
                  alt="Anichess" 
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </Link>
          {items.map((item) => (
            <Link 
              href={item.href} 
              key={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
            >
              <div className="flex flex-row items-center">
                <div className="relative rounded-full h-14 w-14 flex items-center justify-center p-4 hover:bg-slate-300 hover:bg-opacity-10 cursor-pointer lg:hidden">
                  <item.icon size={28} color="white" />
                </div>
                <div className="relative hidden lg:flex items-center gap-4 p-4 rounded-full hover:bg-slate-300 hover:bg-opacity-10 cursor-pointer">
                  <item.icon size={24} color="white" />
                  <p className="hidden lg:block text-white text-xl">
                    {item.label}
                  </p>
                </div>
              </div>
            </Link>
          ))}
          <div onClick={handleSignOut} className="flex flex-row items-center">
            <div className="relative rounded-full h-14 w-14 flex items-center justify-center p-4 hover:bg-slate-300 hover:bg-opacity-10 cursor-pointer lg:hidden">
              <BiLogOut size={28} color="white" />
            </div>
            <div className="relative hidden lg:flex items-center gap-4 p-4 rounded-full hover:bg-slate-300 hover:bg-opacity-10 cursor-pointer">
              <BiLogOut size={24} color="white" />
              <p className="hidden lg:block text-white text-xl">
                Logout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 
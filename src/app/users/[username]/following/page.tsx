'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import UserCard from '@/components/UserCard';

interface User {
  id: string;
  name: string;
  username: string;
  bio?: string;
  followingIds: string[];
  followerIds: string[];
  profileImage?: string;
}

export default function Following() {
  const { username } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the user first to get their display name
        const userResponse = await axios.get(`/api/users/${username}`);
        setUser(userResponse.data.user);
        
        // Then fetch who they're following
        const followingResponse = await axios.get(`/api/users/${username}/following`);
        setFollowing(followingResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchData();
    }
  }, [username]);

  if (status === 'loading' || loading) {
    return <div className="text-white p-4">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2 p-4 border-b border-neutral-800">
        <button 
          onClick={() => router.back()}
          className="hover:opacity-70 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-white text-xl font-semibold">
            {user?.name ? `${user.name}'s following` : 'Following'}
          </h1>
          <p className="text-neutral-500">@{username}</p>
        </div>
      </div>
      <div className="flex flex-col">
        {following.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
        {following.length === 0 && (
          <div className="text-neutral-500 text-center p-6">
            Not following anyone yet
          </div>
        )}
      </div>
    </div>
  );
} 
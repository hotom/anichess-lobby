'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Tweet from '@/components/Tweet';
import { useSession } from 'next-auth/react';

export default function UserProfile() {
  const { username } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/api/users/${username}`);
        setUser(response.data.user);
        setTweets(response.data.tweets);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUser();
    }
  }, [username]);

  // Handle authentication
  if (status === 'loading') {
    return <div className="text-white">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (loading) {
    return <div className="text-white p-4">Loading profile...</div>;
  }

  if (!user) {
    return <div className="text-white p-4">User not found</div>;
  }

  return (
    <div>
      <div className="bg-neutral-700 h-44 relative">
        {user.coverImage && (
          <img
            src={user.coverImage}
            alt="Cover Image"
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-white text-2xl font-bold">{user.name}</h1>
            <p className="text-neutral-500">@{user.username}</p>
          </div>
          {session?.user?.username === user.username && (
            <button className="px-4 py-2 rounded-full border border-neutral-800 text-white hover:bg-neutral-900 transition">
              Edit Profile
            </button>
          )}
        </div>
        <div className="mt-4 text-white">{user.bio}</div>
        <div className="flex gap-4 mt-4 text-neutral-500">
          <div>
            <span className="text-white font-bold">{user.followingIds?.length || 0}</span> Following
          </div>
          <div>
            <span className="text-white font-bold">{user.followerIds?.length || 0}</span> Followers
          </div>
        </div>
      </div>
      <div className="border-b border-neutral-800"></div>
      <div>
        {tweets.map((tweet: any) => (
          <Tweet key={tweet.id} data={tweet} />
        ))}
      </div>
    </div>
  );
} 
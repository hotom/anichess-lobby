'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  username: string;
  profileImage?: string;
  image?: string;
  followingIds: string[];
  followerIds: string[];
}

interface UserCardProps {
  user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const router = useRouter();

  const onClick = useCallback(() => {
    router.push(`/users/${user.username}`);
  }, [router, user.username]);

  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-4 p-4 hover:bg-neutral-900 transition cursor-pointer border-b border-neutral-800"
    >
      <div className="flex-shrink-0">
        {(user.profileImage || user.image) ? (
          <img
            src={user.profileImage || user.image}
            alt={user.name}
            className="rounded-full h-14 w-14 object-cover"
          />
        ) : (
          <div className="rounded-full h-14 w-14 bg-neutral-600 flex items-center justify-center">
            <span className="text-2xl text-white">{user.name[0]}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <h3 className="text-white font-semibold text-base">{user.name}</h3>
        <p className="text-neutral-500 text-sm">@{user.username}</p>
      </div>
    </div>
  );
};

export default UserCard; 
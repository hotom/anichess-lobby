'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  name: string;
  username: string;
  profileImage?: string;
}

const FollowBar = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { status } = useSession();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (status === 'authenticated') {
      fetchUsers();
    }
  }, [status]);

  if (status !== 'authenticated') {
    return null;
  }

  return (
    <div className="px-6 py-4 hidden lg:block">
      <div className="bg-neutral-800 rounded-xl p-4">
        <h2 className="text-white text-xl font-semibold">Who to follow</h2>
        <div className="flex flex-col gap-6 mt-4">
          {users.map((user) => (
            <Link href={`/users/${user.username}`} key={user.id}>
              <div className="flex flex-row gap-4 hover:bg-neutral-700 transition cursor-pointer p-2 rounded">
                <div className="flex flex-col">
                  <p className="text-white font-semibold text-sm">{user.name}</p>
                  <p className="text-neutral-400 text-sm">@{user.username}</p>
                </div>
              </div>
            </Link>
          ))}
          {users.length === 0 && (
            <div className="text-neutral-400 text-center py-4">
              No users to follow
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowBar; 
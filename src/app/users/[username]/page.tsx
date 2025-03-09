'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Post from '@/components/Post';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface User {
  id: string;
  username: string;
  name: string;
  bio?: string;
  coverImage?: string;
  profileImage?: string;
  followingIds: string[];
  followerIds: string[];
}

export default function UserProfile() {
  const { username } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/api/users/${username}`);
        setUser(response.data.user);
        setEditedName(response.data.user.name);
        setPosts(response.data.posts);
        setIsFollowing(response.data.user.followerIds?.includes(session?.user?.id));
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    if (username && session?.user?.id) {
      fetchUser();
    }
  }, [username, session?.user?.id]);

  const handleImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      // Clean up previous preview URL if it exists
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  }, [previewImage]);

  const uploadImage = useCallback(async () => {
    if (!imageFile) return null;
    
    const formData = new FormData();
    formData.append('file', imageFile);
    
    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      return response.data.url;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw new Error(error?.response?.data?.error || 'Failed to upload image');
    }
  }, [imageFile]);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const toggleFollow = useCallback(async () => {
    try {
      if (!session?.user?.id) {
        toast.error('Please log in to follow users');
        return;
      }

      const response = await axios.post(`/api/follow`, { userId: user?.id });
      
      if (response.data.following) {
        toast.success(`Following @${user?.username}`);
      } else {
        toast.success(`Unfollowed @${user?.username}`);
      }

      setIsFollowing(response.data.following);
      setUser((prev: User | null) => {
        if (!prev || !session.user?.id) return prev;
        return {
          ...prev,
          followerIds: response.data.following 
            ? [...(prev.followerIds || []), session.user.id]
            : prev.followerIds?.filter((id: string) => id !== session.user.id)
        };
      });
    } catch (error) {
      toast.error('Something went wrong');
    }
  }, [user?.id, user?.username, session?.user?.id]);

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditedName(user?.name || '');
  }, [user?.name]);

  const saveName = useCallback(async () => {
    try {
      if (!editedName.trim()) {
        toast.error('Display name cannot be empty');
        return;
      }

      if (!session?.user?.username) {
        toast.error('You must be logged in');
        return;
      }

      let profileImageUrl = null;
      if (imageFile) {
        try {
          profileImageUrl = await uploadImage();
        } catch (error) {
          toast.error('Failed to upload image');
          return;
        }
      }

      const response = await axios.patch(`/api/users/edit`, {
        name: editedName,
        ...(profileImageUrl && { profileImage: profileImageUrl })
      });

      if (response.data.error) {
        toast.error(response.data.error);
        return;
      }

      setUser(prev => prev ? { 
        ...prev, 
        name: editedName,
        ...(profileImageUrl && { profileImage: profileImageUrl })
      } : null);
      setIsEditing(false);
      setImageFile(null);
      setPreviewImage(null);
      toast.success('Profile updated!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error?.response?.data?.error || 'Failed to update profile');
    }
  }, [editedName, session?.user?.username, imageFile, uploadImage]);

  const goToFollowers = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    router.push(`/users/${username}/followers`);
  }, [router, username]);

  const goToFollowing = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    router.push(`/users/${username}/following`);
  }, [router, username]);

  if (status === 'loading' || loading) {
    return <div className="text-white p-4">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (!user) {
    return <div className="text-white p-4">User not found</div>;
  }

  return (
    <div className="bg-[var(--primary-bg)]">
      <div className="p-6">
        <div className="flex justify-between items-start gap-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              {isEditing ? (
                <div className="relative group">
                  <div className="w-36 h-36 rounded-full overflow-hidden bg-[var(--secondary-bg)] border-2 border-[var(--border-color)] flex items-center justify-center">
                    <div className="w-full h-full relative">
                      <img
                        src={previewImage || user.profileImage || '/images/placeholder.png'}
                        alt="Profile"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <label 
                    htmlFor="profile-upload" 
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={1.5} 
                      stroke="currentColor" 
                      className="w-8 h-8 text-white mb-2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                    <span className="text-white text-sm font-medium">Upload Photo</span>
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="w-36 h-36 rounded-full overflow-hidden bg-[var(--secondary-bg)] border-2 border-[var(--border-color)] flex items-center justify-center">
                  {user.profileImage ? (
                    <div className="w-full h-full relative">
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl text-[var(--primary-text)]">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex-grow pt-2">
              {isEditing ? (
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="input-primary text-xl flex-grow min-w-[200px] max-w-[400px]"
                    placeholder="Display name"
                    maxLength={50}
                  />
                  <div className="flex gap-3">
                    <button onClick={saveName} className="btn-primary">
                      Save
                    </button>
                    <button onClick={cancelEditing} className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <h1 className="text-[var(--primary-text)] text-2xl font-bold">{user.name}</h1>
              )}
              <p className="text-[var(--secondary-text)] mt-1">@{user.username}</p>
              {user.bio && (
                <p className="text-[var(--primary-text)] mt-4 max-w-[600px]">{user.bio}</p>
              )}
              <div className="flex gap-6 mt-6 text-[var(--secondary-text)]">
                <button 
                  onClick={goToFollowing}
                  className="hover:text-[var(--primary-text)] transition group"
                >
                  <span className="text-[var(--primary-text)] font-bold group-hover:text-[var(--accent-color)]">
                    {user.followingIds?.length || 0}
                  </span> Following
                </button>
                <button 
                  onClick={goToFollowers}
                  className="hover:text-[var(--primary-text)] transition group"
                >
                  <span className="text-[var(--primary-text)] font-bold group-hover:text-[var(--accent-color)]">
                    {user.followerIds?.length || 0}
                  </span> Followers
                </button>
              </div>
            </div>
          </div>
          {session?.user?.username === user.username ? (
            <button onClick={startEditing} className="btn-secondary">
              Edit Profile
            </button>
          ) : (
            <button 
              onClick={toggleFollow}
              className={isFollowing ? 'btn-danger' : 'btn-primary'}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      </div>
      <div className="border-b border-[var(--border-color)]"></div>
      <div>
        {posts.map((post: any) => (
          <Post key={post.id} data={post} />
        ))}
      </div>
    </div>
  );
} 
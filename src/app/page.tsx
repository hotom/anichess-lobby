'use client';

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import Post from "@/components/Post";

export default function Home() {
  const { data: session, status } = useSession();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const router = useRouter();

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

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const removeImage = useCallback(() => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setImageFile(null);
    setPreviewImage(null);
  }, [previewImage]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (status === 'loading') {
    return <div className="text-white">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const onSubmit = async () => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('body', content);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await axios.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Post created!');
      setContent('');
      setImageFile(null);
      setPreviewImage(null);
      fetchPosts(); // Refresh posts after posting
    } catch (error: any) {
      // Display the specific error message from the server if available
      const errorMessage = error.response?.data || error.message || 'Something went wrong';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold p-4">Lobby</h1>
      <div className="border-b border-[var(--border-color)] p-6">
        <div className="flex gap-4">
          <div className="w-full">
            <textarea
              className="
                disabled:opacity-80 
                peer 
                resize-none 
                w-full 
                bg-[var(--secondary-bg)] 
                ring-0 
                outline-none 
                text-[20px] 
                placeholder-[var(--secondary-text)] 
                text-[var(--primary-text)]
                p-4
                rounded-lg
              "
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
            ></textarea>
            {previewImage && (
              <div className="relative mt-4 rounded-lg overflow-hidden max-h-[300px] bg-[var(--secondary-bg)]">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="max-w-full h-auto object-contain"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <hr className="opacity-0 peer-focus:opacity-100 h-[1px] w-full border-[var(--border-color)] transition mt-2" />
            <div className="mt-4 flex justify-end items-center gap-4">
              <label className="cursor-pointer hover:opacity-80 transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <button
                className="btn-primary disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={onSubmit}
                disabled={isLoading || (!content && !imageFile)}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
      <div>
        {posts.map((post: any) => (
          <Post key={post.id} data={post} />
        ))}
      </div>
    </div>
  );
}

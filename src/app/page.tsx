'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import Tweet from "@/components/Tweet";

export default function Home() {
  const { data: session, status } = useSession();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tweets, setTweets] = useState([]);
  const router = useRouter();

  const fetchTweets = async () => {
    try {
      const response = await axios.get('/api/tweets');
      setTweets(response.data);
    } catch (error) {
      console.error('Error fetching tweets:', error);
      toast.error('Failed to load tweets');
    }
  };

  useEffect(() => {
    fetchTweets();
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
      await axios.post('/api/tweets', { content });
      toast.success('Tweet created!');
      setContent('');
      fetchTweets(); // Refresh tweets after posting
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold p-4">Lobby</h1>
      <div className="border-b-[1px] border-neutral-800 p-4">
        <div className="flex gap-4">
          <div className="w-full">
            <textarea
              className="disabled:opacity-80 peer resize-none mt-3 w-full bg-black ring-0 outline-none text-[20px] placeholder-neutral-500 text-white"
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
            ></textarea>
            <hr className="opacity-0 peer-focus:opacity-100 h-[1px] w-full border-neutral-800 transition" />
            <div className="mt-4 flex justify-end">
              <button
                className="disabled:opacity-70 disabled:cursor-not-allowed px-4 py-2 rounded-full font-semibold bg-sky-500 hover:bg-sky-600 transition"
                onClick={onSubmit}
                disabled={isLoading || !content}
              >
                Tweet
              </button>
            </div>
          </div>
        </div>
      </div>
      <div>
        {tweets.map((tweet: any) => (
          <Tweet key={tweet.id} data={tweet} />
        ))}
      </div>
    </div>
  );
}

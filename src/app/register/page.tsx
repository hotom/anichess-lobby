'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Input from '@/components/Input';

const Register = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    username: '',
    password: ''
  });

  const onSubmit = useCallback(async () => {
    try {
      setIsLoading(true);

      // Validate input
      if (!data.username || !data.password) {
        toast.error('Please fill in all fields');
        setIsLoading(false);
        return;
      }
      
      // Register the user
      await axios.post('/api/register', data);
      toast.success('Account created!');
      
      // Sign in the user
      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false
      });

      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
      } else {
        router.push('/');
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data || 'Something went wrong');
      } else {
        toast.error('Something went wrong');
      }
      setIsLoading(false);
    }
  }, [data, router]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      onSubmit();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <div className="bg-neutral-900 px-8 py-6 rounded-lg w-full max-w-md">
        <h1 className="text-white text-3xl font-semibold mb-6 text-center">Create an account</h1>
        <div className="space-y-4">
          <Input
            placeholder="Username"
            value={data.username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData({ ...data, username: e.target.value })}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Input
            placeholder="Password"
            type="password"
            value={data.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData({ ...data, password: e.target.value })}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            onClick={onSubmit}
            disabled={isLoading || !data.username || !data.password}
            className="w-full bg-sky-500 text-white py-2 rounded-full font-semibold hover:bg-sky-600 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>
        </div>
        <p className="text-neutral-500 text-center mt-4">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-sky-500 hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register; 
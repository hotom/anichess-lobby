'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Input from '@/components/Input';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);

      const result = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        router.push('/');
        router.refresh();
        toast.success('Welcome back!');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <div className="bg-neutral-900 px-8 py-6 rounded-lg w-full max-w-md">
        <h1 className="text-white text-3xl font-semibold mb-6 text-center">Sign in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            disabled={isLoading}
          />
          <Input
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !formData.username || !formData.password}
            className="w-full bg-sky-500 text-white py-2 rounded-full font-semibold hover:bg-sky-600 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-neutral-500 text-center mt-4">
          Don't have an account?{' '}
          <button
            onClick={() => router.push('/register')}
            className="text-sky-500 hover:underline"
            type="button"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
} 
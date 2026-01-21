'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { logger } from '@/utils/logger';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams?.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast.error('Invalid reset token');
      router.push('/forgot-password');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      logger.info('Password reset attempt');
      await api.resetPassword(token, formData.newPassword);
      toast.success('Password reset successful!');
      logger.info('Password reset successful');
      router.push('/login');
    } catch (error: any) {
      logger.error('Password reset failed', error as Error);
      toast.error(error.response?.data?.error || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-saree-maroon">Reset Password</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <input
              type="password"
              required
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full border rounded px-3 py-2"
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full border rounded px-3 py-2"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-saree-maroon text-white py-3 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-saree-maroon hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

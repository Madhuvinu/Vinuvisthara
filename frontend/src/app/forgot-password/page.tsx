'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { logger } from '@/utils/logger';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      logger.info('Password reset requested', { email });
      await api.requestPasswordReset(email);
      setSent(true);
      toast.success('Password reset link sent to your email');
      logger.info('Password reset email sent', { email });
    } catch (error: any) {
      logger.error('Password reset request failed', error as Error);
      toast.error(error.response?.data?.error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-saree-maroon">Check Your Email</h1>
          <p className="text-gray-600 mb-8">
            If an account exists with that email, we've sent a password reset link.
          </p>
          <Link href="/login" className="text-saree-maroon hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-saree-maroon">Forgot Password</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-saree-maroon text-white py-3 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
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

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Loader2, Lock } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { getApiErrorMessage } from '../utils/api';
import AuthLayout from '../components/AuthLayout';

const ResetPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [searchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const token = searchParams.get('token') || '';

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Reset token is missing from the URL.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post('/reset-password', {
        token,
        newPassword: data.newPassword,
      });
      reset();
      toast.success(typeof response.data === 'string' ? response.data : 'Password has been reset successfully.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to reset password.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create a new password"
      subtitle="Choose a fresh password for your JanAwaaz account and you’ll be ready to sign in again."
      spotlightTitle="A clean reset flow for account recovery."
      spotlightCopy="Keep recovery secure and focused. One verified link, one updated password, and you’re back into the dashboard."
      highlights={[
        { label: 'Private', value: 'Token-based access' },
        { label: 'Reliable', value: 'Backend verified' },
        { label: 'Ready', value: 'Login after reset' },
      ]}
      footer={(
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Want to sign in instead?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
            Back to login
          </Link>
        </p>
      )}
    >
      {!token && (
        <p className="mb-5 rounded-[20px] border border-rose-500/15 bg-rose-500/8 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
          This reset link is missing its token. Request a fresh password reset email.
        </p>
      )}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <label className="block">
          <span className="field-label">New password</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              {...register('newPassword', {
                required: 'New password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              className="field-input pl-11"
              placeholder="********"
            />
          </div>
          {errors.newPassword && <p className="mt-2 text-sm text-rose-500">{errors.newPassword.message}</p>}
        </label>

        <button type="submit" disabled={submitting || !token} className="primary-btn w-full">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset password'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;

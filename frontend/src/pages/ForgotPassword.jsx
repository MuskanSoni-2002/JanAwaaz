import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Loader2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getApiErrorMessage } from '../utils/api';
import AuthLayout from '../components/AuthLayout';

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setSubmitting(true);

    try {
      const response = await api.post('/forgot-password', data);
      toast.success(typeof response.data === 'string' ? response.data : 'If the account exists, a reset link has been sent.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to send reset link.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email linked to your account and we’ll send you a secure reset link."
      spotlightTitle="Secure recovery, without the usual friction."
      spotlightCopy="Password recovery is built into the same clean workflow as the rest of the platform, so getting back in stays straightforward."
      highlights={[
        { label: 'Secure', value: 'Email reset link' },
        { label: 'Simple', value: 'One-step request' },
        { label: 'Fast', value: 'Immediate access' },
      ]}
      footer={(
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
            Back to login
          </Link>
        </p>
      )}
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <label className="block">
          <span className="field-label">Email address</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="field-input pl-11"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="mt-2 text-sm text-rose-500">{errors.email.message}</p>}
        </label>

        <button type="submit" disabled={submitting} className="primary-btn w-full">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send reset link'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;

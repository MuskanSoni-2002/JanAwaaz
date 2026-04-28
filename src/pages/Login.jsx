import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, Loader2, Mail } from 'lucide-react';
import { loginSuccess } from '../features/authSlice';
import api from '../services/api';
import { getApiErrorMessage } from '../utils/api';
import AuthLayout from '../components/AuthLayout';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const response = await api.post('/login/citizen', data);
      const token = response.data;
      dispatch(loginSuccess({ token }));
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Login failed. Please check your credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your JanAwaaz workspace to monitor complaint updates and continue active conversations."
      spotlightTitle="A civic dashboard that feels calm, modern, and dependable."
      spotlightCopy="Track public issues without clutter. Stay informed, follow updates, and keep every case in one clean place."
      highlights={[
        { label: 'Track', value: 'Case progress' },
        { label: 'Review', value: 'Latest comments' },
        { label: 'Manage', value: 'Citizen profile' },
      ]}
      footer={(
        <p className="text-sm text-slate-500 dark:text-slate-400">
          New to JanAwaaz?{' '}
          <Link to="/register" className="font-semibold text-primary hover:text-primary-dark">
            Create an account
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

        <label className="block">
          <span className="field-label">Password</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              {...register('password', { required: 'Password is required' })}
              className="field-input pl-11"
              placeholder="********"
            />
          </div>
          {errors.password && <p className="mt-2 text-sm text-rose-500">{errors.password.message}</p>}
        </label>

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            Remember me
          </label>

          <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-dark">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={isLoading} className="primary-btn w-full">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;

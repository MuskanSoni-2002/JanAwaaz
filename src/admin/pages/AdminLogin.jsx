import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { getApiErrorMessage } from '../../utils/api';

export default function AdminLogin() {
  const { authenticated, login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (authenticated) {
    return <Navigate to="/admin/officers" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your admin email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/admin/officers');
    } catch (submissionError) {
      setError(getApiErrorMessage(submissionError, 'Unable to sign in with these credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#06141f_0%,#082f49_42%,#0f766e_100%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <section className="relative hidden overflow-hidden lg:flex lg:w-[54%] lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          <div className="absolute left-[-5rem] top-[-5rem] h-72 w-72 rounded-full bg-emerald-400/12 blur-3xl" />
          <div className="absolute bottom-[-7rem] right-12 h-80 w-80 rounded-full bg-cyan-400/12 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/8 px-4 py-2">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-300" />
              <span className="text-sm font-semibold tracking-[0.18em] text-emerald-100">JANAWAAZ ADMIN</span>
            </div>
          </div>

          <div className="relative max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-200/84">
              Administrative Command
            </p>
            <h1 className="mt-6 text-[clamp(3rem,5vw,4.9rem)] font-bold tracking-[-0.08em] text-white">
              Run officer operations without losing situational clarity.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-slate-200/84">
              One secure console for onboarding officers, reviewing area-wise grievances, and
              redirecting cases whenever workloads shift across the city.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Register', value: 'New officers' },
                { label: 'Review', value: 'Area-wise cases' },
                { label: 'Reassign', value: 'Active workload' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[26px] border border-white/10 bg-white/8 p-4 shadow-[0_22px_60px_-34px_rgba(8,145,178,0.55)] backdrop-blur"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">{item.label}</p>
                  <p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-slate-300/72">
            Official administrative access for the JanAwaaz grievance redressal system.
          </p>
        </section>

        <section className="flex flex-1 items-center justify-center px-6 py-12 sm:px-8">
          <div className="w-full max-w-[430px]">
            <div className="mb-8 lg:hidden">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/8 px-4 py-2">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-300" />
                <span className="text-sm font-semibold tracking-[0.18em] text-emerald-100">JANAWAAZ ADMIN</span>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/8 p-8 shadow-[0_30px_90px_-40px_rgba(8,145,178,0.7)] backdrop-blur-xl sm:p-10">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-200/84">
                  Secure Sign In
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-[-0.05em] text-white">
                  Administrative access
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300/80">
                  Sign in with your admin credentials to manage officers and grievance ownership.
                </p>
              </div>

              {error ? (
                <div className="mt-6 flex items-start gap-3 rounded-[22px] border border-rose-400/16 bg-rose-500/10 px-4 py-3.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                  <p className="text-sm text-rose-100">{error}</p>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-100">Admin email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-300/72" />
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-[22px] border border-white/10 bg-slate-950/36 px-4 py-3.5 pl-11 text-sm text-white placeholder:text-slate-400 focus:border-emerald-300/42 focus:outline-none focus:ring-4 focus:ring-emerald-400/12"
                      placeholder="admin@janawaaz.gov.in"
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-100">Password</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-300/72" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-[22px] border border-white/10 bg-slate-950/36 px-4 py-3.5 pl-11 pr-12 text-sm text-white placeholder:text-slate-400 focus:border-emerald-300/42 focus:outline-none focus:ring-4 focus:ring-emerald-400/12"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-white/6 hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[22px] bg-[linear-gradient(135deg,#059669,#0ea5a4)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_22px_52px_-28px_rgba(16,185,129,0.82)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {loading ? 'Signing in...' : 'Open Admin Console'}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-slate-300/72">
                Need citizen access instead?{' '}
                <Link to="/login" className="font-semibold text-emerald-200 transition-colors hover:text-white">
                  Go to citizen login
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

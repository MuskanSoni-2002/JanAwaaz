import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, Loader2, AlertCircle, Lock, Mail } from 'lucide-react';
import { useOfficerAuth } from '../context/OfficerAuthContext';
import { getApiErrorMessage } from '../../utils/api';

export default function OfficerLogin() {
  const { login } = useOfficerAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/officer/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid credentials. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="officer-portal flex min-h-screen">
      {/* Left panel – branding */}
      <div className="officer-login-panel hidden lg:flex lg:w-[52%] xl:w-[56%]">
        <div className="relative flex h-full w-full flex-col justify-between p-10 xl:p-14">
          {/* Top badge */}
          <div className="flex items-center gap-3">
            <div className="officer-icon-badge">
              <Shield className="h-5 w-5" />
            </div>
            <span className="officer-wordmark text-lg font-bold tracking-[-0.04em]">JanAwaaz</span>
          </div>

          {/* Centre content */}
          <div className="max-w-md">
            <div className="officer-status-badge mb-6">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span>
              Secure Officer Access
            </div>
            <h1 className="officer-hero-title">
              Where civic duty meets decisive action.
            </h1>
            <p className="mt-6 text-base leading-7 text-slate-400">
              The JanAwaaz Officer Command Centre gives you full visibility over assigned grievances,
              real-time status controls, and a seamless communication channel with citizens.
            </p>

            {/* Stats row */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { label: 'Avg. Resolution', value: '3.2d' },
                { label: 'Satisfaction', value: '94%' },
                { label: 'Cases Handled', value: '10K+' },
              ].map((stat) => (
                <div key={stat.label} className="officer-stat-card">
                  <p className="text-2xl font-bold tracking-[-0.04em] text-white">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom note */}
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} JanAwaaz Grievance Redressal System · Official Use Only
          </p>

          {/* Decorative glow orbs */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-24 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />
        </div>
      </div>

      {/* Right panel – login form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="officer-icon-badge">
              <Shield className="h-5 w-5" />
            </div>
            <span className="officer-wordmark text-lg font-bold tracking-[-0.04em]">JanAwaaz</span>
          </div>

          <div className="officer-login-card p-8 sm:p-10">
            <div className="mb-8">
              <p className="officer-kicker">Secure Sign In</p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-white">
                Officer Portal Access
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Enter your registered officer credentials to continue.
              </p>
            </div>

            {error && (
              <div className="officer-alert mb-6 flex items-start gap-3 rounded-2xl px-4 py-3.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                <p className="text-sm text-rose-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="officer-field-label" htmlFor="officer-email">Email address</label>
                <div className="officer-field-shell officer-field-shell-leading mt-2">
                  <Mail className="officer-field-icon" />
                  <input
                    id="officer-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@department.gov.in"
                    className="officer-field-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="officer-field-label" htmlFor="officer-password">Password</label>
                <div className="officer-field-shell officer-field-shell-leading officer-field-shell-trailing mt-2">
                  <Lock className="officer-field-icon" />
                  <input
                    id="officer-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="officer-field-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="officer-field-action"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="officer-primary-btn mt-2 w-full py-3.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating…
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Sign In to Portal
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-500">
              Not an officer?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Go to Citizen Portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

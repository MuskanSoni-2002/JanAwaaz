import { useContext } from 'react';
import { ArrowUpRight, MoonStar, ShieldCheck, Sparkles, SunMedium } from 'lucide-react';
import { ThemeContext } from '../context/theme-context';

const defaultHighlights = [
  { label: 'Single place to track', value: 'Complaints' },
  { label: 'Real-time updates', value: 'Status' },
  { label: 'Secure access', value: 'Citizen login' },
];

const AuthLayout = ({
  eyebrow = 'Citizen Portal',
  title,
  subtitle,
  spotlightTitle,
  spotlightCopy,
  highlights = defaultHighlights,
  children,
  footer,
  formWidth = 'max-w-md',
}) => {
  const themeContext = useContext(ThemeContext);
  const isDarkTheme = themeContext?.isDarkTheme ?? false;
  const toggleTheme = themeContext?.toggleTheme ?? (() => {});

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="auth-spotlight animate-fade-rise">
          <div className="relative flex h-full flex-col justify-between gap-10 p-8 sm:p-10 lg:p-12">
            <div className="absolute inset-x-8 top-8 flex items-center justify-between sm:inset-x-10 lg:inset-x-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-medium tracking-[0.18em] text-white/76 uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                {eyebrow}
              </span>
              <div className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-white/80 sm:flex">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>

            <div className="pt-18 sm:pt-20">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-medium text-white/76">
                <ShieldCheck className="h-3.5 w-3.5" />
                Minimal. Clear. Dependable.
              </div>
              <h1 className="mt-6 max-w-lg text-4xl font-bold leading-[1.02] tracking-[-0.05em] text-white sm:text-5xl">
                {spotlightTitle}
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/70 sm:text-base">
                {spotlightCopy}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-white/46">{item.label}</p>
                  <p className="mt-2 text-base font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`w-full ${formWidth} justify-self-center animate-fade-rise animate-fade-rise-delay-1`}>
          <div className="auth-card p-7 sm:p-9">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="page-kicker">{eyebrow}</span>
                <h2 className="page-title mt-4">{title}</h2>
                <p className="page-copy mt-3">{subtitle}</p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="secondary-btn h-11 w-11 shrink-0 rounded-2xl px-0"
                aria-label="Toggle theme"
                aria-pressed={isDarkTheme}
              >
                {isDarkTheme ? <SunMedium className="h-4.5 w-4.5" /> : <MoonStar className="h-4.5 w-4.5" />}
              </button>
            </div>

            <div className="mt-8">{children}</div>

            {footer && (
              <div className="mt-8 border-t pt-6 subtle-divider">
                {footer}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthLayout;

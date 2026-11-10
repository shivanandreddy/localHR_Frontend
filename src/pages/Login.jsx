import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { Webhook } from "lucide-react";

export default function Login({ onLoginSuccess }) {
  const { login } = useContext(AuthContext);
  const {  currentAccent } = useContext(ThemeContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const accents = [
    { value: 'blue', color: 'bg-blue-600' },
    { value: 'orange', color: 'bg-orange-600' },
    { value: 'emerald', color: 'bg-emerald-600' },
    { value: 'violet', color: 'bg-violet-600' },
  ];

  const handleLogin = async (event) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const result = await login(email.trim(), password);

      if (result?.success) {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        setErrorMessage(result?.message || "Unable to sign in. Please check your details.");
      }
    } catch (error) {
      setErrorMessage(
        error?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-slate-900 dark:text-slate-100 sm:px-6 lg:px-8 transition-colors duration-200">
      

      {/* Ambient background effects */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white dark:bg-slate-900 shadow-2xl shadow-black/30 lg:min-h-[650px] lg:grid-cols-2 transition-colors duration-200">
          
          {/* Brand / welcome panel */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10"
            />
            <div
              aria-hidden="true"
              className="absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/10"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-2xl"
            />

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                  <Webhook size={24} strokeWidth={2.5} className={`${currentAccent.text} animate-spin`} />
                </div>
                <span className={`text-2xl font-bold tracking-tight ${currentAccent.text}`}>
                  Local<span className="text-white">HR</span>
                </span>
              </div>

              <div className="mt-24 max-w-md animate-[fadeUp_.8s_ease-out_both]">
  <p className={`mb-4 text-xs font-semibold uppercase tracking-[0.28em] ${currentAccent.text}`}>
    Automated Operations
  </p>
  <h3 className="text-xl font-bold leading-tight tracking-tight xl:text-2xl text-white">
   Human Resource Management System
  </h3>
  <p className="mt-6 max-w-sm text-base leading-7 text-slate-300">
    Eliminate manual administration with smart attendance geofencing and instant payroll processing.
  </p>
</div>
            </div>

            <div className="relative flex items-center gap-3 text-sm text-slate-300">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5">
                <svg viewBox="0 0 24 24" fill="none" className={`h-4 w-4 ${currentAccent.text}`} aria-hidden="true">
                  <path d="m7 12 3.2 3.2L17.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </span>
              Secure access to your HR workspace
            </div>
          </div>

          {/* Login panel */}
          <div className="flex items-center justify-center bg-white dark:bg-slate-900 px-5 py-10 sm:px-10 lg:px-12 xl:px-16 transition-colors duration-200">
            <div className="w-full max-w-md animate-[fadeUp_.7s_ease-out_both]">
              
              {/* Mobile brand */}
              <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${currentAccent.primary} text-white shadow-lg`}>
                  <Webhook size={20} strokeWidth={2.5} className="animate-spin" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Local<span className={currentAccent.text}>HR</span>
                </span>
              </div>

              <div className="mb-8">
                <p className={`mb-2 text-sm font-semibold uppercase tracking-[0.18em] ${currentAccent.text}`}>
                  Welcome back
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  Sign in to your account
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Enter your work email and password to continue.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {errorMessage && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 animate-[fadeUp_.2s_ease-out_both]"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
                      <path d="M12 7.5v5M12 16.2h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Email address
                  </label>
                  <div className="group relative">
                    <span className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:${currentAccent.text.replace('text-', 'text-')}`}>
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                        <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
                        <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@company.com"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-3.5 pl-12 pr-4 text-base text-slate-900 dark:text-slate-100 outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                  </div>
                  <div className="group relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                        <rect x="4" y="10" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
                        <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        <path d="M12 14.5v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-3.5 pl-12 pr-12 text-base text-slate-900 dark:text-slate-100 outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none"
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                          <path d="M3 3 21 21M10.6 10.7a2 2 0 0 0 2.7 2.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                          <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 8.8 4.5 9.8 6.3a1.4 1.4 0 0 1 0 1.4 15 15 0 0 1-3.1 3.7M6.2 6.3A15.4 15.4 0 0 0 2.2 11.3a1.4 1.4 0 0 0 0 1.4C3.2 14.5 6.8 19 12 19c1 0 2-.2 2.9-.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                          <path d="M2.2 12s3.6-7 9.8-7 9.8 7 9.8 7-3.6 7-9.8 7-9.8-7-9.8-7Z" stroke="currentColor" strokeWidth="1.7" />
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl ${currentAccent.primary} px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  {loading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity=".25" />
                        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                        <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-emerald-600" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Protected by secure authentication
              </div>

              <p className="mt-10 text-center text-xs text-slate-400 dark:text-slate-500">
                © {new Date().getFullYear()} LocalHR. All rights reserved.
              </p>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/MySupplyChainDashboard";
import InventoryList from "./pages/ProductInventoryList";
import ForecastingDetail from "./pages/AIDemandForecastingDetail";
import Orders from "./pages/Orders";
import LandingPage from "./pages/LandingPage";
import { isAuthenticated, setToken } from "./lib/auth";
import { auth } from "./lib/api";

interface LoginGateProps {
  usernameOrEmail: string;
  setUsernameOrEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  signUpUsername: string;
  setSignUpUsername: (v: string) => void;
  signUpEmail: string;
  setSignUpEmail: (v: string) => void;
  signUpPassword: string;
  setSignUpPassword: (v: string) => void;
  error: string | null;
  setError: (v: string | null) => void;
  handleSignIn: () => void;
  handleSignUp: () => void;
}

function LoginGate({
  usernameOrEmail,
  setUsernameOrEmail,
  password,
  setPassword,
  signUpUsername,
  setSignUpUsername,
  signUpEmail,
  setSignUpEmail,
  signUpPassword,
  setSignUpPassword,
  error,
  handleSignIn,
  handleSignUp
}: LoginGateProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen bg-[#0c0e12] flex flex-col items-center justify-center p-6 relative overflow-hidden font-['Outfit'] select-none">
      
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Futuristic glowing auras */}
        <div 
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] opacity-70 animate-pulse" 
          style={{ animationDuration: '10s' }}
        ></div>
        <div 
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-secondary/8 rounded-full blur-[140px] opacity-70 animate-pulse" 
          style={{ animationDuration: '14s' }}
        ></div>
        
        {/* Cyberpunk matrix-grid overlay */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-80"
        ></div>
      </div>

      <div className="w-[460px] max-w-full bg-[#15181e]/75 border border-white/5 rounded-3xl p-8 space-y-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-10 relative">
        
        {/* Inner Card Glow Lines */}
        <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-primary/45 to-transparent"></div>
        <div className="absolute inset-x-0 -bottom-px h-[2px] bg-gradient-to-r from-transparent via-secondary/25 to-transparent"></div>

        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary/15 to-secondary/5 border border-primary/20 rounded-2xl text-primary shadow-[0_8px_20px_rgba(175,198,255,0.15)] mb-1">
            <span className="material-symbols-outlined text-[28px] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              terminal
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-[#e2e2e8] to-secondary bg-clip-text text-transparent">
            MySupplyChain Portal
          </h1>
          <p className="text-on-surface-variant/80 text-sm max-w-[340px] mx-auto leading-relaxed">
            Access the high-performance enterprise supply chain terminal.
          </p>
        </div>

        {/* Custom Premium Sliding Tabs */}
        <div className="relative bg-[#0d0e12]/60 p-1.5 rounded-2xl border border-white/5 flex">
          {/* Animated background pill */}
          <div 
            className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-primary/15 to-secondary/10 border border-primary/20 shadow-md transition-all duration-300 ease-out pointer-events-none"
            style={{
              left: activeTab === 'signin' ? '6px' : 'calc(50% + 2px)',
              width: 'calc(50% - 8px)'
            }}
          ></div>

          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 relative z-10 cursor-pointer text-center ${
              activeTab === 'signin' ? 'text-primary' : 'text-on-surface-variant/60 hover:text-on-surface'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 relative z-10 cursor-pointer text-center ${
              activeTab === 'signup' ? 'text-secondary' : 'text-on-surface-variant/60 hover:text-on-surface'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="bg-[#ffdad6]/8 border border-error/25 rounded-2xl p-4 text-error text-xs flex items-start gap-2.5 shadow-lg animate-shake">
            <span className="material-symbols-outlined text-[18px] text-error">warning</span>
            <span className="font-medium text-error-container/90 leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form Container with animated fade & translate transition */}
        <div 
          className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
            activeTab === 'signin' ? 'min-h-[240px]' : 'min-h-[370px]'
          }`}
        >
          
          {/* --- Sign In Tab Content --- */}
          <div 
            className={`space-y-4 transition-all duration-300 ease-out transform absolute inset-x-0 top-0 ${
              activeTab === 'signin' 
                ? 'opacity-100 translate-x-0 pointer-events-auto' 
                : 'opacity-0 -translate-x-12 pointer-events-none'
            }`}
          >
            <form onSubmit={(e) => { e.preventDefault(); handleSignIn(); }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant/80 tracking-wide block">Username or Corporate Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline/65 text-[20px]">person</span>
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="e.g., administrator"
                    className="w-full bg-[#0d0e12]/70 border border-outline-variant/30 focus:border-primary/50 rounded-xl py-3.5 pl-11 pr-4 text-sm text-on-surface placeholder:text-outline/40 focus:outline-none transition-all duration-200"
                    required={activeTab === 'signin'}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant/80 tracking-wide block">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline/65 text-[20px]">lock</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#0d0e12]/70 border border-outline-variant/30 focus:border-primary/50 rounded-xl py-3.5 pl-11 pr-4 text-sm text-on-surface placeholder:text-outline/40 focus:outline-none transition-all duration-200"
                    required={activeTab === 'signin'}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-[#7098ff] hover:from-[#c2d5ff] hover:to-[#afc6ff] text-on-primary-container font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(175,198,255,0.1)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  Sign In
                </button>
              </div>
            </form>
          </div>

          {/* --- Sign Up Tab Content --- */}
          <div 
            className={`space-y-4 transition-all duration-300 ease-out transform absolute inset-x-0 top-0 ${
              activeTab === 'signup' 
                ? 'opacity-100 translate-x-0 pointer-events-auto' 
                : 'opacity-0 translate-x-12 pointer-events-none'
            }`}
          >
            <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant/80 tracking-wide block">Username</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline/65 text-[20px]">person</span>
                  <input
                    type="text"
                    value={signUpUsername}
                    onChange={(e) => setSignUpUsername(e.target.value)}
                    placeholder="Create a username"
                    className="w-full bg-[#0d0e12]/70 border border-outline-variant/30 focus:border-secondary/50 rounded-xl py-3.5 pl-11 pr-4 text-sm text-on-surface placeholder:text-outline/40 focus:outline-none transition-all duration-200"
                    required={activeTab === 'signup'}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant/80 tracking-wide block">Corporate Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline/65 text-[20px]">mail</span>
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-[#0d0e12]/70 border border-outline-variant/30 focus:border-secondary/50 rounded-xl py-3.5 pl-11 pr-4 text-sm text-on-surface placeholder:text-outline/40 focus:outline-none transition-all duration-200"
                    required={activeTab === 'signup'}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant/80 tracking-wide block">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline/65 text-[20px]">lock</span>
                  <input
                    type="password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Enter secure password"
                    className="w-full bg-[#0d0e12]/70 border border-outline-variant/30 focus:border-secondary/50 rounded-xl py-3.5 pl-11 pr-4 text-sm text-on-surface placeholder:text-outline/40 focus:outline-none transition-all duration-200"
                    required={activeTab === 'signup'}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#b370ff] to-secondary hover:from-[#d5b5ff] hover:to-[#dfcaff] text-on-primary-container font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(255,175,255,0.1)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                Sign Up
              </button>
            </form>
          </div>

        </div>

        {/* Back to Info Page Link */}
        <div className="text-center pt-4 border-t border-outline-variant/15 text-xs">
          <a 
            href="/" 
            className="inline-flex items-center gap-1.5 text-outline/80 hover:text-primary transition-colors duration-250 cursor-pointer font-medium"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Back to Case Study
          </a>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  
  const [signUpUsername, setSignUpUsername] = useState<string>("");
  const [signUpEmail, setSignUpEmail] = useState<string>("");
  const [signUpPassword, setSignUpPassword] = useState<string>("");

  const [error, setError] = useState<string | null>(null);

  const attemptLogin = async (credentials: { usernameOrEmail: string; password: string }, isSilent = false) => {
    setError(null);
    try {
      const res = await auth.login(credentials);
      setToken(res.token);
      setIsAuth(true);
      return true;
    } catch (err: any) {
      console.error("Login attempt failed:", err);
      if (!isSilent) {
        if (err.status === 401) {
          setError("Invalid credentials. Please verify your username and password.");
        } else {
          setError(
            "We are unable to establish a connection to the secure gateway. Please verify your internet connection or contact corporate IT at support@mysupplychain.com."
          );
        }
      }
      return false;
    }
  };

  useEffect(() => {
    async function initAuth() {
      if (isAuthenticated()) {
        setIsAuth(true);
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  const handleSignIn = async () => {
    setError(null);
    if (!usernameOrEmail.trim() || !password.trim()) {
      setError("Please fill out all fields.");
      return;
    }
    setLoading(true);
    await attemptLogin({ usernameOrEmail, password });
    setLoading(false);
  };

  const handleSignUp = async () => {
    setError(null);
    if (!signUpUsername.trim() || !signUpEmail.trim() || !signUpPassword.trim()) {
      setError("Please fill out all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await auth.register({
        username: signUpUsername.trim(),
        email: signUpEmail.trim(),
        password: signUpPassword
      });
      setToken(res.token);
      setIsAuth(true);
    } catch (err: any) {
      console.error("Sign up failed:", err);
      try {
        const errorDetail = JSON.parse(err.message);
        if (Array.isArray(errorDetail)) {
          setError(errorDetail.map((e: any) => e.description).join(" "));
        } else {
          setError(err.message || "Sign up failed. Please try again.");
        }
      } catch {
        if (err.status === 400 || err.status === 409) {
          setError(err.message || "Registration failed. Ensure password matches security criteria (e.g. uppercase, number, symbol).");
        } else {
          setError("Unable to complete registration. Please check internet connection.");
        }
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0c0e12] flex flex-col items-center justify-center p-6 relative overflow-hidden font-['Outfit'] select-none">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        </div>
        
        <div className="w-[400px] max-w-[90%] bg-[#15181e]/80 border border-white/5 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl z-10">
          <div className="flex justify-center">
            <span className="material-symbols-outlined text-primary text-[48px] animate-spin">
              sync
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MySupplyChain
            </h1>
            <p className="text-on-surface-variant/80 text-sm">
              Establishing secure backend connection...
            </p>
          </div>
          <div className="w-full bg-[#1e2024] rounded-full h-1 overflow-hidden">
            <div className="bg-primary h-1 rounded-full w-2/3 animate-[pulse_1.5s_infinite_ease-in-out]"></div>
          </div>
        </div>
      </div>
    );
  }

  // Common props for the LoginGate
  const loginGateProps = {
    usernameOrEmail,
    setUsernameOrEmail,
    password,
    setPassword,
    signUpUsername,
    setSignUpUsername,
    signUpEmail,
    setSignUpEmail,
    signUpPassword,
    setSignUpPassword,
    error,
    setError,
    handleSignIn,
    handleSignUp
  };

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LandingPage />} />

        {/* Authenticated Application Shell */}
        <Route element={isAuth ? <Layout /> : <LoginGate {...loginGateProps} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/forecasting" element={<ForecastingDetail />} />
          <Route path="/orders" element={<Orders />} />
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

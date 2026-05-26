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
  error: string | null;
  setError: (v: string | null) => void;
  handleManualLogin: (e: React.FormEvent) => void;
  handleSandboxLogin: () => void;
}

function LoginGate({
  usernameOrEmail,
  setUsernameOrEmail,
  password,
  setPassword,
  error,
  setError,
  handleManualLogin,
  handleSandboxLogin
}: LoginGateProps) {
  const [activeView, setActiveView] = useState<"login" | "register">("login");
  
  // Registration local state for Beta requests
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleBetaRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRegisteredSuccess(false);

    if (!regUsername || !regEmail || !regPassword) {
      setError("Please complete all registration fields.");
      return;
    }

    setRegisterLoading(true);
    try {
      await auth.register({
        username: regUsername,
        email: regEmail,
        password: regPassword
      });
      setRegisteredSuccess(true);
      setError(null);
      // Clean form fields
      setRegUsername("");
      setRegEmail("");
      setRegPassword("");
      // Transition back to login view so they can sign in
      setActiveView("login");
    } catch (err: any) {
      console.error("Beta access request failed:", err);
      setError(err.message || "Failed to submit beta request. Please verify your inputs.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleToggleView = (view: "login" | "register") => {
    setError(null);
    setRegisteredSuccess(false);
    setActiveView(view);
  };

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
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-primary/15 to-secondary/5 border border-primary/20 rounded-2xl text-primary shadow-[0_8px_20px_rgba(175,198,255,0.15)] mb-1">
            <span className="material-symbols-outlined text-[32px] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {activeView === "login" ? "admin_panel_settings" : "verified_user"}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-[#e2e2e8] to-secondary bg-clip-text text-transparent">
            {activeView === "login" ? "MySupplyChain Portal" : "Apply for Beta Access"}
          </h1>
          <p className="text-on-surface-variant/80 text-sm max-w-[340px] mx-auto leading-relaxed">
            {activeView === "login" 
              ? "Sign in to connect to your live enterprise forecasting dashboard." 
              : "Provision your professional sandbox account with 120 days of complimentary beta access."}
          </p>
        </div>

        {/* Success celebration banner */}
        {registeredSuccess && (
          <div className="bg-secondary-container/10 border border-secondary/30 rounded-2xl p-4 text-[#4edea3] text-xs flex flex-col gap-1.5 animate-bounce-short shadow-md">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-secondary">check_circle</span>
              <span className="font-semibold leading-relaxed">
                Beta Account Created Successfully!
              </span>
            </div>
            <p className="text-on-surface-variant/90 leading-relaxed pl-7">
              Your credentials are now active for a 120-day trial. Please sign in below to access the platform.
            </p>
          </div>
        )}

        {/* Error Notification Alert */}
        {error && (
          <div className="bg-[#ffdad6]/8 border border-error/25 rounded-2xl p-4 text-error text-xs flex items-start gap-2.5 shadow-lg">
            <span className="material-symbols-outlined text-[18px] text-error">warning</span>
            <span className="font-medium text-error-container/90 leading-relaxed">{error}</span>
          </div>
        )}

        {activeView === "login" ? (
          /* LOGIN VIEW */
          <form onSubmit={handleManualLogin} className="space-y-5">
            {/* Instant Sandbox Bypass */}
            <div className="pb-3 border-b border-outline-variant/15">
              <button
                type="button"
                onClick={handleSandboxLogin}
                className="w-full bg-gradient-to-r from-secondary to-[#60efb7] hover:from-[#60efb7] hover:to-secondary text-on-secondary-container font-extrabold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(78,222,163,0.12)] hover:shadow-[0_4px_25px_rgba(78,222,163,0.25)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                Launch Instant Sandbox Session
              </button>
              <div className="text-[10px] text-outline/80 text-center mt-2 leading-relaxed">
                Bypasses login gates instantly using pre-seeded test data.
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant/90 tracking-wide uppercase pl-1">
                Username or Corporate Email
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors duration-250">
                  mail
                </span>
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="e.g. enterprise_admin"
                  className="w-full bg-[#1a1c20]/65 text-on-surface border border-outline-variant/35 focus:border-primary rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-250 placeholder-outline/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant/90 tracking-wide uppercase pl-1">
                Secure Password
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors duration-250">
                  lock
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-[#1a1c20]/65 text-on-surface border border-outline-variant/35 focus:border-primary rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-250 placeholder-outline/40"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-[#85abff] hover:from-[#c2d5ff] hover:to-[#afc6ff] text-on-primary-container font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(175,198,255,0.15)] hover:shadow-[0_4px_25px_rgba(175,198,255,0.3)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              Sign In to System
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleToggleView("register")}
                className="text-xs text-outline/80 hover:text-primary transition-colors duration-250 cursor-pointer font-bold hover:underline"
              >
                Don't have beta access? Apply for 120-Day Trial
              </button>
            </div>
          </form>
        ) : (
          /* REGISTER / BETA REQUEST VIEW */
          <form onSubmit={handleBetaRequest} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant/90 tracking-wide uppercase pl-1">
                Corporate Username
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors duration-250">
                  person
                </span>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="e.g. global_admin"
                  className="w-full bg-[#1a1c20]/65 text-on-surface border border-outline-variant/35 focus:border-primary rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-250 placeholder-outline/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant/90 tracking-wide uppercase pl-1">
                Professional Email
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors duration-250">
                  corporate_fare
                </span>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. logistics@company.com"
                  className="w-full bg-[#1a1c20]/65 text-on-surface border border-outline-variant/35 focus:border-primary rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-250 placeholder-outline/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant/90 tracking-wide uppercase pl-1">
                Establish Password
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors duration-250">
                  lock_reset
                </span>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 8 characters with numbers"
                  className="w-full bg-[#1a1c20]/65 text-on-surface border border-outline-variant/35 focus:border-primary rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-250 placeholder-outline/40"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={registerLoading}
              className="w-full bg-gradient-to-r from-secondary to-[#60efb7] hover:from-[#60efb7] hover:to-secondary text-on-secondary-container font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(78,222,163,0.1)] hover:shadow-[0_4px_25px_rgba(78,222,163,0.25)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
            >
              {registerLoading ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                  Processing Application...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                  Request Beta Access
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleToggleView("login")}
                className="text-xs text-outline/80 hover:text-primary transition-colors duration-250 cursor-pointer font-bold hover:underline"
              >
                Already have credentials? Sign In
              </button>
            </div>
          </form>
        )}

        {/* Back to Info Page Link */}
        <div className="text-center pt-2 border-t border-outline-variant/15">
          <a 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs text-outline/80 hover:text-primary transition-colors duration-250 cursor-pointer font-medium"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Back to Corporate Portal
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

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError("Please fill in both fields.");
      return;
    }
    setLoading(true);
    await attemptLogin({ usernameOrEmail, password });
    setLoading(false);
  };

  const handleSandboxLogin = async () => {
    setLoading(true);
    await attemptLogin({ usernameOrEmail: "admin", password: "Admin@123" });
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
    error,
    setError,
    handleManualLogin,
    handleSandboxLogin
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

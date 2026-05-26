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
  handleSandboxLogin: () => void;
}

function LoginGate({
  error,
  handleSandboxLogin
}: LoginGateProps) {
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
              terminal
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-[#e2e2e8] to-secondary bg-clip-text text-transparent">
            MySupplyChain Sandbox
          </h1>
          <p className="text-on-surface-variant/80 text-sm max-w-[340px] mx-auto leading-relaxed">
            Explore the live frontend and backend system. The application is running connected to a local ML.NET instance and database.
          </p>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="bg-[#ffdad6]/8 border border-error/25 rounded-2xl p-4 text-error text-xs flex items-start gap-2.5 shadow-lg">
            <span className="material-symbols-outlined text-[18px] text-error">warning</span>
            <span className="font-medium text-error-container/90 leading-relaxed">{error}</span>
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSandboxLogin();
            }}
            className="w-full bg-gradient-to-r from-primary to-[#85abff] hover:from-[#c2d5ff] hover:to-[#afc6ff] text-on-primary-container font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(175,198,255,0.15)] hover:shadow-[0_4px_25px_rgba(175,198,255,0.3)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
            Launch Interactive Sandbox
          </button>
        </div>

        {/* Back to Info Page Link */}
        <div className="text-center pt-4 border-t border-outline-variant/15">
          <a 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs text-outline/80 hover:text-primary transition-colors duration-250 cursor-pointer font-medium"
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

  const handleSandboxLogin = async () => {
    setError(null);
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

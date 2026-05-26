import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/MySupplyChainDashboard";
import InventoryList from "./pages/ProductInventoryList";
import ForecastingDetail from "./pages/AIDemandForecastingDetail";
import Orders from "./pages/Orders";
import { isAuthenticated, setToken } from "./lib/auth";
import { auth } from "./lib/api";

function App() {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showTroubleshoot, setShowTroubleshoot] = useState<boolean>(false);

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
            err.message || 
            "Could not connect to the backend API. Please make sure the backend is running on http://localhost:5001."
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
        setLoading(false);
        return;
      }

      // Silent login attempt using the seeded admin user
      const success = await attemptLogin({ usernameOrEmail: "admin", password: "Admin@123" }, true);
      if (!success) {
        // Try user as fallback
        await attemptLogin({ usernameOrEmail: "user", password: "User@123" }, true);
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

  const handleQuickConnect = async (role: "admin" | "user") => {
    setLoading(true);
    const credentials = 
      role === "admin" 
        ? { usernameOrEmail: "admin", password: "Admin@123" }
        : { usernameOrEmail: "user", password: "User@123" };
    
    setUsernameOrEmail(credentials.usernameOrEmail);
    setPassword(credentials.password);
    
    await attemptLogin(credentials);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-margin-mobile">
        <div className="max-w-md w-full bg-surface-container border border-outline-variant/30 rounded-2xl p-8 text-center space-y-lg shadow-2xl backdrop-blur-md">
          <div className="flex justify-center">
            <span className="material-symbols-outlined text-primary text-[48px] animate-spin">
              sync
            </span>
          </div>
          <div className="space-y-sm">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MySupplyChain
            </h1>
            <p className="text-on-surface-variant text-sm">
              Establishing secure backend connection...
            </p>
          </div>
          <div className="w-full bg-surface-variant rounded-full h-1 overflow-hidden">
            <div className="bg-primary h-1 rounded-full w-2/3 animate-[pulse_1.5s_infinite_ease-in-out]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-margin-mobile">
        <div className="max-w-md w-full bg-surface-container border border-outline-variant/30 rounded-2xl p-8 space-y-lg shadow-2xl backdrop-blur-md">
          
          {/* Logo & Header */}
          <div className="text-center space-y-sm">
            <div className="inline-flex items-center justify-center p-3 bg-primary-container/20 rounded-2xl text-primary mb-2">
              <span className="material-symbols-outlined text-[32px]">
                security
              </span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MySupplyChain Secure Access
            </h1>
            <p className="text-on-surface-variant text-sm">
              Please sign in to connect to the live PostgreSQL & ML services.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-error-container/20 border border-error/30 rounded-xl p-4 text-error text-xs flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sm mt-0.5">warning</span>
                <span>{error}</span>
              </div>
              <button 
                onClick={() => setShowTroubleshoot(!showTroubleshoot)}
                className="text-primary hover:underline text-left font-semibold cursor-pointer"
              >
                {showTroubleshoot ? "Hide troubleshooting steps" : "View troubleshooting steps"}
              </button>
            </div>
          )}

          {/* Troubleshooting Guide */}
          {showTroubleshoot && (
            <div className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-4 space-y-sm text-xs text-on-surface-variant">
              <h3 className="font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">construction</span>
                Troubleshooting Bad Gateway / Refused Connection:
              </h3>
              <p>The frontend React app is running on port <b>5173</b> and communicates with the backend via Vite proxy pointing to port <b>5001</b>.</p>
              <div className="space-y-sm pl-2 border-l border-outline-variant">
                <div>
                  <p className="font-semibold text-on-surface">1. Start the ASP.NET Core Backend:</p>
                  <p className="text-slate-400">Open a terminal in the project root and run:</p>
                  <pre className="bg-surface-container-highest p-1.5 rounded mt-1 overflow-x-auto text-[10px] text-primary">dotnet run --project MySupplyChain.API</pre>
                </div>
                <div>
                  <p className="font-semibold text-on-surface">2. Verify PostgreSQL Database:</p>
                  <p className="text-slate-400">Ensure SQL Server LocalDB or PostgreSQL is running. Seed data will be applied automatically.</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleManualLogin} className="space-y-md">
            <div className="space-y-sm">
              <label className="text-xs font-semibold text-on-surface-variant pl-1">
                Username or Email
              </label>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="e.g. admin"
                className="w-full bg-surface-container-highest text-on-surface border border-outline-variant/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-sm">
              <label className="text-xs font-semibold text-on-surface-variant pl-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. Admin@123"
                className="w-full bg-surface-container-highest text-on-surface border border-outline-variant/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-container text-on-primary-container font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-primary/20 cursor-pointer"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-[1px] bg-outline-variant/30"></div>
            <span className="text-[10px] text-outline font-bold tracking-wider uppercase">Or Quick Connect</span>
            <div className="flex-1 h-[1px] bg-outline-variant/30"></div>
          </div>

          {/* Quick Connect Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickConnect("admin")}
              className="bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 text-on-surface text-xs font-semibold py-2.5 px-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm text-secondary">admin_panel_settings</span>
              Demo Admin
            </button>
            <button
              onClick={() => handleQuickConnect("user")}
              className="bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 text-on-surface text-xs font-semibold py-2.5 px-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm text-primary">person</span>
              Demo User
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/forecasting" element={<ForecastingDetail />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

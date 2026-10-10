import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { Sparkles, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import AmbientBackground from '../../../components/AmbientBackground'

const Login = () => {
  const { loading, handleLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    try {
      const res = await handleLogin(email, password);
      if (res?.user) {
        navigate("/");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.message === "Network Error"
          ? "Unable to connect to backend server. Make sure the backend is running on port 3000."
          : err.message || "Invalid email or password. Please try again.");
      setErrorMessage(msg);
    }
  };

  return (
    <div className="app-layout">
      <AmbientBackground />
      <div className="auth-page">
        <div className="glass-card auth-card">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '1.5rem', transition: 'color 0.2s' }}>
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>

          <div className="auth-header">
            <div className="badge-pill brand-badge">
              <Sparkles size={14} color="#818cf8" />
              <span>GenAI Master</span>
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to continue your AI interview prep</p>
          </div>

          {errorMessage && (
            <div className="alert-error">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label htmlFor="password" style={{ margin: 0 }}>Password</label>
              </div>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?
            <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

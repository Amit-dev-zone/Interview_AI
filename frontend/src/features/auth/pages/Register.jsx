import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { Sparkles, User, Mail, Lock, Eye, EyeOff, Zap, AlertCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import AmbientBackground from '../../../components/AmbientBackground'

const Register = () => {
  const navigate = useNavigate();
  const { loading, handleRegister } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage("Password should be at least 6 characters long.");
      return;
    }

    try {
      const res = await handleRegister(username, email, password);
      if (res?.user) {
        navigate("/");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.message === "Network Error"
          ? "Unable to connect to backend server. Make sure the backend is running on port 3000."
          : err.message || "Registration failed. Please check your details.");
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
              <span>Get Started Free</span>
            </div>
            <h1>Create Account</h1>
            <p>Unlock personalized AI interview simulations</p>
          </div>

          {errorMessage && (
            <div className="alert-error">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  id="username"
                  name="username"
                  placeholder="johndoe"
                  required
                />
              </div>
            </div>

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
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Create a strong password (min 6 chars)"
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
                <span>Creating account...</span>
              ) : (
                <>
                  <Zap size={18} />
                  <span>Get Started Free</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

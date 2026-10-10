import React from 'react'
import { Link, useNavigate } from 'react-router'
import { Sparkles, LogIn, LogOut, User, Zap, Calendar, Bot, History } from 'lucide-react'
import { useAuth } from '../features/auth/hooks/useAuth'

const Navbar = () => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await handleLogout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <div className="logo-icon">
            <Sparkles size={20} />
          </div>
          <span>GenAI<span className="gradient-text-accent">Master</span></span>
        </Link>

        <nav className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/plan" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={15} />
            <span>Resume Prep Plan</span>
          </Link>
          <Link to="/interview/new" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Bot size={15} />
            <span>AI Mock Interview</span>
          </Link>
          {user && (
            <Link to="/interview/history" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <History size={15} />
              <span>History</span>
            </Link>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <div className="user-badge">
                <div className="avatar-circle">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{user.username}</span>
              </div>
              <button onClick={onLogout} className="btn btn-ghost" title="Logout" style={{ padding: '0.5rem 0.9rem' }}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                <LogIn size={16} />
                <span>Sign In</span>
              </Link>
              <Link to="/register" className="btn btn-primary">
                <Zap size={16} />
                <span>Get Started</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

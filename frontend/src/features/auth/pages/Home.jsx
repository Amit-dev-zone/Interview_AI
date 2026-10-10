import React, { useState } from 'react'
import { Link } from 'react-router'
import { 
  Sparkles, 
  Bot, 
  Code2, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  MessageSquare,
  Award,
  Cpu,
  Zap,
  Terminal,
  Calendar,
  FileText
} from 'lucide-react'
import Layout from '../../../components/Layout'
import { useAuth } from '../hooks/useAuth'

const Home = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="home-container">
        {/* If user is logged in, show their personalized dashboard header */}
        {user ? (
          <div className="glass-card dashboard-banner">
            <div className="user-info-group">
              <div className="large-avatar">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="welcome-text">
                <h2>Welcome back, <span className="gradient-text-accent">{user.username}</span>! ??</h2>
                <p>Logged in as <strong style={{ color: '#e2e8f0' }}>{user.email}</strong> • Ready for your next AI practice session?</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/plan" className="btn btn-secondary">
                <Calendar size={16} />
                <span>Resume Prep Plan</span>
              </Link>
              <Link to="/interview/new" className="btn btn-primary">
                <Play size={16} fill="white" />
                <span>Start Mock Interview</span>
              </Link>
            </div>
          </div>
        ) : null}

        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="badge-pill hero-badge">
            <Sparkles size={14} color="#818cf8" />
            <span>Next-Gen GenAI Interview Copilot</span>
          </div>

          <h1>
            Master Your Technical Interviews with <span className="gradient-text">Intelligent AI Feedback</span>
          </h1>

          <p className="hero-subtitle">
            Upload your resume, receive a custom day-by-day study roadmap, and simulate realistic technical & behavioral interviews with instant real-time AI scoring.
          </p>

          <div className="hero-cta-group">
            {user ? (
              <>
                <Link to="/plan" className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
                  <Calendar size={18} />
                  <span>Generate Day-by-Day Plan</span>
                </Link>
                <Link to="/interview/new" className="btn btn-secondary" style={{ padding: '0.9rem 1.75rem', fontSize: '1.05rem' }}>
                  <Bot size={18} />
                  <span>Start Live Mock Interview</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
                  <Zap size={18} />
                  <span>Start Free AI Practice</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '0.9rem 1.75rem', fontSize: '1.05rem' }}>
                  <Terminal size={18} />
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Interviews Simulated</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">98.4%</div>
              <div className="stat-label">Candidate Satisfaction</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">3.5x</div>
              <div className="stat-label">Faster Offer Rate</div>
            </div>
          </div>
        </section>

        {/* TWO FEATURE HIGHLIGHT CARDS */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
          {/* Feature 1: Resume Study Planner */}
          <div className="glass-card glass-card-interactive" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', border: '1px solid rgba(99,102,241,0.3)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', marginBottom: '1.25rem' }}>
              <Calendar size={24} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>AI Resume Day-by-Day Planner</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, flex: 1, marginBottom: '1.5rem' }}>
              Upload your resume in PDF format or paste text. Gemini AI analyzes your experience, detects skill gaps for your dream role, and generates a structured daily study plan with tasks and milestones.
            </p>
            <Link to={user ? "/plan" : "/register"} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              <span>Create Your Prep Plan</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Feature 2: Interactive Mock Interviewer */}
          <div className="glass-card glass-card-interactive" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', border: '1px solid rgba(6,182,212,0.3)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: '1.25rem' }}>
              <Bot size={24} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>Real-Time AI Mock Interviewer</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, flex: 1, marginBottom: '1.5rem' }}>
              Experience realistic interview rounds with speech-to-text voice input. Get instant scoring (0-100), key strengths, constructive improvements, and an exemplary answer for every question.
            </p>
            <Link to={user ? "/interview/new" : "/register"} className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}>
              <span>Start Mock Interview</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="badge-pill" style={{ marginBottom: '1rem' }}>
              <Zap size={14} color="#818cf8" />
              <span>Engineered for Excellence</span>
            </div>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>Everything You Need to Get Hired</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Powered by advanced generative models fine-tuned on real industry hiring rubrics.
            </p>
          </div>

          <div className="features-grid">
            <div className="glass-card glass-card-interactive feature-card">
              <div className="feature-icon-wrapper indigo">
                <Bot size={26} />
              </div>
              <h3>Adaptive Mock Interviews</h3>
              <p>Dynamic AI interviewers that adjust difficulty, challenge edge cases, and ask realistic follow-up questions tailored to your target role.</p>
              <div className="feature-tags">
                <span>System Design</span>
                <span>Algorithms</span>
                <span>Behavioral</span>
              </div>
            </div>

            <div className="glass-card glass-card-interactive feature-card">
              <div className="feature-icon-wrapper cyan">
                <Code2 size={26} />
              </div>
              <h3>Live Code Evaluation</h3>
              <p>Instant breakdown of time and space complexity, syntax correctness, clean code patterns, and missed edge cases in real-time.</p>
              <div className="feature-tags">
                <span>Big-O Analysis</span>
                <span>Refactoring Tips</span>
                <span>Multi-language</span>
              </div>
            </div>

            <div className="glass-card glass-card-interactive feature-card">
              <div className="feature-icon-wrapper purple">
                <Award size={26} />
              </div>
              <h3>Actionable Feedback & Scoring</h3>
              <p>Granular scoring criteria based on actual hiring rubrics used by top tech companies, highlighting exact strengths and growth areas.</p>
              <div className="feature-tags">
                <span>Rubric-Based</span>
                <span>Personalized</span>
                <span>Instant</span>
              </div>
            </div>

            <div className="glass-card glass-card-interactive feature-card">
              <div className="feature-icon-wrapper emerald">
                <TrendingUp size={26} />
              </div>
              <h3>Progress & Readiness Score</h3>
              <p>Monitor your performance trajectory over time with visual analytics and benchmark your readiness against industry standards.</p>
              <div className="feature-tags">
                <span>Performance History</span>
                <span>Skill Graph</span>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        {!user && (
          <section style={{ marginTop: '2rem' }}>
            <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.18) 100%)', border: '1px solid rgba(99,102,241,0.4)' }}>
              <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Ready to Elevate Your Career?</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '550px', margin: '0 auto 2rem' }}>
                Join engineers practicing with GenAI Master and land your dream role at top technology companies.
              </p>
              <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                <Sparkles size={18} />
                <span>Create Your Account Free</span>
              </Link>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Home;

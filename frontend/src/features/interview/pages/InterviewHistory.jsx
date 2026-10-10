import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { Bot, Sparkles, Award, Clock, ArrowRight, Play, CheckCircle2, AlertCircle } from 'lucide-react'
import Layout from '../../../components/Layout'
import { useAuth } from '../../auth/hooks/useAuth'
import { getInterviewHistory } from '../services/interview.api'

const InterviewHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    getInterviewHistory()
      .then(res => {
        if (res?.history) {
          setHistory(res.history);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user]);

  return (
    <Layout>
      <div className="home-container" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="badge-pill" style={{ marginBottom: '0.5rem' }}>
              <Sparkles size={14} color="#818cf8" />
              <span>Interview Records</span>
            </div>
            <h1 style={{ fontSize: '2.25rem' }}>Your Mock Interview History</h1>
          </div>

          <Link to="/interview/new" className="btn btn-primary">
            <Play size={16} fill="white" />
            <span>Start New Interview</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>Loading past interview sessions...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <Bot size={44} color="#818cf8" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No Mock Interviews Recorded Yet</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 1.75rem' }}>
              Take your first AI mock interview to test your technical skills, receive instant rubric grading, and build your candidate readiness profile.
            </p>
            <Link to="/interview/new" className="btn btn-primary">
              <Play size={16} fill="white" />
              <span>Start Your First Interview</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {history.map(item => (
              <div 
                key={item._id}
                className="glass-card glass-card-interactive"
                style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: item.status === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.status === 'completed' ? '#34d399' : '#818cf8' }}>
                    {item.status === 'completed' ? <Award size={24} /> : <Clock size={24} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontSize: '1.15rem' }}>{item.targetRole}</h3>
                      <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-dim)' }}>
                        {item.difficulty}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • {item.questions?.length} Questions
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {item.status === 'completed' ? (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: (item.overallScore || 0) >= 80 ? '#34d399' : '#f59e0b' }}>
                        {item.overallScore || 0} <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>/ 100</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600 }}>
                        {item.recommendation || 'Completed'}
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: '#f59e0b', background: 'rgba(245,158,11,0.12)', padding: '0.3rem 0.75rem', borderRadius: '9999px' }}>
                      In Progress
                    </span>
                  )}

                  <Link to={`/interview/${item._id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    <span>{item.status === 'completed' ? 'View Report' : 'Resume Session'}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InterviewHistory;

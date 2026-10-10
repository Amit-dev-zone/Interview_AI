import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router'
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Calendar, 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  Bot, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Target, 
  Zap, 
  AlertCircle,
  Play,
  RotateCcw,
  Check,
  Building2,
  Clock
} from 'lucide-react'
import Layout from '../../../components/Layout'
import { useAuth } from '../../auth/hooks/useAuth'
import { generatePlan, getUserPlans, toggleDayCompletion, getPlanById } from '../services/plan.api'

const ResumePlanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activePlanId = searchParams.get('id');

  // Form states
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'text'
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [customRole, setCustomRole] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [companyTier, setCompanyTier] = useState('Product / Tech');

  // Loading & Data states
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentPlan, setCurrentPlan] = useState(null);
  const [userPlans, setUserPlans] = useState([]);
  const [expandedDays, setExpandedDays] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchUserPlans();
  }, [user, activePlanId]);

  const fetchUserPlans = async () => {
    try {
      const data = await getUserPlans();
      if (data?.plans) {
        setUserPlans(data.plans);
        if (activePlanId) {
          const matched = data.plans.find(p => p._id === activePlanId);
          if (matched) {
            setCurrentPlan(matched);
            initializeExpanded(matched);
          }
        } else if (data.plans.length > 0 && !currentPlan) {
          setCurrentPlan(data.plans[0]);
          initializeExpanded(data.plans[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load past plans:', err);
    }
  };

  const initializeExpanded = (plan) => {
    if (plan?.dailyRoadmap) {
      const exp = {};
      // default first 2 days open
      plan.dailyRoadmap.forEach((d, i) => {
        exp[d.dayNumber] = i < 2;
      });
      setExpandedDays(exp);
    }
  };

  const toggleDayExpand = (dayNumber) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayNumber]: !prev[dayNumber]
    }));
  };

  const handleDayCheck = async (e, dayNumber) => {
    e.stopPropagation();
    if (!currentPlan) return;

    try {
      const res = await toggleDayCompletion(currentPlan._id, dayNumber);
      if (res?.plan) {
        setCurrentPlan(res.plan);
        setUserPlans(prev => prev.map(p => p._id === res.plan._id ? res.plan : p));
      }
    } catch (err) {
      console.error('Failed to toggle day milestone:', err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (inputMode === 'upload' && !resumeFile) {
      setErrorMsg('Please select a resume PDF file to upload.');
      return;
    }
    if (inputMode === 'text' && (!resumeText || resumeText.trim().length < 30)) {
      setErrorMsg('Please paste your resume details (at least 30 characters).');
      return;
    }

    setIsGenerating(true);

    try {
      const finalRole = targetRole === 'Custom' ? (customRole || 'Software Engineer') : targetRole;
      let payload;

      if (inputMode === 'upload' && resumeFile) {
        payload = new FormData();
        payload.append('resumeFile', resumeFile);
        payload.append('targetRole', finalRole);
        payload.append('durationDays', durationDays);
        payload.append('companyTier', companyTier);
      } else {
        payload = {
          resumeText,
          targetRole: finalRole,
          durationDays,
          companyTier
        };
      }

      const res = await generatePlan(payload);
      if (res?.plan) {
        setCurrentPlan(res.plan);
        setUserPlans(prev => [res.plan, ...prev]);
        initializeExpanded(res.plan);
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || err.message || 'Failed to generate study plan. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const completedDaysCount = currentPlan?.dailyRoadmap?.filter(d => d.isCompleted)?.length || 0;
  const totalDays = currentPlan?.dailyRoadmap?.length || 1;
  const progressPercent = Math.round((completedDaysCount / totalDays) * 100);

  return (
    <Layout>
      <div className="home-container" style={{ maxWidth: '1200px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <div className="badge-pill" style={{ marginBottom: '0.75rem' }}>
            <Sparkles size={14} color="#818cf8" />
            <span>AI Resume Career Copilot</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Personalized <span className="gradient-text">Day-by-Day Prep Roadmap</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto' }}>
            Upload your resume, select your dream role & timeline, and let Gemini AI curate an actionable, structured daily study plan with custom interview exercises.
          </p>
        </div>

        {/* Quick Plan Switcher if user has multiple plans */}
        {userPlans.length > 1 && (
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem' }}>
            {userPlans.map(p => (
              <button
                key={p._id}
                onClick={() => {
                  setCurrentPlan(p);
                  initializeExpanded(p);
                }}
                className={`btn ${currentPlan?._id === p._id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
              >
                <Target size={14} />
                <span>{p.targetRole} ({p.durationDays} Days)</span>
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: currentPlan ? '1fr 1.6fr' : '1fr', gap: '2rem', alignItems: 'start' }}>
          {/* LEFT: Generation Form Card */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={20} color="#818cf8" />
              <span>{currentPlan ? 'Create New Prep Plan' : 'Input Resume & Goals'}</span>
            </h2>

            {errorMsg && (
              <div className="alert-error" style={{ marginBottom: '1.25rem' }}>
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleGenerate}>
              {/* Input Mode Tabs */}
              <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', padding: '4px', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`btn ${inputMode === 'upload' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', borderRadius: '8px' }}
                >
                  <Upload size={14} />
                  <span>Upload PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`btn ${inputMode === 'text' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', borderRadius: '8px' }}
                >
                  <FileText size={14} />
                  <span>Paste Text</span>
                </button>
              </div>

              {/* Upload Input */}
              {inputMode === 'upload' ? (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    RESUME PDF FILE
                  </label>
                  <div style={{ border: '2px dashed rgba(99, 102, 241, 0.4)', borderRadius: '12px', padding: '1.75rem 1rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <input
                      type="file"
                      accept=".pdf"
                      id="resumeFileInput"
                      style={{ display: 'none' }}
                      onChange={(e) => setResumeFile(e.target.files[0])}
                    />
                    <label htmlFor="resumeFileInput" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <Upload size={28} color="#818cf8" />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0' }}>
                        {resumeFile ? resumeFile.name : 'Click to select PDF or drag & drop'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        PDF format up to 8MB
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="resumeTextArea" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    PASTE RESUME CONTENT
                  </label>
                  <textarea
                    id="resumeTextArea"
                    rows={6}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste education, work history, projects, tech stack..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      color: 'var(--text-main)',
                      fontFamily: 'inherit',
                      fontSize: '0.875rem',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>
              )}

              {/* Target Role */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  TARGET JOB ROLE
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    color: 'var(--text-main)',
                    fontFamily: 'inherit',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Frontend Engineer (React / Vue / Next.js)">Frontend Engineer (React / Next.js)</option>
                  <option value="Backend Engineer (Node.js / Python / Java / Go)">Backend Engineer (Node / Python / Go)</option>
                  <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
                  <option value="DevOps & Cloud Architect">DevOps & Cloud Architect</option>
                  <option value="Custom">Custom Role...</option>
                </select>

                {targetRole === 'Custom' && (
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="Enter custom target role"
                    style={{
                      width: '100%',
                      marginTop: '0.5rem',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      color: 'var(--text-main)',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                )}
              </div>

              {/* Duration Pills */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  PREPARATION DURATION
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {[3, 7, 14, 30].map(days => (
                    <button
                      type="button"
                      key={days}
                      onClick={() => setDurationDays(days)}
                      className={`btn ${durationDays === days ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Company Tier */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  TARGET COMPANY TIER
                </label>
                <select
                  value={companyTier}
                  onChange={(e) => setCompanyTier(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    color: 'var(--text-main)',
                    fontFamily: 'inherit',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  <option value="FAANG / Top Tier Tech">FAANG / Tier 1 (High Algorithmic & System Design Bar)</option>
                  <option value="High Growth Startup">High Growth Startup (Practical Architecture & Velocity)</option>
                  <option value="Enterprise / Consultancies">Enterprise & Scaled Tech</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isGenerating}
                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
              >
                {isGenerating ? (
                  <span>Synthesizing AI Roadmap...</span>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Generate Day-by-Day Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: Active Plan Timeline & Milestones */}
          {currentPlan ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Summary Card */}
              <div className="glass-card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.08) 100%)', border: '1px solid rgba(99,102,241,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                      {currentPlan.targetRole} Roadmap
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {currentPlan.durationDays}-Day Intensive Plan • {currentPlan.companyTier}
                    </p>
                  </div>

                  <Link 
                    to={`/interview/new?planId=${currentPlan._id}`} 
                    className="btn btn-primary"
                    style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
                  >
                    <Play size={15} fill="white" />
                    <span>Launch AI Mock Interview</span>
                  </Link>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', color: '#cbd5e1' }}>
                    <span>Plan Completion Progress</span>
                    <strong style={{ color: '#38bdf8' }}>{completedDaysCount} of {totalDays} Days ({progressPercent}%)</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #06b6d4, #10b981)', transition: 'width 0.4s ease' }}></div>
                  </div>
                </div>

                {/* Candidate Overview & Gaps */}
                {currentPlan.candidateSummary && (
                  <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '1rem', fontStyle: 'italic', background: 'rgba(0,0,0,0.25)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                    "{currentPlan.candidateSummary}"
                  </p>
                )}

                {/* Skills tags */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {currentPlan.extractedSkills?.map((skill, idx) => (
                    <span key={idx} style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
                      ? {skill}
                    </span>
                  ))}
                  {currentPlan.skillGaps?.map((gap, idx) => (
                    <span key={idx} style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(244,63,94,0.15)', color: '#fda4af', border: '1px solid rgba(244,63,94,0.3)' }}>
                      Focus: {gap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Day-by-Day Timeline List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {currentPlan.dailyRoadmap?.map((day) => {
                  const isExpanded = expandedDays[day.dayNumber];
                  return (
                    <div 
                      key={day.dayNumber}
                      className="glass-card"
                      style={{
                        padding: '1.25rem 1.5rem',
                        borderLeft: day.isCompleted ? '4px solid #10b981' : '4px solid #6366f1',
                        background: day.isCompleted ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)'
                      }}
                    >
                      {/* Day Header */}
                      <div 
                        onClick={() => toggleDayExpand(day.dayNumber)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <button
                            type="button"
                            onClick={(e) => handleDayCheck(e, day.dayNumber)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: day.isCompleted ? '#10b981' : 'var(--text-dim)',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '2px'
                            }}
                            title={day.isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
                          >
                            {day.isCompleted ? <CheckCircle size={22} /> : <Circle size={22} />}
                          </button>

                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: day.isCompleted ? '#34d399' : '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              DAY {day.dayNumber} {day.isCompleted && '• COMPLETED'}
                            </div>
                            <h3 style={{ fontSize: '1.1rem', textDecoration: day.isCompleted ? 'line-through' : 'none', opacity: day.isCompleted ? 0.85 : 1 }}>
                              {day.title}
                            </h3>
                          </div>
                        </div>

                        <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>

                      {/* Day Expanded Details */}
                      {isExpanded && (
                        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                          {/* Key Topics */}
                          {day.keyTopics?.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                                Core Topics to Master
                              </h4>
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {day.keyTopics.map((topic, i) => (
                                  <span key={i} style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#f1f5f9' }}>
                                    • {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actionable Tasks */}
                          {day.tasks?.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                                Practice Challenges & Exercises
                              </h4>
                              <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {day.tasks.map((task, i) => (
                                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                                    <span style={{ color: '#818cf8', fontWeight: 700 }}>?</span>
                                    <span>{task}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Milestone */}
                          {day.milestone && (
                            <div style={{ background: 'rgba(99,102,241,0.1)', padding: '0.75rem 1rem', borderRadius: '8px', borderLeft: '3px solid #818cf8', fontSize: '0.85rem' }}>
                              <strong style={{ color: '#a5b4fc' }}>?? Day {day.dayNumber} Milestone: </strong>
                              <span style={{ color: '#e2e8f0' }}>{day.milestone}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Layout>
  );
};

export default ResumePlanner;

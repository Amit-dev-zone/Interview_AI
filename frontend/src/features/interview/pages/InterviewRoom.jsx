import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router'
import { 
  Bot, 
  Sparkles, 
  Play, 
  Send, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  TrendingUp, 
  ArrowRight, 
  RotateCcw, 
  HelpCircle,
  Clock,
  Layers,
  BarChart3,
  FileText,
  User,
  AlertCircle
} from 'lucide-react'
import Layout from '../../../components/Layout'
import { useAuth } from '../../auth/hooks/useAuth'
import { startInterview, submitAnswer, getInterviewById } from '../services/interview.api'
import { getUserPlans } from '../../plan/services/plan.api'

const InterviewRoom = () => {
  const { user } = useAuth();
  const { id: interviewIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const planIdParam = searchParams.get('planId');
  const navigate = useNavigate();

  // Launcher state
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [selectedPlanId, setSelectedPlanId] = useState(planIdParam || '');
  const [userPlans, setUserPlans] = useState([]);
  const [resumeText, setResumeText] = useState('');

  // Active session state
  const [activeInterview, setActiveInterview] = useState(null);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Evaluation state
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [finalReport, setFinalReport] = useState(null);
  const [showIdealAnswer, setShowIdealAnswer] = useState(false);

  // Speech Recognition state
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Load user study plans for quick context
    getUserPlans().then(res => {
      if (res?.plans) {
        setUserPlans(res.plans);
        if (planIdParam) {
          const matched = res.plans.find(p => p._id === planIdParam);
          if (matched) {
            setTargetRole(matched.targetRole);
          }
        }
      }
    }).catch(console.error);

    // Initialize Web Speech API if supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCandidateAnswer(prev => prev ? `${prev} ${transcript}` : transcript);
      };

      rec.onerror = (e) => {
        console.warn('Speech recognition error:', e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }

    if (interviewIdParam) {
      loadExistingInterview(interviewIdParam);
    }
  }, [user, interviewIdParam]);

  const loadExistingInterview = async (id) => {
    setIsLoadingSession(true);
    try {
      const data = await getInterviewById(id);
      if (data?.interview) {
        setActiveInterview(data.interview);
        if (data.interview.status === 'completed') {
          setFinalReport({
            overallScore: data.interview.overallScore,
            recommendation: data.interview.recommendation,
            summary: data.interview.summary,
            topStrengths: data.interview.topStrengths,
            areasToImprove: data.interview.areasToImprove,
            nextStepsPlan: data.interview.nextStepsPlan
          });
        }
      }
    } catch (err) {
      setErrorMsg('Failed to load interview session.');
    } finally {
      setIsLoadingSession(false);
    }
  };

  const toggleRecording = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. Please type your answer.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleStartInterview = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const payload = {
        targetRole,
        difficulty,
        totalQuestions,
        planId: selectedPlanId,
        resumeText
      };

      const res = await startInterview(payload);
      if (res?.interview) {
        setActiveInterview(res.interview);
        setCandidateAnswer('');
        setLastEvaluation(null);
        setFinalReport(null);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to start interview.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!candidateAnswer || candidateAnswer.trim().length < 5) {
      setErrorMsg('Please write or speak an answer before submitting.');
      return;
    }

    if (isRecording && recognition) {
      recognition.stop();
      setIsRecording(false);
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await submitAnswer(activeInterview._id, candidateAnswer);
      if (res) {
        setLastEvaluation(res.evaluation);
        setActiveInterview(res.interview);
        setCandidateAnswer('');

        if (res.isCompleted) {
          setFinalReport(res.report || {
            overallScore: res.interview.overallScore,
            recommendation: res.interview.recommendation,
            summary: res.interview.summary,
            topStrengths: res.interview.topStrengths,
            areasToImprove: res.interview.areasToImprove,
            nextStepsPlan: res.interview.nextStepsPlan
          });
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to submit answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQIndex = activeInterview?.currentQuestionIndex || 0;
  const currentQuestion = activeInterview?.questions?.[currentQIndex];
  const progressPercent = activeInterview 
    ? Math.round(((currentQIndex + (activeInterview.status === 'completed' ? 1 : 0)) / activeInterview.totalQuestions) * 100)
    : 0;

  return (
    <Layout>
      <div className="home-container" style={{ maxWidth: '1050px' }}>
        {/* ======================================================== */}
        {/* VIEW 1: COMPLETED FINAL REPORT */}
        {/* ======================================================== */}
        {activeInterview?.status === 'completed' && finalReport ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header Result Card */}
            <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(16,185,129,0.12) 100%)', border: '1px solid rgba(99,102,241,0.4)' }}>
              <div className="badge-pill" style={{ marginBottom: '1rem', background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)', color: '#34d399' }}>
                <CheckCircle2 size={15} />
                <span>Interview Session Completed</span>
              </div>

              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                Mock Interview <span className="gradient-text">Evaluation Report</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Target Role: <strong>{activeInterview.targetRole}</strong> ({activeInterview.difficulty} Level)
              </p>

              {/* Score & Verdict Banner */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap', margin: '1.5rem 0' }}>
                {/* Score Circle Gauge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(15,23,42,0.8) 100%)', border: '4px solid #6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', boxShadow: '0 0 25px rgba(99,102,241,0.4)' }}>
                    <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{finalReport.overallScore}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>OUT OF 100</span>
                  </div>
                  <span style={{ marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Overall Score</span>
                </div>

                {/* Recommendation Pill */}
                <div style={{ textAlign: 'left', background: 'rgba(15,23,42,0.6)', padding: '1.25rem 1.75rem', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
                    Hiring Committee Verdict
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: finalReport.recommendation?.includes('Hire') && !finalReport.recommendation?.includes('No') ? '#34d399' : '#fda4af' }}>
                    {finalReport.recommendation || 'Evaluated'}
                  </div>
                </div>
              </div>

              {/* Holistic Summary */}
              {finalReport.summary && (
                <p style={{ maxWidth: '750px', margin: '1.5rem auto 0', fontSize: '1rem', color: '#e2e8f0', lineHeight: 1.7, background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '12px' }}>
                  "{finalReport.summary}"
                </p>
              )}
            </div>

            {/* Strengths & Improvements Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {/* Top Strengths */}
              <div className="glass-card" style={{ padding: '2rem', borderTop: '3px solid #10b981' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399' }}>
                  <Award size={20} />
                  <span>Key Strengths</span>
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {finalReport.topStrengths?.map((str, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.925rem', color: '#e2e8f0' }}>
                      <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '3px' }} />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas to Improve */}
              <div className="glass-card" style={{ padding: '2rem', borderTop: '3px solid #f43f5e' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fda4af' }}>
                  <TrendingUp size={20} />
                  <span>Areas to Refine</span>
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {finalReport.areasToImprove?.map((area, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.925rem', color: '#e2e8f0' }}>
                      <AlertTriangle size={16} color="#f43f5e" style={{ flexShrink: 0, marginTop: '3px' }} />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Next Steps Plan */}
            {finalReport.nextStepsPlan?.length > 0 && (
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={20} color="#818cf8" />
                  <span>Actionable Preparation Checklist</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {finalReport.nextStepsPlan.map((step, idx) => (
                    <div key={idx} style={{ background: 'rgba(15,23,42,0.6)', padding: '0.85rem 1.25rem', borderRadius: '10px', fontSize: '0.9rem', color: '#cbd5e1', border: '1px solid var(--border-subtle)' }}>
                      <strong>{idx + 1}.</strong> {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transcript Drawer */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Full Question Breakdown & Feedback</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {activeInterview.questions.map((q, idx) => (
                  <div key={idx} style={{ background: 'rgba(15,23,42,0.7)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8' }}>QUESTION {idx + 1} ({q.category})</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: (q.score || 0) >= 80 ? '#34d399' : '#f59e0b', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                        Score: {q.score} / 100
                      </span>
                    </div>
                    <p style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '1rem' }}>{q.question}</p>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
                      <strong>Your Answer:</strong> {q.candidateAnswer}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      <strong>AI Feedback:</strong> {q.feedback}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
              <button 
                onClick={() => {
                  setActiveInterview(null);
                  setFinalReport(null);
                  setLastEvaluation(null);
                }} 
                className="btn btn-primary"
              >
                <RotateCcw size={16} />
                <span>Start Another Mock Session</span>
              </button>

              <Link to="/plan" className="btn btn-secondary">
                <FileText size={16} />
                <span>Review Day-by-Day Study Plan</span>
              </Link>
            </div>
          </div>
        ) : null}

        {/* ======================================================== */}
        {/* VIEW 2: ACTIVE QUESTION ROOM */}
        {/* ======================================================== */}
        {activeInterview && activeInterview.status !== 'completed' && currentQuestion ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Top Navigation & Progress */}
            <div className="glass-card" style={{ padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                  {activeInterview.targetRole} • {activeInterview.difficulty}
                </span>
                <h2 style={{ fontSize: '1.25rem', marginTop: '0.15rem' }}>
                  Question {currentQIndex + 1} of {activeInterview.totalQuestions}
                </h2>
              </div>

              {/* Progress meter */}
              <div style={{ minWidth: '180px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
                  <span>Session Progress</span>
                  <span>{progressPercent}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #38bdf8)' }}></div>
                </div>
              </div>
            </div>

            {/* Question Presenter Card */}
            <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(99,102,241,0.3)', background: 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(30,41,69,0.5) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Bot size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>
                    AI INTERVIEWER • {currentQuestion.category}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Answer clearly and structure your response</div>
                </div>
              </div>

              <h2 style={{ fontSize: '1.5rem', lineHeight: 1.4, color: '#f8fafc', marginBottom: '1.5rem' }}>
                "{currentQuestion.question}"
              </h2>

              {currentQuestion.contextHint && (
                <div style={{ background: 'rgba(99,102,241,0.1)', borderLeft: '3px solid #818cf8', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  ?? <strong>Interviewer Hint:</strong> {currentQuestion.contextHint}
                </div>
              )}
            </div>

            {/* Answer Input Section */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              {errorMsg && (
                <div className="alert-error" style={{ marginBottom: '1.25rem' }}>
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmitAnswer}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label htmlFor="answerBox" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    YOUR ANSWER
                  </label>

                  {/* Speech-to-Text Button */}
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: '9999px' }}
                  >
                    {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                    <span>{isRecording ? 'Listening... (Click to Stop)' : 'Voice Input (Speech-to-Text)'}</span>
                  </button>
                </div>

                <textarea
                  id="answerBox"
                  rows={6}
                  value={candidateAnswer}
                  onChange={(e) => setCandidateAnswer(e.target.value)}
                  placeholder="Structure your response: start with high-level architecture/approach, discuss trade-offs, and detail implementation or past experience..."
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    color: 'var(--text-main)',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    outline: 'none',
                    resize: 'vertical',
                    marginBottom: '1.25rem'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    {candidateAnswer.length} characters entered
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || !candidateAnswer.trim()}
                    style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
                  >
                    {isSubmitting ? (
                      <span>AI is evaluating your answer...</span>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Submit Answer for AI Grading</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {/* ======================================================== */}
        {/* VIEW 3: LAUNCHER & CONFIGURATION (NO ACTIVE SESSION) */}
        {/* ======================================================== */}
        {!activeInterview && (
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div className="badge-pill" style={{ marginBottom: '0.75rem' }}>
                <Bot size={14} color="#818cf8" />
                <span>Real-Time AI Mock Simulation</span>
              </div>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                Start Your <span className="gradient-text">AI Mock Interview</span>
              </h1>
              <p style={{ color: 'var(--text-muted)' }}>
                Practice live adaptive interview questions tailored to your resume, receive immediate rubric scoring, and master your technical communication.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2.5rem' }}>
              {errorMsg && (
                <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleStartInterview}>
                {/* Target Role */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    TARGET JOB ROLE
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      color: 'var(--text-main)',
                      fontFamily: 'inherit',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  >
                    <option value="Full Stack Developer">Full Stack Developer (React + Node.js/Python)</option>
                    <option value="Frontend Engineer">Frontend Engineer (React, Performance, CSS)</option>
                    <option value="Backend Engineer">Backend Engineer (Distributed Systems, Databases)</option>
                    <option value="System Design & Architecture">System Design & Cloud Architecture</option>
                    <option value="AI / Machine Learning Engineer">AI & Machine Learning Engineer</option>
                    <option value="DevOps & Cloud Engineer">DevOps & Site Reliability Engineer</option>
                  </select>
                </div>

                {/* Difficulty & Number of questions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      DIFFICULTY LEVEL
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        color: 'var(--text-main)',
                        fontFamily: 'inherit',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    >
                      <option value="Junior">Junior (Fundamentals & Syntax)</option>
                      <option value="Intermediate">Intermediate (Architecture & Tradeoffs)</option>
                      <option value="Senior">Senior / Staff (Deep Scalability & Leadership)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      QUESTION COUNT
                    </label>
                    <select
                      value={totalQuestions}
                      onChange={(e) => setTotalQuestions(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        color: 'var(--text-main)',
                        fontFamily: 'inherit',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    >
                      <option value={3}>3 Questions (Quick 10-min Sprint)</option>
                      <option value={5}>5 Questions (Standard Mock Session)</option>
                      <option value={8}>8 Questions (In-Depth Technical Bar)</option>
                    </select>
                  </div>
                </div>

                {/* Resume context from study plans */}
                {userPlans.length > 0 && (
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      SYNC WITH PREPARATION PLAN (OPTIONAL)
                    </label>
                    <select
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        color: 'var(--text-main)',
                        fontFamily: 'inherit',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    >
                      <option value="">No specific study plan attached</option>
                      {userPlans.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.targetRole} Roadmap ({p.durationDays} Days)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', marginTop: '0.5rem' }}
                >
                  {isSubmitting ? (
                    <span>Initializing AI Interviewer...</span>
                  ) : (
                    <>
                      <Play size={18} fill="white" />
                      <span>Launch AI Mock Interview Session</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InterviewRoom;

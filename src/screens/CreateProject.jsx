import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Minus, Plus, ArrowRight } from 'lucide-react';
import StepProgressBar from '../components/ui/StepProgressBar';
import Button from '../components/ui/Button';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');

const inputStyle = {
  borderColor: '#EDE9FE',
  color: '#1C1829',
  backgroundColor: 'white',
  outline: 'none',
};

export default function CreateProject() {
  const navigate = useNavigate();
  const { setProjectId, setCurrentMemberId, setCurrentMemberName } = useProject();
  const { user, loading: authLoading } = useAuth();
  const [courseName, setCourseName] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [groupSize, setGroupSize] = useState(4);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin?redirect=/create');
    }
  }, [user, authLoading, navigate]);

  const creatorName =
    user?.user_metadata?.full_name?.trim() ||
    user?.email?.split('@')[0]?.trim() ||
    '';

  const canContinue = courseName.trim() && assignmentTitle.trim() && dueDate && !creating;

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`${API}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: assignmentTitle.trim(),
          course_name: courseName.trim(),
          assignment_title: assignmentTitle.trim(),
          due_date: dueDate,
          group_size: groupSize,
          ai_enabled: aiEnabled,
          ...(creatorName ? { creator_name: creatorName } : {}),
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const detail = errBody.detail;
        const msg = Array.isArray(detail)
          ? detail.map((d) => d.msg || d).join(', ')
          : typeof detail === 'string'
            ? detail
            : `HTTP ${res.status}`;
        throw new Error(msg || 'Failed to create project');
      }
      const data = await res.json();
      const project = data.project ?? data;
      if (!project?.id) throw new Error('Invalid response from server');
      // Ensure ProjectContext + localStorage are updated before the next route reads projectId
      flushSync(() => {
        setProjectId(project.id);
        if (data.creator_member?.id) {
          setCurrentMemberId(data.creator_member.id);
          setCurrentMemberName(data.creator_member.name);
        }
      });
      navigate('/upload', { state: { projectId: project.id } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Could not create project. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      <header className="w-full bg-white" style={{ borderBottom: '1px solid #EDE9FE' }}>
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
            <span className="text-white font-black" style={{ fontSize: 15, letterSpacing: '-0.04em' }}>G</span>
          </div>
          <span className="font-extrabold tracking-tight bg-clip-text text-transparent"
            style={{ fontSize: 20, backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
            Groupify
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-10">
        <div className="w-full max-w-2xl">
          <StepProgressBar currentStep={1} />

          <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #EDE9FE', boxShadow: '0 4px 24px rgba(139,92,246,0.06)' }}>
            <h1 className="text-xl font-extrabold mb-1" style={{ color: '#1C1829' }}>Project Details</h1>
            <p className="text-sm mb-7" style={{ color: '#6B6584' }}>
              Tell us about your assignment so we can set up your group plan.
            </p>

            <div className="space-y-5">
              {/* Course Name */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1829' }}>
                  Unit / Course Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. MKTG2201 — Marketing Strategy"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm transition-all"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px #EDE9FE'; }}
                  onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Assignment Title */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1829' }}>
                  Assignment Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Group Report — Market Entry Strategy"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm transition-all"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px #EDE9FE'; }}
                  onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Due Date + Group Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1829' }}>Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border text-sm transition-all"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px #EDE9FE'; }}
                    onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1829' }}>Group Size</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setGroupSize(s => Math.max(2, s - 1))}
                      disabled={groupSize <= 2}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                      style={{ border: '1px solid #EDE9FE', color: '#6B6584' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-xl font-bold w-6 text-center" style={{ color: '#1C1829' }}>{groupSize}</span>
                    <button
                      onClick={() => setGroupSize(s => Math.min(8, s + 1))}
                      disabled={groupSize >= 8}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                      style={{ border: '1px solid #EDE9FE', color: '#6B6584' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#A09BB8' }}>Total in group including you · 2–8</p>
                </div>
              </div>

              {/* AI Toggle */}
              <div
                className="flex items-center justify-between rounded-xl px-4 py-4 cursor-pointer select-none transition-all"
                style={{
                  backgroundColor: aiEnabled ? '#F5F3FF' : '#F8F7FF',
                  border: `1px solid ${aiEnabled ? '#C4B5FD' : '#EDE9FE'}`,
                }}
                onClick={() => setAiEnabled(v => !v)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: aiEnabled ? '#EDE9FE' : '#F3F0FF' }}>
                    <Sparkles size={17} style={{ color: aiEnabled ? '#8B5CF6' : '#A09BB8' }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: aiEnabled ? '#6D28D9' : '#6B6584' }}>
                      AI Assistant
                    </p>
                    <p className="text-xs" style={{ color: aiEnabled ? '#8B5CF6' : '#A09BB8' }}>
                      Auto-allocates tasks based on rubric criteria
                    </p>
                  </div>
                </div>
                <div className="w-11 h-6 rounded-full relative flex-shrink-0 transition-colors"
                  style={{ backgroundColor: aiEnabled ? '#8B5CF6' : '#D8D3F0' }}>
                  <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all"
                    style={{ left: aiEnabled ? 22 : 2 }} />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm mt-4 text-red-500 font-medium">{error}</p>
            )}

            <div className="mt-8 flex justify-end">
              <Button variant="filled" disabled={!canContinue} onClick={handleCreate} className="gap-2">
                {creating ? 'Creating…' : 'Continue'} {!creating && <ArrowRight size={15} />}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

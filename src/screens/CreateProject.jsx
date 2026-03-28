import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Minus, Plus, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import StepProgressBar from '../components/ui/StepProgressBar';
import Button from '../components/ui/Button';
import { useProject } from '../context/ProjectContext';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');

const focusRing = {
  onFocus: e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)'; },
  onBlur:  e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; },
};

export default function CreateProject() {
  const navigate = useNavigate();
  const { setProjectId } = useProject();
  const [courseName, setCourseName] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [groupSize, setGroupSize] = useState(4);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

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
        }),
      });
      if (!res.ok) throw new Error('Failed to create project');
      const project = await res.json();
      setProjectId(project.id);
      navigate('/upload');
    } catch (err) {
      setError('Could not create project. Please check your connection and try again.');
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      {/* Header */}
      <header className="w-full bg-white/95 backdrop-blur-md" style={{ borderBottom: '1px solid #EDE9FE' }}>
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
            <span className="text-white font-black" style={{ fontSize: 16, letterSpacing: '-0.04em' }}>G</span>
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

          <div className="bg-white rounded-2xl p-8 sm:p-10 animate-scale-in"
            style={{ border: '1px solid #EDE9FE', boxShadow: '0 4px 24px rgba(139,92,246,0.06)' }}>

            <h1 className="text-2xl font-extrabold mb-2" style={{ color: '#1C1829', letterSpacing: '-0.02em' }}>
              Project Details
            </h1>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: '#6B6584' }}>
              Tell us about your assignment so we can set up your group plan.
            </p>

            <div className="space-y-6">
              {/* Course Name */}
              <div>
                <label htmlFor="course" className="block text-sm font-bold mb-2" style={{ color: '#1C1829' }}>
                  Unit / Course Name <span style={{ color: '#EC4899' }}>*</span>
                </label>
                <input
                  id="course"
                  type="text"
                  placeholder="e.g. INFO2222 — Computing 2 Usability"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border text-sm transition-all duration-200"
                  style={{ borderColor: '#EDE9FE', color: '#1C1829', backgroundColor: 'white', outline: 'none' }}
                  {...focusRing}
                />
              </div>

              {/* Assignment Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-bold mb-2" style={{ color: '#1C1829' }}>
                  Assignment Title <span style={{ color: '#EC4899' }}>*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Group Report — Usability Evaluation of UniApp"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border text-sm transition-all duration-200"
                  style={{ borderColor: '#EDE9FE', color: '#1C1829', backgroundColor: 'white', outline: 'none' }}
                  {...focusRing}
                />
              </div>

              {/* Due Date + Group Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-bold mb-2" style={{ color: '#1C1829' }}>
                    Due Date <span style={{ color: '#EC4899' }}>*</span>
                  </label>
                  <input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border text-sm transition-all duration-200"
                    style={{ borderColor: '#EDE9FE', color: '#1C1829', backgroundColor: 'white', outline: 'none' }}
                    {...focusRing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1C1829' }}>
                    Group Size
                  </label>
                  <div className="flex items-center gap-4 mt-1">
                    <button
                      onClick={() => setGroupSize(s => Math.max(2, s - 1))}
                      disabled={groupSize <= 2}
                      className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                      style={{ border: '1.5px solid #EDE9FE', color: '#6B6584', backgroundColor: 'white' }}
                      aria-label="Decrease group size"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-2xl font-extrabold w-8 text-center tabular-nums" style={{ color: '#1C1829' }}>
                      {groupSize}
                    </span>
                    <button
                      onClick={() => setGroupSize(s => Math.min(8, s + 1))}
                      disabled={groupSize >= 8}
                      className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                      style={{ border: '1.5px solid #EDE9FE', color: '#6B6584', backgroundColor: 'white' }}
                      aria-label="Increase group size"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <p className="text-xs mt-2 font-medium" style={{ color: '#A09BB8' }}>2 – 8 members</p>
                </div>
              </div>

              {/* AI Toggle */}
              <button
                className="w-full flex items-center justify-between rounded-2xl px-5 py-4 transition-all duration-200 text-left"
                style={{
                  backgroundColor: aiEnabled ? '#F5F3FF' : '#FAFAFA',
                  border: `1.5px solid ${aiEnabled ? '#C4B5FD' : '#EDE9FE'}`,
                }}
                onClick={() => setAiEnabled(v => !v)}
                role="switch"
                aria-checked={aiEnabled}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200"
                    style={{ backgroundColor: aiEnabled ? '#EDE9FE' : '#F3F0FF' }}>
                    <Sparkles size={18} style={{ color: aiEnabled ? '#8B5CF6' : '#A09BB8' }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: aiEnabled ? '#6D28D9' : '#6B6584' }}>
                      AI Assistant
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: aiEnabled ? '#8B5CF6' : '#A09BB8' }}>
                      Auto-allocates tasks based on skills and rubric criteria
                    </p>
                  </div>
                </div>
                <div className="w-12 h-7 rounded-full relative flex-shrink-0 transition-colors duration-200"
                  style={{ backgroundColor: aiEnabled ? '#8B5CF6' : '#D8D3F0' }}>
                  <div className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200"
                    style={{ left: aiEnabled ? 24 : 4 }} />
                </div>
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl px-4 py-3 mt-6 flex items-center gap-3 animate-slide-down"
                style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <AlertCircle size={16} style={{ color: '#DC2626' }} className="flex-shrink-0" />
                <p className="text-sm font-medium" style={{ color: '#991B1B' }}>{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-10 flex items-center justify-between">
              <Button variant="ghost" onClick={() => navigate('/')} className="gap-1.5 text-sm">
                <ArrowLeft size={14} /> Back
              </Button>
              <Button variant="filled" disabled={!canContinue} onClick={handleCreate} className="gap-2 px-7">
                {creating ? 'Creating…' : 'Continue'} {!creating && <ArrowRight size={16} />}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Minus, Plus, ArrowRight } from 'lucide-react';
import StepProgressBar from '../components/ui/StepProgressBar';
import Button from '../components/ui/Button';

const inputStyle = {
  borderColor: '#EDE9FE',
  color: '#1C1829',
  backgroundColor: 'white',
  outline: 'none',
};

export default function CreateProject() {
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [groupSize, setGroupSize] = useState(4);
  const [aiEnabled, setAiEnabled] = useState(true);

  const canContinue = courseName.trim() && assignmentTitle.trim() && dueDate;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      <header className="w-full bg-white" style={{ borderBottom: '1px solid #EDE9FE' }}>
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
            <span className="text-white font-black text-sm" style={{ letterSpacing: '-0.04em' }}>G</span>
          </div>
          <span className="font-extrabold text-base tracking-tight bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
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
                  <p className="text-xs mt-1" style={{ color: '#A09BB8' }}>2 – 8 members</p>
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

            <div className="mt-8 flex justify-end">
              <Button variant="filled" disabled={!canContinue} onClick={() => navigate('/upload')} className="gap-2">
                Continue <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

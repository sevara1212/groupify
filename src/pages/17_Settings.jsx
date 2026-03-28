import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Copy, Check, Trash2, ArrowLeft, User } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import Button from '../components/ui/Button';

export default function SettingsPage() {
  const navigate = useNavigate();
  const {
    projectId,
    currentMemberId,
    currentMemberName,
    setCurrentMemberName,
    clearLocalProjectData,
  } = useProject();
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState(currentMemberName || '');
  const [savedName, setSavedName] = useState(false);

  useEffect(() => {
    setNameDraft(currentMemberName || '');
  }, [currentMemberName]);

  const copyProjectId = () => {
    if (!projectId) return;
    navigator.clipboard.writeText(projectId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const saveDisplayName = () => {
    const t = nameDraft.trim();
    setCurrentMemberName(t || null);
    setSavedName(true);
    setTimeout(() => setSavedName(false), 2000);
  };

  const onClearDevice = () => {
    if (!window.confirm('Remove this project from this browser? You can join again with your invite code.')) return;
    clearLocalProjectData();
    navigate('/join-group', { replace: true });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F7FF' }}>
      <div className="max-w-lg mx-auto px-5 py-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-semibold mb-6"
          style={{ color: '#8B5CF6' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
          >
            <Settings size={24} color="white" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: '#1C1829' }}>Settings</h1>
            <p className="text-sm" style={{ color: '#6B6584' }}>This browser · your team session</p>
          </div>
        </div>

        <div
          className="bg-white rounded-2xl p-5 mb-4"
          style={{ border: '1px solid #EDE9FE', boxShadow: '0 1px 4px rgba(139,92,246,0.06)' }}
        >
          <h2 className="text-xs font-extrabold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>
            How your data is kept
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#4B5563' }}>
            Your project and member info is saved in this browser (local storage) so it survives refreshes,
            new deploys, and reopening the site. Clearing site data or using a different browser/device
            means you’ll need your invite link or code again.
          </p>
        </div>

        <div
          className="bg-white rounded-2xl p-5 mb-4"
          style={{ border: '1px solid #EDE9FE', boxShadow: '0 1px 4px rgba(139,92,246,0.06)' }}
        >
          <h2 className="text-xs font-extrabold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>
            Project
          </h2>
          {projectId ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono truncate px-3 py-2 rounded-xl" style={{ backgroundColor: '#F5F3FF', color: '#5B21B6' }}>
                {projectId}
              </code>
              <button
                type="button"
                onClick={copyProjectId}
                className="p-2.5 rounded-xl flex-shrink-0"
                style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}
                title="Copy project ID"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#9CA3AF' }}>No project joined on this device.</p>
          )}
        </div>

        <div
          className="bg-white rounded-2xl p-5 mb-4"
          style={{ border: '1px solid #EDE9FE', boxShadow: '0 1px 4px rgba(139,92,246,0.06)' }}
        >
          <h2 className="text-xs font-extrabold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#9CA3AF' }}>
            <User size={14} /> You on this device
          </h2>
          <label className="text-[11px] font-bold block mb-1" style={{ color: '#6B6584' }}>Display name (saved here only)</label>
          <div className="flex gap-2">
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl text-sm border"
              style={{ borderColor: '#E9D5FF', color: '#1C1829' }}
              placeholder="Your name"
            />
            <Button variant="outlined" className="flex-shrink-0 text-xs" onClick={saveDisplayName}>
              {savedName ? 'Saved' : 'Save'}
            </Button>
          </div>
          {currentMemberId && (
            <p className="text-[11px] mt-2 font-mono truncate" style={{ color: '#9CA3AF' }}>Member ID: {currentMemberId}</p>
          )}
        </div>

        <div
          className="bg-white rounded-2xl p-5"
          style={{ border: '1px solid #FECACA', boxShadow: '0 1px 4px rgba(239,68,68,0.06)' }}
        >
          <h2 className="text-xs font-extrabold uppercase tracking-wider mb-2" style={{ color: '#B91C1C' }}>
            Leave project on this device
          </h2>
          <p className="text-xs mb-4" style={{ color: '#6B7280' }}>
            Removes stored project and member from this browser. Your team’s data on the server is unchanged.
          </p>
          <button
            type="button"
            onClick={onClearDevice}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #DC2626, #B91C1C)' }}
          >
            <Trash2 size={16} /> Clear and go to join
          </button>
        </div>
      </div>
    </div>
  );
}

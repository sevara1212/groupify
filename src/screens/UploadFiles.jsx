import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Upload, CheckCircle, ArrowRight, AlertTriangle, Loader2,
  X, FileText, Type, Wifi, WifiOff, RefreshCw, Zap,
} from 'lucide-react';
import StepProgressBar from '../components/ui/StepProgressBar';
import Button from '../components/ui/Button';
import { useProject } from '../context/ProjectContext';
import AppearanceControls from '../components/layout/AppearanceControls';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');
const BASE = API.replace('/api', '');

/* ── Server wake-up hook ──────────────────────────────────────────────────── */
function useServerPing() {
  const [serverReady, setServerReady] = useState(null); // null=checking, true=ok, false=down

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 12; // ~60s

    const ping = async () => {
      try {
        const r = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(5000) });
        if (r.ok && !cancelled) { setServerReady(true); return; }
      } catch {}
      attempts++;
      if (!cancelled) {
        if (attempts >= maxAttempts) { setServerReady(false); return; }
        setServerReady('waking'); // still trying
        setTimeout(ping, 5000);
      }
    };
    ping();
    return () => { cancelled = true; };
  }, []);

  return serverReady;
}

/* ── Upload section ───────────────────────────────────────────────────────── */
function UploadSection({ label, required, file, onFileSelect, onFileClear, text, onTextChange, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState('file');

  const hasFile = !!file;
  const hasText = text?.trim().length > 0;
  const hasContent = hasFile || hasText;

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    if (disabled || mode !== 'file') return;
    const f = e.dataTransfer.files[0];
    if (f) onFileSelect(f);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#A09BB8' }}>
          {label}{' '}
          {required
            ? <span style={{ color: '#EC4899' }}>required</span>
            : <span style={{ color: '#A09BB8', fontWeight: 400 }}>optional</span>}
        </p>
        {!hasContent && !disabled && (
          <button
            onClick={() => { mode === 'file' ? (setMode('text'), onFileClear()) : (setMode('file'), onTextChange('')); }}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl transition-all"
            style={{ color: '#8B5CF6', backgroundColor: '#F5F3FF' }}>
            {mode === 'file' ? <><Type size={11} /> Paste text</> : <><Upload size={11} /> Upload file</>}
          </button>
        )}
      </div>

      {mode === 'file' && (
        <div
          onClick={() => !hasFile && !disabled && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); if (!disabled) setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className="rounded-2xl transition-all duration-200"
          style={{
            border: hasFile ? '2px solid #8B5CF6' : dragging ? '2px solid #8B5CF6' : '2px dashed #C4B5FD',
            backgroundColor: hasFile ? '#F5F3FF' : dragging ? '#EDE9FE' : 'white',
            cursor: hasFile || disabled ? 'default' : 'pointer',
            padding: hasFile ? '18px 20px' : '28px 20px',
          }}>
          <input ref={inputRef} type="file" accept=".pdf,.txt,.docx" className="hidden"
            onChange={e => e.target.files[0] && onFileSelect(e.target.files[0])} disabled={disabled} />

          {hasFile ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}>
                <FileText size={18} color="white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold" style={{ color: '#8B5CF6' }}>Ready to process</p>
                <p className="text-xs truncate mt-0.5" style={{ color: '#6B6584' }}>{file.name}</p>
              </div>
              {!disabled && (
                <button onClick={e => { e.stopPropagation(); onFileClear(); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#EDE9FE', color: '#8B5CF6' }}>
                  <X size={12} />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200"
                style={{ backgroundColor: dragging ? '#EDE9FE' : '#F5F3FF' }}>
                <Upload size={22} style={{ color: dragging ? '#8B5CF6' : '#C4B5FD' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#1C1829' }}>
                  {dragging ? 'Drop it here!' : <>Drop file or <span style={{ color: '#8B5CF6' }}>click to browse</span></>}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#A09BB8' }}>PDF · TXT · DOCX</p>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'text' && (
        <div className="relative">
          <textarea
            value={text}
            onChange={e => onTextChange(e.target.value)}
            disabled={disabled}
            rows={5}
            placeholder={label.includes('Brief')
              ? 'Paste your assignment brief here…\n\ne.g. Design and develop a mobile app prototype...'
              : 'Paste your rubric criteria here…\n\ne.g. Introduction (20%): Context, problem statement\nAnalysis (40%): Frameworks, depth'}
            className="w-full px-4 py-3.5 rounded-2xl text-sm resize-none transition-all"
            style={{
              border: '2px solid #C4B5FD', color: '#1C1829',
              backgroundColor: hasText ? '#FAFAFF' : 'white',
              outline: 'none', fontFamily: 'inherit', lineHeight: 1.65,
            }}
            onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px #EDE9FE'; }}
            onBlur={e => { e.target.style.borderColor = '#C4B5FD'; e.target.style.boxShadow = 'none'; }}
          />
          {hasText && !disabled && (
            <button onClick={() => onTextChange('')}
              className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#EDE9FE', color: '#8B5CF6' }}>
              <X size={11} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Server status banner ─────────────────────────────────────────────────── */
function ServerBanner({ status }) {
  if (status === true) return null; // all good, show nothing

  if (status === 'waking' || status === null) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
        style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
        <Loader2 size={14} className="animate-spin flex-shrink-0" style={{ color: '#D97706' }} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold" style={{ color: '#92400E' }}>Server warming up…</p>
          <p className="text-xs" style={{ color: '#B45309' }}>
            The backend wakes up after inactivity — this takes ~30s. Upload will work once it's ready.
          </p>
        </div>
      </div>
    );
  }

  if (status === false) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
        style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
        <WifiOff size={14} className="flex-shrink-0" style={{ color: '#EF4444' }} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold" style={{ color: '#991B1B' }}>Server unreachable</p>
          <p className="text-xs" style={{ color: '#B91C1C' }}>
            The backend may be restarting. Try uploading anyway — it might succeed.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

/* ── Main screen ──────────────────────────────────────────────────────────── */
export default function UploadFiles() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId: ctxProjectId, setProjectId } = useProject();
  const routeProjectId = location.state?.projectId;
  const PROJECT_ID = ctxProjectId || routeProjectId || null;

  // Recover project id if context was not ready yet (e.g. hard refresh) — create flow passes state.projectId
  useEffect(() => {
    if (routeProjectId && routeProjectId !== ctxProjectId) {
      setProjectId(routeProjectId);
    }
  }, [routeProjectId, ctxProjectId, setProjectId]);

  const serverReady = useServerPing();

  const [briefFile, setBriefFile] = useState(null);
  const [briefText, setBriefText] = useState('');
  const [rubricFile, setRubricFile] = useState(null);
  const [rubricText, setRubricText] = useState('');

  const [uploadState, setUploadState] = useState('idle'); // idle | uploading | extracting | done | retrying
  const [extractedCriteria, setExtractedCriteria] = useState([]);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const busy = ['uploading', 'extracting', 'retrying'].includes(uploadState);
  const hasBrief = !!briefFile || briefText.trim().length > 10;
  const canContinue = hasBrief;

  const appendToForm = (form, fieldName, file, text) => {
    if (file) { form.append(fieldName, file); return; }
    if (text?.trim().length > 10) {
      form.append(fieldName, new Blob([text.trim()], { type: 'text/plain' }), `${fieldName}.txt`);
    }
  };

  const doUpload = useCallback(async (attempt = 0) => {
    if (!PROJECT_ID) {
      setError('No project selected. Go back and create a project first.');
      return;
    }
    setError(null);
    setUploadState(attempt > 0 ? 'retrying' : 'uploading');
    try {
      const form = new FormData();
      appendToForm(form, 'assignment_brief', briefFile, briefText);
      appendToForm(form, 'marking_rubric', rubricFile, rubricText);

      const res = await fetch(`${API}/projects/${PROJECT_ID}/upload`, {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(90_000), // 90s timeout for slow cold starts
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      const data = await res.json();
      setUploadState('extracting');
      await new Promise(r => setTimeout(r, 900));
      setExtractedCriteria(data.criteria || []);
      setUploadState('done');
    } catch (err) {
      const isNetwork = err.name === 'TypeError' || err.name === 'AbortError' || err.message === 'Failed to fetch';
      if (isNetwork && attempt < 3) {
        // Auto-retry: server might still be waking up
        setRetryCount(attempt + 1);
        setUploadState('retrying');
        await new Promise(r => setTimeout(r, 8000)); // wait 8s before retry
        return doUpload(attempt + 1);
      }
      setUploadState('idle');
      setError(isNetwork
        ? 'Server is still starting up. Wait ~30 seconds and try again.'
        : err.message || 'Something went wrong. Please try again.');
    }
  }, [briefFile, briefText, rubricFile, rubricText, PROJECT_ID]);

  const STAGE_LABELS = { uploading: 'Uploading files…', retrying: `Retrying… (${retryCount}/3)`, extracting: 'AI is reading your rubric…' };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>

      {/* Header */}
      <header className="w-full bg-white/90 backdrop-blur-sm" style={{ borderBottom: '1px solid #EDE9FE' }}>
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
            <span className="text-white font-black" style={{ fontSize: 15, letterSpacing: '-0.04em' }}>G</span>
          </div>
          <span className="font-extrabold tracking-tight bg-clip-text text-transparent"
            style={{ fontSize: 20, backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
            Groupify
          </span>

          {/* Server status dot */}
          <div className="ml-auto flex items-center gap-1.5">
            <AppearanceControls />
            {serverReady === true && (
              <><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
              <span className="text-xs font-medium" style={{ color: '#10B981' }}>Server ready</span></>
            )}
            {(serverReady === 'waking' || serverReady === null) && (
              <><Loader2 size={12} className="animate-spin" style={{ color: '#D97706' }} />
              <span className="text-xs font-medium" style={{ color: '#D97706' }}>Server starting…</span></>
            )}
            {serverReady === false && (
              <><WifiOff size={12} style={{ color: '#EF4444' }} />
              <span className="text-xs font-medium" style={{ color: '#EF4444' }}>Server offline</span></>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-10">
        <div className="w-full max-w-2xl">
          <StepProgressBar currentStep={2} />

          <div className="bg-white rounded-3xl overflow-hidden"
            style={{ border: '1px solid #EDE9FE', boxShadow: '0 8px 40px rgba(139,92,246,0.08)' }}>

            {/* Card header */}
            <div className="px-8 pt-8 pb-6"
              style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)', borderBottom: '1px solid #EDE9FE' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 8px 20px rgba(139,92,246,0.3)' }}>
                <Zap size={22} color="white" />
              </div>
              <h1 className="text-xl font-extrabold mb-1" style={{ color: '#1C1829' }}>Upload your assignment</h1>
              <p className="text-sm" style={{ color: '#6B6584' }}>
                Add your brief and rubric — Claude will extract all the marking criteria and build a quiz tailored to your project.
              </p>
            </div>

            <div className="px-8 py-7">
              <ServerBanner status={serverReady} />

              {!PROJECT_ID && (
                <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl mb-5"
                  style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                  <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#B45309' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: '#92400E' }}>No project linked</p>
                    <p className="text-xs mt-1" style={{ color: '#B45309' }}>
                      Create a project first so we know where to save your brief.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/create')}
                      className="text-xs font-bold mt-2 px-3 py-1.5 rounded-xl"
                      style={{ backgroundColor: '#FDE68A', color: '#92400E' }}
                    >
                      Create project
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <UploadSection
                  label="Assignment Brief"
                  required
                  file={briefFile}
                  onFileSelect={setBriefFile}
                  onFileClear={() => setBriefFile(null)}
                  text={briefText}
                  onTextChange={setBriefText}
                  disabled={busy || uploadState === 'done'}
                />
                <UploadSection
                  label="Marking Rubric"
                  required={false}
                  file={rubricFile}
                  onFileSelect={setRubricFile}
                  onFileClear={() => setRubricFile(null)}
                  text={rubricText}
                  onTextChange={setRubricText}
                  disabled={busy || uploadState === 'done'}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl mt-5"
                  style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: '#991B1B' }}>{error}</p>
                  </div>
                  <button onClick={() => doUpload(0)}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0 transition-all"
                    style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444' }}>
                    <RefreshCw size={11} /> Retry
                  </button>
                </div>
              )}

              {/* Progress states */}
              {uploadState !== 'idle' && uploadState !== 'done' && (
                <div className="flex flex-col items-center gap-4 py-6 mt-5 rounded-2xl"
                  style={{ backgroundColor: '#F5F3FF', border: '1px solid #EDE9FE' }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', boxShadow: '0 8px 20px rgba(139,92,246,0.3)' }}>
                    <Loader2 size={24} color="white" className="animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold" style={{ color: '#1C1829' }}>{STAGE_LABELS[uploadState]}</p>
                    {uploadState === 'retrying' && (
                      <p className="text-xs mt-1" style={{ color: '#8B5CF6' }}>Server was sleeping — waking it up…</p>
                    )}
                    {uploadState === 'extracting' && (
                      <p className="text-xs mt-1" style={{ color: '#8B5CF6' }}>Identifying criteria, weights & required skills</p>
                    )}
                  </div>
                </div>
              )}

              {/* Done: show extracted criteria */}
              {uploadState === 'done' && (
                <div className="mt-5 rounded-2xl overflow-hidden"
                  style={{ border: '1px solid #6EE7B7', boxShadow: '0 2px 12px rgba(16,185,129,0.1)' }}>
                  <div className="px-5 py-4 flex items-center gap-3"
                    style={{ backgroundColor: '#ECFDF5', borderBottom: extractedCriteria.length > 0 ? '1px solid #6EE7B7' : 'none' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#10B981' }}>
                      <CheckCircle size={16} color="white" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold" style={{ color: '#065F46' }}>
                        {extractedCriteria.length > 0
                          ? `${extractedCriteria.length} criteria extracted!`
                          : 'Files processed!'}
                      </p>
                      <p className="text-xs" style={{ color: '#059669' }}>Ready to invite your team</p>
                    </div>
                  </div>
                  {extractedCriteria.length > 0 && (
                    <div className="px-5 py-3 flex flex-wrap gap-2"
                      style={{ backgroundColor: '#F0FDF4' }}>
                      {extractedCriteria.map((c, i) => (
                        <span key={i} className="text-xs font-semibold px-3 py-1 rounded-full"
                          style={{ backgroundColor: '#DCFCE7', color: '#166534', border: '1px solid #6EE7B7' }}>
                          {c.name} · {c.weight_percent}%
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-7">
                <button onClick={() => navigate('/invite')}
                  className="text-xs font-medium px-3 py-2 rounded-xl transition-all"
                  style={{ color: '#A09BB8', border: '1px solid #EDE9FE' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#C4B5FD'; e.currentTarget.style.color = '#8B5CF6'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#EDE9FE'; e.currentTarget.style.color = '#A09BB8'; }}>
                  Skip for now →
                </button>

                {uploadState === 'done' ? (
                  <button
                    onClick={() => navigate('/invite')}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all"
                    style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', boxShadow: '0 4px 16px rgba(139,92,246,0.35)' }}>
                    Continue — Invite Team <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    disabled={!PROJECT_ID || !canContinue || busy}
                    onClick={() => doUpload(0)}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
                    {busy
                      ? <><Loader2 size={14} className="animate-spin" /> Processing…</>
                      : <>Analyse with AI <ArrowRight size={15} /></>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

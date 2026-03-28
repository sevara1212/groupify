import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, ArrowRight, ArrowLeft, AlertTriangle, Loader2, X, FileText, Type, AlertCircle } from 'lucide-react';
import StepProgressBar from '../components/ui/StepProgressBar';
import Button from '../components/ui/Button';
import { useProject } from '../context/ProjectContext';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');

/* ── Upload/Paste Section ── */
function UploadSection({ label, hint, required, file, onFileSelect, onFileClear, text, onTextChange, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState('file');

  const hasFile = !!file;
  const hasText = text && text.trim().length > 0;
  const hasContent = hasFile || hasText;

  const handleDragOver = (e) => { e.preventDefault(); if (!disabled && mode === 'file') setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    if (disabled || mode !== 'file') return;
    const f = e.dataTransfer.files[0];
    if (f) onFileSelect(f);
  };

  return (
    <div>
      {/* Label row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold" style={{ color: '#1C1829' }}>
            {label}{' '}
            {required
              ? <span className="text-xs font-semibold ml-1" style={{ color: '#EC4899' }}>Required</span>
              : <span className="text-xs font-medium ml-1" style={{ color: '#A09BB8' }}>Optional</span>}
          </p>
          {hint && <p className="text-xs mt-0.5" style={{ color: '#A09BB8' }}>{hint}</p>}
        </div>
        {!hasContent && !disabled && (
          <button
            onClick={mode === 'file' ? () => { setMode('text'); onFileClear(); } : () => { setMode('file'); onTextChange(''); }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200"
            style={{ color: '#8B5CF6', backgroundColor: '#F5F3FF' }}
          >
            {mode === 'file' ? <><Type size={12} /> Paste text</> : <><Upload size={12} /> Upload file</>}
          </button>
        )}
      </div>

      {/* File mode */}
      {mode === 'file' && (
        <div
          onClick={() => !hasFile && !disabled && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="rounded-2xl transition-all duration-200 relative"
          style={{
            border: hasFile ? '2px solid #8B5CF6' : dragging ? '2px solid #8B5CF6' : '2px dashed #C4B5FD',
            backgroundColor: hasFile ? '#F5F3FF' : dragging ? '#F5F3FF' : 'white',
            cursor: hasFile || disabled ? 'default' : 'pointer',
            padding: hasFile ? '18px 20px' : '36px 20px',
          }}
        >
          <input ref={inputRef} type="file" accept=".pdf,.txt,.docx"
            className="hidden" onChange={e => { if (e.target.files[0]) onFileSelect(e.target.files[0]); }} disabled={disabled} />

          {hasFile ? (
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#EDE9FE' }}>
                <FileText size={20} style={{ color: '#8B5CF6' }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold" style={{ color: '#8B5CF6' }}>File selected</p>
                <p className="text-xs truncate mt-0.5 font-medium" style={{ color: '#6B6584' }} title={file.name}>
                  {file.name} · {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
              {!disabled && (
                <button onClick={(e) => { e.stopPropagation(); onFileClear(); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{ backgroundColor: '#EDE9FE', color: '#8B5CF6' }}
                  aria-label="Remove file">
                  <X size={14} />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: '#F5F3FF', border: '1px solid #EDE9FE' }}>
                <Upload size={24} style={{ color: '#C4B5FD' }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#1C1829' }}>
                  Drop your file here or <span style={{ color: '#8B5CF6' }}>browse</span>
                </p>
                <p className="text-xs mt-1 font-medium" style={{ color: '#A09BB8' }}>
                  PDF · TXT · DOCX · up to 20 MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Text / paste mode */}
      {mode === 'text' && (
        <div className="relative">
          <textarea
            value={text}
            onChange={e => onTextChange(e.target.value)}
            disabled={disabled}
            rows={6}
            placeholder={
              label.includes('Brief')
                ? 'Paste your assignment brief here…\n\ne.g. Design and develop a mobile app prototype for a local business. The project requires…'
                : 'Paste your rubric criteria here…\n\ne.g.\n- Introduction (20%): Context, problem statement\n- Analysis (40%): Frameworks, depth of research'
            }
            className="w-full px-4 py-4 rounded-2xl text-sm resize-none transition-all duration-200"
            style={{
              border: '2px solid #C4B5FD',
              color: '#1C1829',
              backgroundColor: hasText ? '#FAFAFF' : 'white',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.7,
            }}
            onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)'; }}
            onBlur={e => { e.target.style.borderColor = '#C4B5FD'; e.target.style.boxShadow = 'none'; }}
          />
          {hasText && !disabled && (
            <button onClick={() => onTextChange('')}
              className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
              style={{ backgroundColor: '#EDE9FE', color: '#8B5CF6' }}
              aria-label="Clear text">
              <X size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Status Row ── */
function StatusRow({ icon: Icon, color, text, spin = false }) {
  return (
    <div className="flex items-center gap-3 animate-slide-up">
      <Icon size={16} style={{ color }} className={spin ? 'animate-spin' : ''} />
      <span className="text-sm font-semibold" style={{ color }}>{text}</span>
    </div>
  );
}

/* ── Main Screen ── */
export default function UploadFiles() {
  const navigate = useNavigate();
  const { projectId: PROJECT_ID } = useProject();

  const [briefFile, setBriefFile] = useState(null);
  const [briefText, setBriefText] = useState('');
  const [rubricFile, setRubricFile] = useState(null);
  const [rubricText, setRubricText] = useState('');
  const [uploadState, setUploadState] = useState('idle');
  const [extractedCriteria, setExtractedCriteria] = useState([]);
  const [error, setError] = useState(null);

  const busy = uploadState !== 'idle' && uploadState !== 'done';
  const hasBrief = !!briefFile || briefText.trim().length > 10;
  const canContinue = hasBrief;

  const getContent = (file, text) => {
    if (file) return { type: 'file', file };
    if (text.trim().length > 10) return { type: 'text', text: text.trim() };
    return null;
  };

  const appendToForm = (form, fieldName, content) => {
    if (!content) return;
    if (content.type === 'file') {
      form.append(fieldName, content.file);
    } else {
      const blob = new Blob([content.text], { type: 'text/plain' });
      form.append(fieldName, blob, `${fieldName}.txt`);
    }
  };

  const handleContinue = async () => {
    if (!hasBrief || busy || uploadState === 'done') return;
    setError(null);

    const briefContent = getContent(briefFile, briefText);
    const rubricContent = getContent(rubricFile, rubricText);

    try {
      setUploadState('uploading');
      const form = new FormData();
      appendToForm(form, 'assignment_brief', briefContent);
      if (rubricContent) appendToForm(form, 'marking_rubric', rubricContent);

      const uploadRes = await fetch(`${API}/projects/${PROJECT_ID}/upload`, { method: 'POST', body: form });
      if (!uploadRes.ok) throw new Error('upload');
      const uploadData = await uploadRes.json();

      setUploadState('extracting');
      await new Promise(r => setTimeout(r, 1200));
      setExtractedCriteria(uploadData.criteria || []);

      setUploadState('generating');
      const quizRes = await fetch(`${API}/projects/${PROJECT_ID}/quiz/generate`, { method: 'POST' });
      if (!quizRes.ok) throw new Error('quiz');

      setUploadState('done');
    } catch (err) {
      const isNetwork = err.message === 'Failed to fetch';
      setUploadState('idle');
      setError(isNetwork
        ? 'Cannot reach the server. The backend might be starting up — please wait a moment and try again.'
        : 'Something went wrong processing your files. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
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
          <StepProgressBar currentStep={2} />

          <div className="bg-white rounded-2xl p-8 sm:p-10 animate-scale-in"
            style={{ border: '1px solid #EDE9FE', boxShadow: '0 4px 24px rgba(139,92,246,0.06)' }}>

            <h1 className="text-2xl font-extrabold mb-2" style={{ color: '#1C1829', letterSpacing: '-0.02em' }}>
              Upload Your Files
            </h1>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: '#6B6584' }}>
              Upload or paste your assignment brief. Add a rubric if you have one — it helps the AI allocate tasks more precisely.
            </p>

            <div className="space-y-8">
              <UploadSection
                label="Assignment Brief"
                hint="The document describing what your team needs to deliver"
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
                hint="The grading criteria — helps AI cover every requirement"
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
              <div className="rounded-xl px-4 py-4 mt-6 flex items-start gap-3 animate-slide-down"
                style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" style={{ color: '#D97706' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold mb-1" style={{ color: '#92400E' }}>Upload failed</p>
                  <p className="text-sm" style={{ color: '#92400E' }}>{error}</p>
                </div>
                <button className="text-xs font-bold px-4 py-2 rounded-xl flex-shrink-0 transition-all duration-200"
                  style={{ border: '1px solid #FDE68A', color: '#D97706', backgroundColor: 'white' }}
                  onClick={handleContinue}>
                  Retry
                </button>
              </div>
            )}

            {/* Progress States */}
            {uploadState !== 'idle' && (
              <div className="rounded-2xl px-5 py-5 mt-6 space-y-3"
                style={{ backgroundColor: '#F5F3FF', border: '1px solid #EDE9FE' }}>
                {uploadState === 'uploading' && <StatusRow icon={Loader2} color="#8B5CF6" text="Uploading your files…" spin />}

                {['extracting', 'generating', 'done'].includes(uploadState) && (
                  <StatusRow
                    icon={uploadState === 'extracting' ? Loader2 : CheckCircle}
                    color={uploadState === 'extracting' ? '#EC4899' : '#0D9488'}
                    text={uploadState === 'extracting' ? 'AI is reading your rubric…' : 'Rubric criteria extracted'}
                    spin={uploadState === 'extracting'}
                  />
                )}

                {['generating', 'done'].includes(uploadState) && extractedCriteria.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 pl-7">
                    {extractedCriteria.map((c, i) => (
                      <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: '#EDE9FE', color: '#6D28D9' }}>
                        {c.name} · {c.weight_percent}%
                      </span>
                    ))}
                  </div>
                )}

                {uploadState === 'generating' && <StatusRow icon={Loader2} color="#EC4899" text="Generating quiz questions…" spin />}
                {uploadState === 'done' && <StatusRow icon={CheckCircle} color="#0D9488" text="Quiz ready for your team!" />}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-10">
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => navigate('/create')} className="gap-1.5 text-sm">
                  <ArrowLeft size={14} /> Back
                </Button>
                {(error?.includes('server') || error?.includes('backend')) && (
                  <button onClick={() => navigate('/invite')}
                    className="text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200"
                    style={{ color: '#A09BB8', border: '1px solid #EDE9FE' }}>
                    Skip for now →
                  </button>
                )}
              </div>
              {uploadState === 'done' ? (
                <Button variant="filled" onClick={() => navigate('/invite')} className="gap-2 px-7">
                  Invite Team <ArrowRight size={16} />
                </Button>
              ) : (
                <Button variant="filled" disabled={!canContinue || busy} onClick={handleContinue} className="gap-2 px-7">
                  {busy ? <><Loader2 size={15} className="animate-spin" /> Processing…</> : <>Upload & Continue <ArrowRight size={16} /></>}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

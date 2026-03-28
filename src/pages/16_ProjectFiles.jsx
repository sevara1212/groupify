import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FolderOpen, Plus, ExternalLink, Loader2, Trash2, Link2, Sparkles, Upload, FileText,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { supabase } from '../lib/supabase';

const FOLDERS = ['Shared', 'Planning', 'References', 'Other'];
const BUCKET = 'project-files';
const MAX_BYTES = 50 * 1024 * 1024;

function normalizeUrl(raw) {
  const t = raw.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function sanitizeFileName(name) {
  return (name || 'file').replace(/[^\w.\-()+ ]/g, '_').slice(0, 180);
}

function isMissingTableError(err) {
  const m = (err?.message || err?.hint || '').toLowerCase();
  return m.includes('project_files') && (m.includes('schema cache') || m.includes('does not exist') || m.includes('relation'));
}

export default function ProjectFiles() {
  const { projectId, currentMemberName } = useProject();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [folder, setFolder] = useState('Shared');
  const [uploadFolder, setUploadFolder] = useState('Shared');
  const [error, setError] = useState(null);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    setError(null);
    setSchemaMissing(false);
    try {
      const { data, error: e } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (e) throw e;
      setItems(data || []);
    } catch (err) {
      if (isMissingTableError(err)) {
        setSchemaMissing(true);
        setError(null);
      } else {
        setError(err.message || 'Could not load files.');
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const addLink = async () => {
    const u = normalizeUrl(url);
    if (!title.trim() || !u) return;
    setAdding(true);
    setError(null);
    try {
      const { error: e } = await supabase.from('project_files').insert({
        project_id: projectId,
        folder: folder || 'Shared',
        title: title.trim(),
        url: u,
        author_name: currentMemberName || 'Member',
      });
      if (e) throw e;
      setTitle('');
      setUrl('');
      setFolder('Shared');
      setSchemaMissing(false);
      await load();
    } catch (err) {
      if (isMissingTableError(err)) setSchemaMissing(true);
      else setError(err.message || 'Could not save.');
    } finally {
      setAdding(false);
    }
  };

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter(Boolean);
    if (!files.length || !projectId) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        if (file.size > MAX_BYTES) {
          setError(`"${file.name}" is larger than 50 MB.`);
          continue;
        }
        const safe = sanitizeFileName(file.name);
        const path = `${projectId}/${crypto.randomUUID()}_${safe}`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });
        if (upErr) throw upErr;

        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        const publicUrl = pub?.publicUrl;
        if (!publicUrl) throw new Error('Could not get file URL');

        const { error: insErr } = await supabase.from('project_files').insert({
          project_id: projectId,
          folder: uploadFolder || 'Shared',
          title: file.name,
          url: publicUrl,
          storage_path: path,
          file_name: file.name,
          mime_type: file.type || null,
          author_name: currentMemberName || 'Member',
        });
        if (insErr) throw insErr;
      }
      setSchemaMissing(false);
      await load();
    } catch (err) {
      if (isMissingTableError(err)) setSchemaMissing(true);
      else setError(err.message || 'Upload failed. Check Storage bucket "project-files" exists.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = async (row) => {
    try {
      if (row.storage_path) {
        await supabase.storage.from(BUCKET).remove([row.storage_path]);
      }
      await supabase.from('project_files').delete().eq('id', row.id);
      await load();
    } catch {
      await supabase.from('project_files').delete().eq('id', row.id);
      await load();
    }
  };

  const byFolder = FOLDERS.reduce((acc, f) => {
    acc[f] = items.filter((i) => (i.folder || 'Shared') === f);
    return acc;
  }, {});
  const uncategorized = items.filter((i) => !FOLDERS.includes(i.folder || 'Shared'));
  if (uncategorized.length) byFolder.Other = [...(byFolder.Other || []), ...uncategorized];

  if (!projectId) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-6" style={{ backgroundColor: '#F8F7FF' }}>
        <p className="text-sm font-medium" style={{ color: '#6B6584' }}>Join a project to see shared files.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 45%, #DB2777 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-6 py-8 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <FolderOpen size={22} color="white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>
                Project Files
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Upload files for the team or paste links (Google Docs, Drive, etc.).
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {schemaMissing && (
          <div className="rounded-2xl px-4 py-3 mb-6 text-sm" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E' }}>
            <p className="font-bold mb-1">Database table not found</p>
            <p className="leading-relaxed">
              Run the SQL in <code className="text-xs bg-white/80 px-1 rounded">supabase/migrations/20260329000000_project_files_storage.sql</code> in the
              Supabase Dashboard → SQL Editor (or <code className="text-xs bg-white/80 px-1 rounded">supabase db push</code>), then refresh this page.
            </p>
          </div>
        )}

        {/* Upload */}
        <div
          className="bg-white rounded-2xl p-6 mb-6"
          style={{ border: '1px solid #EDE9FE', boxShadow: '0 4px 24px rgba(139,92,246,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Upload size={16} style={{ color: '#7C3AED' }} />
            <h2 className="text-sm font-extrabold" style={{ color: '#1C1829' }}>Upload files</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: '#6B6580' }}>PDF, images, zip, etc. Max 50 MB per file. Stored in your Supabase project bucket <code>project-files</code>.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-xs font-bold mb-1 block" style={{ color: '#6B6584' }}>Folder</label>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: '#E9D5FF', color: '#1C1829', backgroundColor: '#FAFAFF' }}
              >
                {FOLDERS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 flex items-end">
              <input ref={fileRef} type="file" multiple className="hidden"
                onChange={(e) => uploadFiles(e.target.files)} />
              <button
                type="button"
                disabled={uploading || schemaMissing}
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border-2 border-dashed transition-all disabled:opacity-50"
                style={{ borderColor: '#C4B5FD', color: '#6D28D9', backgroundColor: '#FAF5FF' }}
              >
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                {uploading ? 'Uploading…' : 'Choose files or drop below'}
              </button>
            </div>
          </div>
          <div
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => {
              e.preventDefault();
              uploadFiles(e.dataTransfer.files);
            }}
            className="rounded-xl py-8 text-center text-xs font-medium"
            style={{ backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1', color: '#64748B' }}
          >
            Drop files here
          </div>
        </div>

        {/* Add link */}
        <div
          className="bg-white rounded-2xl p-6 mb-8"
          style={{ border: '1px solid #EDE9FE', boxShadow: '0 4px 24px rgba(139,92,246,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} style={{ color: '#8B5CF6' }} />
            <h2 className="text-sm font-extrabold" style={{ color: '#1C1829' }}>
              Add a link instead
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-bold mb-1.5 block" style={{ color: '#6B6584' }}>
                Folder
              </label>
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium border"
                style={{ borderColor: '#E9D5FF', color: '#1C1829', backgroundColor: '#FAFAFF' }}
              >
                {FOLDERS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold mb-1.5 block" style={{ color: '#6B6584' }}>
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Week 3 draft"
                className="w-full px-4 py-3 rounded-xl text-sm font-medium border"
                style={{ borderColor: '#E9D5FF', color: '#1C1829' }}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-bold mb-1.5 block" style={{ color: '#6B6584' }}>
              URL (Google Docs, Drive, Notion…)
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://docs.google.com/document/d/..."
              className="w-full px-4 py-3 rounded-xl text-sm font-medium border"
              style={{ borderColor: '#E9D5FF', color: '#1C1829' }}
            />
          </div>
          {error && (
            <p className="text-sm mb-3 font-medium" style={{ color: '#B91C1C' }}>
              {error}
            </p>
          )}
          <button
            type="button"
            disabled={adding || schemaMissing || !title.trim() || !url.trim()}
            onClick={addLink}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #DB2777)', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}
          >
            {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Add link to folder
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin" style={{ color: '#8B5CF6' }} />
          </div>
        ) : (
          <div className="space-y-8">
            {FOLDERS.map((fname) => {
              const list = byFolder[fname] || [];
              if (fname === 'Other' && list.length === 0) return null;
              return (
                <section key={fname}>
                  <div className="flex items-center gap-2 mb-3">
                    <FolderOpen size={16} style={{ color: '#7C3AED' }} />
                    <h3 className="text-sm font-extrabold" style={{ color: '#1C1829' }}>
                      {fname}
                    </h3>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}
                    >
                      {list.length}
                    </span>
                  </div>
                  {list.length === 0 ? (
                    <p className="text-sm py-6 px-4 rounded-xl" style={{ color: '#9CA3AF', backgroundColor: '#FAFAFF', border: '1px dashed #E9D5FF' }}>
                      No files in this folder yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {list.map((row) => (
                        <div
                          key={row.id}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-white transition-all hover:shadow-md"
                          style={{ border: '1px solid #EDE9FE', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                        >
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #EDE9FE, #FDF2F8)' }}
                          >
                            {row.storage_path ? (
                              <FileText size={18} style={{ color: '#7C3AED' }} />
                            ) : (
                              <Link2 size={18} style={{ color: '#7C3AED' }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: '#111827' }}>
                              {row.title}
                            </p>
                            <p className="text-xs mt-0.5 truncate" style={{ color: '#6B7280' }}>
                              {row.storage_path ? 'Upload' : 'Link'} · {row.author_name || 'Team'} ·{' '}
                              {new Date(row.created_at).toLocaleDateString('en-AU', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </p>
                          </div>
                          <a
                            href={row.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold flex-shrink-0"
                            style={{
                              background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
                              color: 'white',
                              boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
                            }}
                          >
                            Open <ExternalLink size={13} />
                          </a>
                          <button
                            type="button"
                            onClick={() => remove(row)}
                            className="p-2 rounded-xl flex-shrink-0"
                            style={{ color: '#9CA3AF' }}
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

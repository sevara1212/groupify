import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Send, Loader2, Users, Hash,
  ChevronRight, Circle, AlertTriangle, RefreshCw, Wifi, WifiOff,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { supabase } from '../lib/supabase';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');

const MEMBER_COLORS = ['#8B5CF6', '#EC4899', '#D97706', '#0EA5E9', '#0D9488', '#6366F1'];

function getColorForName(name) {
  if (!name) return MEMBER_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return MEMBER_COLORS[Math.abs(hash) % MEMBER_COLORS.length];
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return time;
  if (isYesterday) return `Yesterday ${time}`;
  return `${d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} ${time}`;
}

function isNewDay(current, prev) {
  if (!prev) return true;
  return new Date(current).toDateString() !== new Date(prev).toDateString();
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });
}

/* ─── Member Sidebar ─────────────────────────────── */
function MemberSidebar({ members, messages, currentName, visible, onClose }) {
  const activeSet = new Set();
  const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
  messages.forEach(m => {
    if (new Date(m.created_at).getTime() > thirtyMinAgo) activeSet.add(m.author_name);
  });

  return (
    <>
      {visible && (
        <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={onClose} />
      )}

      <aside
        className="flex flex-col flex-shrink-0 bg-white transition-all duration-300"
        style={{
          width: visible ? 220 : 0,
          minWidth: visible ? 220 : 0,
          overflow: 'hidden',
          borderLeft: visible ? '1px solid #EDE9FE' : 'none',
          borderRadius: '0 16px 16px 0',
        }}
      >
        <div style={{ width: 220, padding: '16px 0 8px 0' }}>
          <div className="px-4 pb-3" style={{ borderBottom: '1px solid #F5F3FF' }}>
            <div className="flex items-center gap-2">
              <Users size={13} style={{ color: '#8B5CF6' }} />
              <span className="text-xs font-extrabold" style={{ color: '#1C1829' }}>Members</span>
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                {members.length}
              </span>
            </div>
          </div>

          <div className="py-2">
            {members.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-xs" style={{ color: '#C4B5FD' }}>No members yet</p>
              </div>
            ) : (
              members.map((m) => {
                const color = getColorForName(m.name);
                const isActive = activeSet.has(m.name);
                const isMe = m.name === currentName;
                return (
                  <div key={m.id}
                    className="flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded-xl transition-colors"
                    style={{ backgroundColor: isMe ? '#F5F3FF' : 'transparent' }}>
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: color }}>
                        {getInitials(m.name)}
                      </div>
                      {isActive && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                          style={{ backgroundColor: '#10B981' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: '#111827' }}>
                        {m.name}{isMe ? ' (you)' : ''}
                      </p>
                      {isActive && (
                        <p className="text-xs" style={{ color: '#10B981' }}>Active</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mx-4 mt-2 px-3 py-2.5 rounded-xl" style={{ backgroundColor: '#F8F7FF', border: '1px solid #EDE9FE' }}>
            <p className="text-xs font-medium" style={{ color: '#A09BB8' }}>
              <span className="font-bold" style={{ color: '#8B5CF6' }}>{activeSet.size}</span> active · <span className="font-bold" style={{ color: '#6B7280' }}>{members.length}</span> total
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function Messages() {
  const { projectId, currentMemberName, currentMemberId } = useProject();
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const channelRef = useRef(null);

  const authorName = currentMemberName || 'You';

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Fetch members from API
  useEffect(() => {
    if (!projectId) return;
    fetch(`${API}/projects/${projectId}/members`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.members) setMembers(d.members); })
      .catch(() => {});
  }, [projectId]);

  // Fetch messages + realtime subscription
  useEffect(() => {
    if (!projectId) { setLoading(false); return; }

    let cancelled = false;

    const fetchMessages = async () => {
      setError(null);
      try {
        const { data, error: fetchErr } = await supabase
          .from('messages')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true });

        if (cancelled) return;

        if (fetchErr) {
          console.error('Supabase fetch error:', fetchErr);
          setError(`Could not load messages: ${fetchErr.message}`);
        } else {
          setMessages(data || []);
        }
      } catch (err) {
        if (!cancelled) setError('Could not connect to the database.');
      } finally {
        if (!cancelled) {
          setLoading(false);
          setTimeout(scrollToBottom, 100);
        }
      }
    };

    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel(`messages:${projectId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`,
      }, (payload) => {
        // Deduplicate — avoid adding if we already inserted optimistically
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
        setTimeout(scrollToBottom, 50);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setConnected(false);
        }
      });

    channelRef.current = channel;

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [projectId, scrollToBottom]);

  const send = async () => {
    if (!text.trim() || !projectId) return;
    const messageText = text.trim();
    setText('');
    setSending(true);

    // Optimistic insert — show immediately
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      project_id: projectId,
      member_id: currentMemberId || null,
      author_name: authorName,
      text: messageText,
      created_at: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(scrollToBottom, 30);

    try {
      const { data, error: sendErr } = await supabase.from('messages').insert({
        project_id: projectId,
        member_id: currentMemberId || null,
        author_name: authorName,
        text: messageText,
      }).select().single();

      if (sendErr) {
        console.error('Send error:', sendErr);
        // Remove the optimistic message and restore text
        setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        setText(messageText);
        setError('Failed to send message. Check your connection.');
        setTimeout(() => setError(null), 4000);
      } else if (data) {
        // Replace optimistic with real message
        setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data : m));
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setText(messageText);
      setError('Failed to send message. Check your connection.');
      setTimeout(() => setError(null), 4000);
    }

    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const retry = () => {
    setLoading(true);
    setError(null);
    setMessages([]);
    // Re-trigger effect by forcing component update
    const handler = async () => {
      try {
        const { data, error: fetchErr } = await supabase
          .from('messages')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true });
        if (fetchErr) {
          setError(`Could not load messages: ${fetchErr.message}`);
        } else {
          setMessages(data || []);
        }
      } catch {
        setError('Could not connect to the database.');
      } finally {
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    };
    handler();
  };

  if (!projectId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#F8F7FF' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
          <MessageSquare size={24} color="white" />
        </div>
        <p className="text-base font-bold mb-1" style={{ color: '#1C1829' }}>No project loaded</p>
        <p className="text-sm" style={{ color: '#A09BB8' }}>Join or create a project first to access the group chat.</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-0"
      style={{ backgroundColor: '#F8F7FF', height: 'calc(100dvh - 3.5rem)' }}
    >

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden flex-shrink-0 z-0"
        style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #EC4899 100%)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'white', transform: 'translate(30%, -50%)' }} />
        <div className="absolute bottom-0 left-12 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'white', transform: 'translate(-20%, 50%)' }} />

        <div className="max-w-5xl mx-auto px-6 py-5 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
                <MessageSquare size={20} color="white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>
                  Group Chat
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-white/70 text-xs font-medium">
                    <Hash size={10} className="inline mr-0.5" />project channel
                  </span>
                  <span className="text-white/50">·</span>
                  <span className="text-white/70 text-xs font-medium">
                    <Users size={10} className="inline mr-0.5" />
                    {members.length} member{members.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Connection indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: connected ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                  border: `1px solid ${connected ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}`,
                }}>
                {connected ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#34D399' }} />
                    <span className="text-xs font-bold text-white">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={10} style={{ color: '#FBBF24' }} />
                    <span className="text-xs font-bold text-white">Connecting…</span>
                  </>
                )}
              </div>

              {/* Toggle sidebar */}
              <button
                onClick={() => setSidebarOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  backgroundColor: sidebarOpen ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}>
                <Users size={12} />
                <span className="hidden sm:block">Members</span>
              </button>
            </div>
          </div>

          {/* Member avatar row */}
          {members.length > 0 && (
            <div className="flex items-center gap-1.5 mt-4">
              <div className="flex -space-x-1.5">
                {members.slice(0, 7).map((m, i) => (
                  <div key={m.id}
                    title={m.name}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold border-2 border-white/30 text-xs"
                    style={{ backgroundColor: getColorForName(m.name), zIndex: 10 - i }}>
                    {getInitials(m.name)}
                  </div>
                ))}
                {members.length > 7 && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold border-2 border-white/30 text-xs"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', zIndex: 2 }}>
                    +{members.length - 7}
                  </div>
                )}
              </div>
              <span className="text-white/60 text-xs ml-1">{members.length} people in this project</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="max-w-5xl mx-auto w-full px-6 mt-3">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
            <AlertTriangle size={14} style={{ color: '#EF4444' }} />
            <p className="text-xs font-medium flex-1" style={{ color: '#991B1B' }}>{error}</p>
            <button onClick={retry} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
              <RefreshCw size={10} /> Retry
            </button>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 min-h-0 flex flex-col max-w-5xl mx-auto w-full px-4 sm:px-6 pb-4 pt-3">

        <div className="flex-1 min-h-0 flex gap-3 md:gap-4 overflow-hidden">

          {/* ── Chat panel ── */}
          <div className="flex-1 min-h-0 min-w-0 bg-white rounded-2xl flex flex-col overflow-hidden shadow-sm"
            style={{ border: '1px solid #EDE9FE', boxShadow: '0 2px 16px rgba(139,92,246,0.06)', maxHeight: '100%' }}>

            {/* Messages area */}
            <div ref={scrollRef} className="flex-1 min-h-0 px-4 sm:px-5 py-3 overflow-y-auto overscroll-contain" style={{ scrollBehavior: 'smooth' }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[10rem] gap-3 py-8">
                  <Loader2 size={24} className="animate-spin" style={{ color: '#8B5CF6' }} />
                  <p className="text-sm font-medium" style={{ color: '#6B6584' }}>Loading messages…</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[12rem] py-8 gap-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #F5F3FF, #FDF2F8)', border: '1px solid #EDE9FE' }}>
                    <MessageSquare size={22} style={{ color: '#C4B5FD' }} />
                  </div>
                  <div className="text-center px-2">
                    <p className="text-sm font-bold mb-0.5" style={{ color: '#1C1829' }}>No messages yet</p>
                    <p className="text-xs max-w-xs mx-auto leading-relaxed" style={{ color: '#6B6584' }}>Start the conversation with your group.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {messages.map((m, idx) => {
                    const isMe = m.author_name === authorName;
                    const color = getColorForName(m.author_name);
                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                    const showDay = isNewDay(m.created_at, prevMsg?.created_at);
                    const sameAuthorAsPrev = prevMsg && prevMsg.author_name === m.author_name && !showDay;
                    const isOptimistic = m._optimistic;

                    return (
                      <React.Fragment key={m.id}>
                        {showDay && (
                          <div className="flex items-center gap-3 my-5">
                            <div className="flex-1 h-px" style={{ backgroundColor: '#EDE9FE' }} />
                            <span className="text-xs font-semibold px-3 py-1 rounded-full"
                              style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                              {formatDayLabel(m.created_at)}
                            </span>
                            <div className="flex-1 h-px" style={{ backgroundColor: '#EDE9FE' }} />
                          </div>
                        )}

                        <div className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''} ${sameAuthorAsPrev ? 'mt-0.5' : 'mt-3'}`}>
                          {!sameAuthorAsPrev ? (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5"
                              style={{ backgroundColor: color }}>
                              {getInitials(m.author_name)}
                            </div>
                          ) : (
                            <div className="w-8 flex-shrink-0" />
                          )}

                          <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                            {!sameAuthorAsPrev && (
                              <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <span className="text-xs font-bold" style={{ color }}>{m.author_name}</span>
                                <span className="text-xs" style={{ color: '#C4B5FD' }}>{formatTime(m.created_at)}</span>
                              </div>
                            )}
                            <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                              style={isMe ? {
                                background: isOptimistic ? '#A78BFA' : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                                color: 'white',
                                borderBottomRightRadius: sameAuthorAsPrev ? 16 : 4,
                                boxShadow: '0 2px 8px rgba(139,92,246,0.2)',
                                opacity: isOptimistic ? 0.7 : 1,
                              } : {
                                backgroundColor: '#F8F7FF',
                                color: '#1C1829',
                                borderBottomLeftRadius: sameAuthorAsPrev ? 16 : 4,
                                border: '1px solid #EDE9FE',
                              }}>
                              {m.text}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="px-4 py-3 flex items-end gap-2.5"
              style={{ borderTop: '1px solid #EDE9FE', backgroundColor: '#FAFAFF' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mb-0.5"
                style={{ backgroundColor: getColorForName(authorName) }}>
                {getInitials(authorName)}
              </div>
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message as ${authorName}…`}
                  rows={1}
                  className="w-full px-4 py-2.5 rounded-xl text-sm resize-none transition-all"
                  style={{
                    border: '1.5px solid #EDE9FE',
                    color: '#1C1829',
                    outline: 'none',
                    backgroundColor: 'white',
                    maxHeight: 120,
                    minHeight: 40,
                  }}
                  onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}
                  onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
                />
              </div>
              <button onClick={send} disabled={!text.trim() || sending}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-40"
                style={{
                  background: text.trim() ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : '#EDE9FE',
                  color: 'white',
                  boxShadow: text.trim() ? '0 4px 12px rgba(139,92,246,0.3)' : 'none',
                }}>
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          </div>

          {/* ── Member Sidebar ── */}
          <MemberSidebar
            members={members}
            messages={messages}
            currentName={authorName}
            visible={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </main>
    </div>
  );
}

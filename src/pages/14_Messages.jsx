import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, Loader2, Smile, Users, Hash } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { supabase } from '../lib/supabase';
import Avatar from '../components/ui/Avatar';

const MEMBER_COLORS = ['#8B5CF6', '#EC4899', '#D97706', '#0EA5E9', '#0D9488', '#6366F1'];

function getColorForName(name) {
  if (!name) return MEMBER_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return MEMBER_COLORS[Math.abs(hash) % MEMBER_COLORS.length];
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

export default function Messages() {
  const { projectId, currentMemberName } = useProject();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const authorName = currentMemberName || 'You';

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Fetch messages from Supabase
  useEffect(() => {
    if (!projectId) { setLoading(false); return; }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    };

    fetchMessages();

    // Fetch member count
    supabase.from('members').select('id', { count: 'exact' }).eq('project_id', projectId)
      .then(({ count }) => setMemberCount(count || 0));

    // Real-time subscription
    const channel = supabase
      .channel(`messages:${projectId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        setTimeout(scrollToBottom, 50);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [projectId, scrollToBottom]);

  // Send message
  const send = async () => {
    if (!text.trim() || !projectId) return;
    const messageText = text.trim();
    setText('');
    setSending(true);

    const { error } = await supabase.from('messages').insert({
      project_id: projectId,
      author_name: authorName,
      text: messageText,
    });

    if (error) {
      console.error('Error sending message:', error);
      setText(messageText); // Restore on error
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-6 flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 4px 12px rgba(139,92,246,0.25)' }}>
              <MessageSquare size={18} color="white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold" style={{ color: '#1C1829', letterSpacing: '-0.02em' }}>Group Chat</h1>
              <p className="text-xs font-medium" style={{ color: '#A09BB8' }}>
                <Users size={10} className="inline mr-1" />
                {memberCount} member{memberCount !== 1 ? 's' : ''} · <Hash size={10} className="inline mx-0.5" /> Project channel
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0D9488' }} />
            <span className="text-xs font-medium" style={{ color: '#0D9488' }}>Live</span>
          </div>
        </div>

        {/* Chat container */}
        <div className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden"
          style={{ border: '1px solid #EDE9FE', boxShadow: '0 2px 16px rgba(139,92,246,0.06)' }}>

          {/* Messages area */}
          <div ref={scrollRef} className="flex-1 px-5 py-4 overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 size={24} className="animate-spin" style={{ color: '#8B5CF6' }} />
                <p className="text-sm font-medium" style={{ color: '#A09BB8' }}>Loading messages…</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #F5F3FF, #FDF2F8)', border: '1px solid #EDE9FE' }}>
                  <MessageSquare size={24} style={{ color: '#C4B5FD' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold mb-1" style={{ color: '#1C1829' }}>No messages yet</p>
                  <p className="text-xs" style={{ color: '#A09BB8' }}>Start the conversation with your group!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {messages.map((m, idx) => {
                  const isMe = m.author_name === authorName;
                  const color = getColorForName(m.author_name);
                  const prevMsg = idx > 0 ? messages[idx - 1] : null;
                  const showDay = isNewDay(m.created_at, prevMsg?.created_at);
                  const sameAuthorAsPrev = prevMsg && prevMsg.author_name === m.author_name && !showDay;

                  return (
                    <React.Fragment key={m.id}>
                      {/* Day divider */}
                      {showDay && (
                        <div className="flex items-center gap-3 my-4">
                          <div className="flex-1 h-px" style={{ backgroundColor: '#EDE9FE' }} />
                          <span className="text-xs font-semibold px-3 py-1 rounded-full"
                            style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                            {formatDayLabel(m.created_at)}
                          </span>
                          <div className="flex-1 h-px" style={{ backgroundColor: '#EDE9FE' }} />
                        </div>
                      )}

                      <div className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''} ${sameAuthorAsPrev ? 'mt-0.5' : 'mt-3'}`}>
                        {/* Avatar: show only for first message in a sequence */}
                        {!sameAuthorAsPrev ? (
                          <Avatar name={m.author_name} color={color} size="sm" className="mt-0.5" />
                        ) : (
                          <div className="w-8 flex-shrink-0" /> /* spacer */
                        )}
                        <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                          {/* Author name: show only for first in sequence */}
                          {!sameAuthorAsPrev && (
                            <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                              <span className="text-xs font-bold" style={{ color: color }}>{m.author_name}</span>
                              <span className="text-xs" style={{ color: '#C4B5FD' }}>{formatTime(m.created_at)}</span>
                            </div>
                          )}
                          <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                            style={isMe
                              ? {
                                  background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                                  color: 'white',
                                  borderBottomRightRadius: sameAuthorAsPrev ? 16 : 4,
                                  boxShadow: '0 2px 8px rgba(139,92,246,0.20)',
                                }
                              : {
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
          <div className="px-4 py-3 flex items-end gap-2.5" style={{ borderTop: '1px solid #EDE9FE', backgroundColor: '#FAFAFF' }}>
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
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
      </main>
    </div>
  );
}

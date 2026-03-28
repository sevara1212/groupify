import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import Avatar from '../components/ui/Avatar';

const MEMBER_COLORS = ['#8B5CF6', '#EC4899', '#D97706', '#0EA5E9'];
const DEMO_MESSAGES = [
  { id: 1, author: 'Ethan',  color: '#8B5CF6', text: 'Hey everyone — I just submitted the intro section!', time: '2:14 PM' },
  { id: 2, author: 'Sophie', color: '#EC4899', text: 'Nice! I\'m halfway through the literature review.', time: '2:18 PM' },
  { id: 3, author: 'Maya',   color: '#D97706', text: 'Should we meet tomorrow to review the methodology?', time: '2:31 PM' },
  { id: 4, author: 'Ethan',  color: '#8B5CF6', text: 'Works for me — 3pm?', time: '2:33 PM' },
];

export default function Messages() {
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), author: 'You', color: '#0EA5E9', text: text.trim(), time: new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) }]);
    setText('');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8 flex flex-col">
        <h1 className="text-2xl font-extrabold mb-6" style={{ color: '#1C1829', letterSpacing: '-0.02em' }}>Messages</h1>

        <div className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden"
          style={{ border: '1px solid #EDE9FE', boxShadow: '0 2px 12px rgba(139,92,246,0.06)', minHeight: 400 }}>
          {/* Messages */}
          <div className="flex-1 p-5 space-y-4 overflow-y-auto">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-3 ${m.author === 'You' ? 'flex-row-reverse' : ''}`}>
                <Avatar name={m.author} color={m.color} size="sm" />
                <div className={`max-w-xs ${m.author === 'You' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <p className="text-xs font-semibold" style={{ color: '#A09BB8' }}>{m.author} · {m.time}</p>
                  <div className="px-4 py-2.5 rounded-2xl text-sm"
                    style={m.author === 'You'
                      ? { background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', color: 'white', borderBottomRightRadius: 4 }
                      : { backgroundColor: '#F5F3FF', color: '#1C1829', borderBottomLeftRadius: 4 }}>
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 py-3 flex gap-2" style={{ borderTop: '1px solid #EDE9FE' }}>
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Message your group…"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm transition-all"
              style={{ border: '1px solid #EDE9FE', color: '#1C1829', outline: 'none', backgroundColor: '#F8F7FF' }}
              onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px #EDE9FE'; }}
              onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}
            />
            <button onClick={send}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', color: 'white', boxShadow: '0 4px 12px rgba(139,92,246,0.3)', flexShrink: 0 }}>
              <Send size={15} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, ArrowRight, Users } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');

const MEMBER_COLORS = ['#8B5CF6', '#EC4899', '#D97706', '#0EA5E9', '#0D9488', '#6366F1'];

const WAITING_MESSAGES = [
  'Grab a coffee while your team finishes up ☕',
  'Almost there — just waiting on a few teammates 🎯',
  'Good things take a moment… ✨',
  'Your team is crushing the quiz! 💪',
  'Hang tight, the AI is getting ready 🤖',
];

export default function WaitingRoom() {
  const navigate = useNavigate();
  const { projectId } = useProject();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allDone, setAllDone] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [navigating, setNavigating] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch(`${API}/projects/${projectId}/members`);
      if (res.ok) {
        const data = await res.json();
        const list = data.members || [];
        setMembers(list);
        if (list.length > 0 && list.every(m => m.quiz_done)) {
          setAllDone(true);
        }
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchMembers();
    const poll = setInterval(fetchMembers, 5000);
    return () => clearInterval(poll);
  }, [fetchMembers]);

  // Rotate encouragement messages every 4s
  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % WAITING_MESSAGES.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Auto-navigate when all done
  useEffect(() => {
    if (allDone && !navigating) {
      setNavigating(true);
      setTimeout(() => navigate('/allocation'), 2500);
    }
  }, [allDone, navigating, navigate]);

  const doneCount = members.filter(m => m.quiz_done).length;
  const total = members.length;
  const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const pendingMembers = members.filter(m => !m.quiz_done);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: 'linear-gradient(160deg, #EDE9FE 0%, #FDF2F8 55%, #E0F2FE 100%)' }}>

      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute rounded-full"
          style={{ width: 400, height: 400, top: '5%', left: '-10%', background: 'radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)', animation: 'blobFloat 9s ease-in-out infinite' }} />
        <div className="absolute rounded-full"
          style={{ width: 300, height: 300, bottom: '10%', right: '-8%', background: 'radial-gradient(circle, rgba(236,72,153,0.09) 0%, transparent 70%)', animation: 'blobFloat 11s ease-in-out infinite reverse' }} />
        <div className="absolute rounded-full"
          style={{ width: 200, height: 200, top: '60%', left: '40%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', animation: 'blobFloat 13s ease-in-out infinite 2s' }} />
      </div>

      <div className="w-full max-w-md relative" style={{ zIndex: 1 }}>

        {/* Groupify logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 4px 12px rgba(139,92,246,0.35)' }}>
            <span className="text-white font-black" style={{ fontSize: 17, letterSpacing: '-0.04em' }}>G</span>
          </div>
          <span className="font-extrabold tracking-tight bg-clip-text text-transparent"
            style={{ fontSize: 22, backgroundImage: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
            Groupify
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl overflow-hidden"
          style={{ boxShadow: '0 24px 64px rgba(139,92,246,0.16)', border: '1px solid rgba(196,181,253,0.4)' }}>

          {/* Card header */}
          <div className="flex flex-col items-center px-8 pt-9 pb-6"
            style={{ background: 'linear-gradient(150deg, #F5F3FF 0%, #FDF2F8 100%)' }}>

            {/* Animated icon */}
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{
                  background: allDone
                    ? 'linear-gradient(135deg, #16A34A, #059669)'
                    : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  boxShadow: allDone
                    ? '0 12px 32px rgba(22,163,74,0.35)'
                    : '0 12px 32px rgba(139,92,246,0.35)',
                  animation: 'iconFloat 3s ease-in-out infinite',
                  transition: 'all 0.5s ease',
                }}>
                <span style={{ fontSize: 38, animation: allDone ? 'none' : 'emojiSpin 4s ease-in-out infinite' }}>
                  {allDone ? '🎉' : '⏳'}
                </span>
              </div>
              {/* Pulsing ring */}
              {!allDone && (
                <div className="absolute inset-0 rounded-3xl"
                  style={{ border: '2px solid rgba(139,92,246,0.4)', animation: 'ringPulse 2s ease-out infinite' }} />
              )}
              {/* Orbiting dots when waiting */}
              {!allDone && (
                <>
                  <div className="absolute w-3 h-3 rounded-full" style={{ background: '#8B5CF6', top: -3, right: -3, animation: 'dotPop 2s ease-in-out infinite' }} />
                  <div className="absolute w-2.5 h-2.5 rounded-full" style={{ background: '#EC4899', bottom: 2, left: -5, animation: 'dotPop 2s ease-in-out infinite 0.7s' }} />
                  <div className="absolute w-2 h-2 rounded-full" style={{ background: '#6366F1', top: '45%', right: -7, animation: 'dotPop 2s ease-in-out infinite 1.4s' }} />
                </>
              )}
            </div>

            {allDone ? (
              <>
                <h1 className="text-xl font-extrabold text-center mb-1.5" style={{ color: '#1C1829' }}>
                  Everyone's ready! 🎉
                </h1>
                <p className="text-sm text-center font-medium" style={{ color: '#6B6584' }}>
                  Taking you to task allocation…
                </p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-extrabold text-center mb-1.5" style={{ color: '#1C1829' }}>
                  Waiting for your team
                </h1>
                <p className="text-sm text-center font-medium transition-all duration-500"
                  style={{ color: '#6B6584', minHeight: 20 }}>
                  {WAITING_MESSAGES[msgIdx]}
                </p>
              </>
            )}
          </div>

          {/* Card body */}
          <div className="px-7 pb-8 pt-5">

            {/* Progress bar */}
            {!loading && total > 0 && (
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold" style={{ color: '#6B6584' }}>
                    <span className="font-bold" style={{ color: '#1C1829' }}>{doneCount}</span> of {total} members done
                  </span>
                  <span className="text-xs font-bold" style={{ color: '#8B5CF6' }}>{progress}%</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE9FE' }}>
                  <div className="h-3 rounded-full transition-all duration-700"
                    style={{
                      width: `${progress}%`,
                      background: allDone
                        ? 'linear-gradient(90deg, #16A34A, #059669)'
                        : 'linear-gradient(90deg, #8B5CF6, #EC4899)',
                      boxShadow: '0 2px 8px rgba(139,92,246,0.3)',
                    }} />
                </div>
              </div>
            )}

            {/* Member list */}
            {loading ? (
              <div className="flex flex-col items-center py-10 gap-3">
                <Loader2 size={28} className="animate-spin" style={{ color: '#8B5CF6' }} />
                <p className="text-sm font-medium" style={{ color: '#A09BB8' }}>Loading team…</p>
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: '#F5F3FF' }}>
                  <Users size={24} style={{ color: '#8B5CF6' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold mb-1" style={{ color: '#1C1829' }}>No members yet</p>
                  <p className="text-xs" style={{ color: '#A09BB8' }}>Make sure your teammates have joined the project!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 mb-4">
                {members.map((member, idx) => {
                  const isDone = member.quiz_done;
                  const color = MEMBER_COLORS[idx % MEMBER_COLORS.length];
                  return (
                    <div key={member.id}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-500"
                      style={{
                        backgroundColor: isDone ? '#F0FDF4' : '#FAFAFF',
                        border: `1px solid ${isDone ? '#BBF7D0' : '#EDE9FE'}`,
                      }}>
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                        style={{
                          background: isDone
                            ? 'linear-gradient(135deg, #16A34A, #059669)'
                            : `linear-gradient(135deg, ${color}, ${color}bb)`,
                          boxShadow: isDone
                            ? '0 4px 10px rgba(22,163,74,0.2)'
                            : `0 4px 10px ${color}30`,
                        }}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: '#1C1829' }}>{member.name}</p>
                        <p className="text-xs font-medium" style={{ color: isDone ? '#059669' : '#A09BB8' }}>
                          {isDone ? '✓ Quiz completed' : 'Taking the quiz…'}
                        </p>
                      </div>

                      {/* Status indicator */}
                      {isDone ? (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#DCFCE7' }}>
                          <CheckCircle size={16} style={{ color: '#16A34A' }} />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {[0, 1, 2].map(i => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor: color,
                                animation: `dotBounce 1.3s ease-in-out infinite ${i * 0.18}s`,
                              }} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* All done → loading allocation banner */}
            {allDone && (
              <div className="flex items-center gap-3 px-5 py-4 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 6px 20px rgba(139,92,246,0.3)' }}>
                <Loader2 size={18} color="white" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Building your task plan…</p>
                  <p className="text-xs text-white/70">AI is analysing everyone's answers</p>
                </div>
                <ArrowRight size={18} color="white" style={{ flexShrink: 0 }} />
              </div>
            )}

            {/* Still waiting hint */}
            {!allDone && !loading && pendingMembers.length > 0 && (
              <div className="text-center pt-1">
                <p className="text-xs" style={{ color: '#A09BB8' }}>
                  Still waiting for{' '}
                  <span className="font-semibold" style={{ color: '#6B6584' }}>
                    {pendingMembers.length <= 2
                      ? pendingMembers.map(m => m.name).join(' & ')
                      : `${pendingMembers[0].name} and ${pendingMembers.length - 1} others`}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blobFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-22px)} }
        @keyframes iconFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-7px) scale(1.02)} }
        @keyframes emojiSpin { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(8deg)} }
        @keyframes ringPulse { 0%{opacity:0.8;transform:scale(1)} 100%{opacity:0;transform:scale(1.45)} }
        @keyframes dotPop { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(0.6);opacity:0.4} }
        @keyframes dotBounce { 0%,80%,100%{transform:translateY(0);opacity:0.5} 40%{transform:translateY(-5px);opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

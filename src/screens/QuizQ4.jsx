import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, Zap } from 'lucide-react';
import QuizProgress from '../components/ui/QuizProgress';
import Button from '../components/ui/Button';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOTS = ['Morning', 'Afternoon', 'Evening'];
const SLOT_ICONS = ['☀️', '🌤️', '🌙'];

const TASK_PREFS = [
  { id: 'early',  label: 'Start early · first draft & setup', emoji: '🚀' },
  { id: 'mid',    label: 'Mid-stage analysis and writing', emoji: '📝' },
  { id: 'polish', label: 'Final polish & review', emoji: '✨' },
];

export default function QuizQ4() {
  const navigate = useNavigate();

  const [avail, setAvail] = useState(() =>
    Object.fromEntries(SLOTS.map((s) => [s, Object.fromEntries(DAYS.map((d) => [d, false]))]))
  );
  const [taskPref, setTaskPref] = useState(null);

  const toggleCell = (slot, day) =>
    setAvail((prev) => ({
      ...prev,
      [slot]: { ...prev[slot], [day]: !prev[slot][day] },
    }));

  const selectedCount = Object.values(avail).reduce(
    (sum, slots) => sum + Object.values(slots).filter(Boolean).length, 0
  );

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10"
      style={{ backgroundColor: '#F8F7FF' }}>
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold" style={{ color: '#1C1829' }}>
              Question 4 of 5
            </span>
            <QuizProgress current={4} />
          </div>
          <button
            className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
            style={{ color: '#A09BB8', border: '1px solid #EDE9FE' }}
            onClick={() => navigate('/quiz/processing')}
          >
            Skip
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl overflow-hidden"
          style={{ border: '1px solid #EDE9FE', boxShadow: '0 4px 24px rgba(139,92,246,0.08)' }}>

          {/* Card header */}
          <div className="px-7 pt-7 pb-5"
            style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} style={{ color: '#8B5CF6' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8B5CF6' }}>Availability</span>
            </div>
            <h2 className="text-lg font-extrabold mb-1" style={{ color: '#1C1829' }}>
              When are you available to work?
            </h2>
            <p className="text-sm" style={{ color: '#6B6584' }}>
              Tap cells to mark your preferred time slots.
            </p>
          </div>

          <div className="px-7 pb-7 pt-5">
            {/* Availability grid */}
            <div className="overflow-x-auto mb-3">
              <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th className="w-24 pb-3" />
                    {DAYS.map((d) => (
                      <th key={d} className="pb-3 text-center">
                        <span className="text-xs font-bold" style={{ color: '#6B6584' }}>{d}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SLOTS.map((slot, si) => (
                    <tr key={slot}>
                      <td className="pr-2 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{SLOT_ICONS[si]}</span>
                          <span className="text-xs font-semibold" style={{ color: '#6B6584' }}>{slot}</span>
                        </div>
                      </td>
                      {DAYS.map((day) => {
                        const on = avail[slot][day];
                        return (
                          <td key={day} className="py-1.5 text-center">
                            <button
                              onClick={() => toggleCell(slot, day)}
                              className="w-9 h-9 rounded-xl transition-all duration-200 focus:outline-none mx-auto block"
                              style={{
                                background: on ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : 'white',
                                border: on ? '2px solid #8B5CF6' : '1.5px solid #EDE9FE',
                                boxShadow: on ? '0 2px 8px rgba(139,92,246,0.25)' : 'none',
                                transform: on ? 'scale(1.05)' : 'scale(1)',
                              }}
                              aria-label={`${slot} ${day} ${on ? 'selected' : 'not selected'}`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend + count */}
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-4 text-xs" style={{ color: '#6B6584' }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md inline-block"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }} />
                  Preferred
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md inline-block"
                    style={{ border: '1.5px solid #EDE9FE', backgroundColor: 'white' }} />
                  Available
                </span>
              </div>
              {selectedCount > 0 && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                  {selectedCount} slot{selectedCount !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="h-px mb-6" style={{ backgroundColor: '#EDE9FE' }} />

            {/* Task preference */}
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} style={{ color: '#EC4899' }} />
              <h3 className="text-sm font-bold" style={{ color: '#1C1829' }}>
                What kind of tasks do you prefer?
              </h3>
            </div>
            <div className="space-y-2.5 mb-8">
              {TASK_PREFS.map(({ id, label, emoji }) => {
                const on = taskPref === id;
                return (
                  <button
                    key={id}
                    onClick={() => setTaskPref(on ? null : id)}
                    className="w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 focus:outline-none flex items-center gap-3"
                    style={{
                      border: on ? '2px solid #8B5CF6' : '1.5px solid #EDE9FE',
                      backgroundColor: on ? '#F5F3FF' : '#FFFFFF',
                      boxShadow: on ? '0 2px 12px rgba(139,92,246,0.12)' : 'none',
                    }}
                  >
                    <span className="text-lg">{emoji}</span>
                    <span className="text-sm font-medium" style={{ color: on ? '#6D28D9' : '#6B6584' }}>
                      {label}
                    </span>
                    {on && (
                      <span className="ml-auto w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
                        <span className="text-white text-xs">✓</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Nav */}
            <div className="flex justify-between">
              <Button variant="outlined" onClick={() => navigate('/quiz/2')} className="gap-1.5">
                <ArrowLeft size={14} /> Back
              </Button>
              <Button variant="filled" onClick={() => navigate('/quiz/processing')} className="gap-1.5">
                Next <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import QuizProgress from '../components/ui/QuizProgress';
import Button from '../components/ui/Button';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOTS = ['Morning', 'Afternoon', 'Evening'];

const TASK_PREFS = [
  { id: 'early',  label: 'Start early · first draft & setup' },
  { id: 'mid',    label: 'Mid‑stage analysis and writing' },
  { id: 'polish', label: 'Final polish' },
];

export default function QuizQ4() {
  const navigate = useNavigate();

  // availability[slot][day] = true/false
  const [avail, setAvail] = useState(() =>
    Object.fromEntries(SLOTS.map((s) => [s, Object.fromEntries(DAYS.map((d) => [d, false]))]))
  );
  const [taskPref, setTaskPref] = useState(null);

  const toggleCell = (slot, day) =>
    setAvail((prev) => ({
      ...prev,
      [slot]: { ...prev[slot], [day]: !prev[slot][day] },
    }));

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10"
      style={{ backgroundColor: '#F8FAFC' }}>
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold" style={{ color: '#0F172A' }}>
              Question 4 of 5
            </span>
            <QuizProgress current={4} />
          </div>
          <button
            className="text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            style={{ color: '#94A3B8' }}
            onClick={() => navigate('/quiz/processing')}
          >
            Skip
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

          {/* Availability grid */}
          <h2 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>
            When are you available to work?
          </h2>
          <p className="text-sm mb-4" style={{ color: '#475569' }}>
            Tap cells to mark your preferred slots.
          </p>

          <div className="overflow-x-auto mb-2">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="w-24 pb-2" />
                  {DAYS.map((d) => (
                    <th key={d} className="pb-2 font-medium text-center"
                      style={{ color: '#475569' }}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SLOTS.map((slot) => (
                  <tr key={slot}>
                    <td className="pr-3 py-1 text-xs font-medium" style={{ color: '#475569' }}>
                      {slot}
                    </td>
                    {DAYS.map((day) => {
                      const on = avail[slot][day];
                      return (
                        <td key={day} className="py-1 text-center">
                          <button
                            onClick={() => toggleCell(slot, day)}
                            className="w-8 h-8 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 mx-auto block"
                            style={{
                              backgroundColor: on ? '#2563EB' : '#F8FAFC',
                              borderColor: on ? '#2563EB' : '#E2E8F0',
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

          {/* Legend */}
          <div className="flex items-center gap-4 mb-7 text-xs" style={{ color: '#475569' }}>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: '#2563EB' }} />
              Preferred
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block border-2" style={{ borderColor: '#E2E8F0' }} />
              Available
            </span>
          </div>

          {/* Task preference */}
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#0F172A' }}>
            What kind of tasks do you prefer?
          </h3>
          <div className="flex flex-wrap gap-2 mb-8">
            {TASK_PREFS.map(({ id, label }) => {
              const on = taskPref === id;
              return (
                <button
                  key={id}
                  onClick={() => setTaskPref(on ? null : id)}
                  className="px-3.5 py-2 rounded-full text-sm font-medium border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={{
                    borderColor: on ? '#2563EB' : '#E2E8F0',
                    backgroundColor: on ? '#EFF6FF' : '#FFFFFF',
                    color: on ? '#1D4ED8' : '#475569',
                  }}
                >
                  {label}
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
  );
}

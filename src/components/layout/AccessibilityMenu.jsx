import React, { useEffect, useRef, useState } from 'react';
import { Check, SlidersHorizontal } from 'lucide-react';
import useTheme from '../../hooks/useTheme';

const paletteOptions = [
  {
    value: 'default',
    label: 'Default palette',
    description: 'Keep the original Groupify colors.',
  },
  {
    value: 'accessible',
    label: 'Colorblind-friendly',
    description: 'Use clearer blue, amber, and teal accents.',
  },
];

function ToggleRow({ label, description, checked, onToggle }) {
  return (
    <button
      type="button"
      className="accessibility-toggle"
      onClick={onToggle}
      aria-pressed={checked}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{label}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--c-text-2)' }}>{description}</p>
      </div>
      <span className="accessibility-switch" data-checked={checked}>
        <span className="accessibility-switch-thumb" />
      </span>
    </button>
  );
}

export default function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const {
    colorMode,
    setColorMode,
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion,
  } = useTheme();

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className="topbar-control flex items-center justify-center rounded-xl transition-all"
        aria-label="Accessibility options"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Accessibility options"
      >
        <SlidersHorizontal size={17} strokeWidth={2.1} />
      </button>

      {open && (
        <div
          className="accessibility-menu absolute right-0 top-[calc(100%+0.55rem)] w-72 rounded-2xl p-3 z-[70]"
          role="dialog"
          aria-label="Accessibility options"
        >
          <div className="pb-2 mb-2" style={{ borderBottom: '1px solid var(--c-border)' }}>
            <p className="text-sm font-extrabold" style={{ color: 'var(--c-text)' }}>Accessibility</p>
            <p className="text-xs mt-1" style={{ color: 'var(--c-text-2)' }}>
              Adjust color and motion preferences for this browser.
            </p>
          </div>

          <div className="mb-3">
            <p className="accessibility-section-title">Color palette</p>
            <div className="space-y-1.5 mt-2">
              {paletteOptions.map((option) => {
                const active = colorMode === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className="accessibility-option"
                    onClick={() => setColorMode(option.value)}
                    aria-pressed={active}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{option.label}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--c-text-2)' }}>{option.description}</p>
                    </div>
                    <span className="accessibility-check" data-active={active}>
                      {active && <Check size={14} strokeWidth={2.7} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="accessibility-section-title">Accessibility</p>
            <div className="space-y-1.5 mt-2">
              <ToggleRow
                label="High contrast"
                description="Boost text clarity, borders, and active states."
                checked={highContrast}
                onToggle={toggleHighContrast}
              />
              <ToggleRow
                label="Reduce motion"
                description="Minimize animations and transitions."
                checked={reducedMotion}
                onToggle={toggleReducedMotion}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

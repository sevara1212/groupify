import React from 'react';
import AccessibilityMenu from './AccessibilityMenu';
import ThemeToggle from './ThemeToggle';

export default function AppearanceControls({ className = '' }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`.trim()}>
      <ThemeToggle />
      <AccessibilityMenu />
    </div>
  );
}

import React, { createContext, useContext, useState } from 'react';

const ProjectContext = createContext(null);

/** Shared across tabs — everyone on the same team project. */
function persistProject(key, val) {
  try {
    if (val == null) localStorage.removeItem(key);
    else localStorage.setItem(key, val);
  } catch {}
}

/**
 * Per-tab only — so two people testing in two windows of the same browser
 * don't overwrite each other's member id (localStorage is shared; sessionStorage is not).
 */
function persistMember(key, val) {
  try {
    if (val == null) {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, val);
      localStorage.removeItem(key);
    }
  } catch {}
}

function readMemberField(key) {
  try {
    const fromSession = sessionStorage.getItem(key);
    if (fromSession) return fromSession;
    const legacy = localStorage.getItem(key);
    if (legacy) {
      sessionStorage.setItem(key, legacy);
      localStorage.removeItem(key);
      return legacy;
    }
  } catch {}
  return null;
}

export function ProjectProvider({ children }) {
  const [projectId, _setProjectId] = useState(() => {
    try { return localStorage.getItem('groupify_projectId') || null; } catch { return null; }
  });
  const [currentMemberId, _setCurrentMemberId] = useState(() => readMemberField('groupify_memberId'));
  const [currentMemberName, _setCurrentMemberName] = useState(() => readMemberField('groupify_memberName'));

  const setProjectId = (v) => { persistProject('groupify_projectId', v); _setProjectId(v); };
  const setCurrentMemberId = (v) => { persistMember('groupify_memberId', v); _setCurrentMemberId(v); };
  const setCurrentMemberName = (v) => { persistMember('groupify_memberName', v); _setCurrentMemberName(v); };

  return (
    <ProjectContext.Provider
      value={{ projectId, setProjectId, currentMemberId, setCurrentMemberId, currentMemberName, setCurrentMemberName }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}

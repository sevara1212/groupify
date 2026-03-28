import React, { createContext, useContext, useState, useCallback } from 'react';

const ProjectContext = createContext(null);

const LS_PROJECT = 'groupify_projectId';
const LS_MEMBER_ID = 'groupify_memberId';
const LS_MEMBER_NAME = 'groupify_memberName';

/** Shared across tabs — everyone on the same team project. */
function persistProject(key, val) {
  try {
    if (val == null) localStorage.removeItem(key);
    else localStorage.setItem(key, val);
  } catch {}
}

/**
 * Member id/name: persist in localStorage so new tabs, redeploys, and normal refreshes
 * keep you on the same team. (Session-only storage was losing data on new tabs.)
 * We also mirror to sessionStorage for any legacy reads.
 */
function persistMember(key, val) {
  try {
    if (val == null) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } else {
      localStorage.setItem(key, val);
      sessionStorage.setItem(key, val);
    }
  } catch {}
}

function readMemberField(key) {
  try {
    let v = localStorage.getItem(key);
    if (v) return v;
    v = sessionStorage.getItem(key);
    if (v) {
      localStorage.setItem(key, v);
      return v;
    }
  } catch {}
  return null;
}

function clearAllGroupifyStorage() {
  const keys = [LS_PROJECT, LS_MEMBER_ID, LS_MEMBER_NAME];
  keys.forEach((k) => {
    try {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    } catch {}
  });
  try {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('groupify_')) localStorage.removeItem(k);
    });
    Object.keys(sessionStorage).forEach((k) => {
      if (k.startsWith('groupify_')) sessionStorage.removeItem(k);
    });
  } catch {}
}

export function ProjectProvider({ children }) {
  const [projectId, _setProjectId] = useState(() => {
    try { return localStorage.getItem(LS_PROJECT) || null; } catch { return null; }
  });
  const [currentMemberId, _setCurrentMemberId] = useState(() => readMemberField(LS_MEMBER_ID));
  const [currentMemberName, _setCurrentMemberName] = useState(() => readMemberField(LS_MEMBER_NAME));

  const setProjectId = (v) => { persistProject(LS_PROJECT, v); _setProjectId(v); };
  const setCurrentMemberId = (v) => { persistMember(LS_MEMBER_ID, v); _setCurrentMemberId(v); };
  const setCurrentMemberName = (v) => { persistMember(LS_MEMBER_NAME, v); _setCurrentMemberName(v); };

  const clearLocalProjectData = useCallback(() => {
    clearAllGroupifyStorage();
    _setProjectId(null);
    _setCurrentMemberId(null);
    _setCurrentMemberName(null);
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projectId,
        setProjectId,
        currentMemberId,
        setCurrentMemberId,
        currentMemberName,
        setCurrentMemberName,
        clearLocalProjectData,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}

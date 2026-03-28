import React, { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext(null);

function persist(key, val) {
  try {
    if (val == null) localStorage.removeItem(key);
    else localStorage.setItem(key, val);
  } catch {}
}

export function ProjectProvider({ children }) {
  const [projectId, _setProjectId] = useState(() => {
    try { return localStorage.getItem('groupify_projectId') || null; } catch { return null; }
  });
  const [currentMemberId, _setCurrentMemberId] = useState(() => {
    try { return localStorage.getItem('groupify_memberId') || null; } catch { return null; }
  });
  const [currentMemberName, _setCurrentMemberName] = useState(() => {
    try { return localStorage.getItem('groupify_memberName') || null; } catch { return null; }
  });

  const setProjectId = (v) => { persist('groupify_projectId', v); _setProjectId(v); };
  const setCurrentMemberId = (v) => { persist('groupify_memberId', v); _setCurrentMemberId(v); };
  const setCurrentMemberName = (v) => { persist('groupify_memberName', v); _setCurrentMemberName(v); };

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

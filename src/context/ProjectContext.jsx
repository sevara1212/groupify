import React, { createContext, useContext, useState } from 'react';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projectId, setProjectId] = useState(null);
  const [currentMemberId, setCurrentMemberId] = useState(null);
  const [currentMemberName, setCurrentMemberName] = useState(null);

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

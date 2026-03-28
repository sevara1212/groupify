import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import TopNav from './components/layout/TopNav';

import Landing from './screens/Landing';
import Allocation from './screens/Allocation';
import Dashboard from './screens/Dashboard';
import RiskAlerts from './screens/RiskAlerts';
import Rebalance from './screens/Rebalance';
import CreateProject from './screens/CreateProject';
import UploadFiles from './screens/UploadFiles';
import InviteTeam from './screens/InviteTeam';
import QuizIntro from './screens/QuizIntro';
import QuizQuestion from './screens/QuizQuestion';
import QuizProcessing from './screens/QuizProcessing';

import Splash from './pages/01_Splash';
import Onboarding from './pages/02_Onboarding';
import CreateGroup from './pages/03_CreateGroup';
import JoinGroup from './pages/04_JoinGroup';
import GroupSetup from './pages/05_GroupSetup';
import AssignRoles from './pages/06_AssignRoles';
import SetDeadlines from './pages/07_SetDeadlines';
import ReviewPlan from './pages/08_ReviewPlan';
import InviteMembers from './pages/09_InviteMembers';
import WaitingRoom from './pages/10_WaitingRoom';
// Dashboard now uses live screen (imported above)
import Tasks from './pages/12_Tasks';
import Rubric from './pages/13_Rubric';
import Messages from './pages/14_Messages';
import Profile from './pages/15_Profile';

// Routes that show the persistent TopNav (screens 11–15)
const NAV_ROUTES = ['/dashboard', '/tasks', '/rubric', '/messages', '/profile', '/risk-alerts', '/rebalance'];

function Layout() {
  const location = useLocation();
  const showNav = NAV_ROUTES.some((r) => location.pathname.startsWith(r));

  return (
    <>
      {showNav && <TopNav />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/create" element={<CreateProject />} />
        <Route path="/upload" element={<UploadFiles />} />
        <Route path="/invite" element={<InviteTeam />} />
        <Route path="/quiz" element={<QuizIntro />} />
        <Route path="/quiz/questions" element={<QuizQuestion />} />
        <Route path="/quiz/processing" element={<QuizProcessing />} />
        <Route path="/allocation" element={<Allocation />} />
        <Route path="/risk-alerts" element={<RiskAlerts />} />
        <Route path="/rebalance" element={<Rebalance />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/join-group" element={<JoinGroup />} />
        <Route path="/group-setup" element={<GroupSetup />} />
        <Route path="/assign-roles" element={<AssignRoles />} />
        <Route path="/set-deadlines" element={<SetDeadlines />} />
        <Route path="/review-plan" element={<ReviewPlan />} />
        <Route path="/invite-members" element={<InviteMembers />} />
        <Route path="/waiting-room" element={<WaitingRoom />} />
        <Route path="/dashboard" element={<Dashboard />} />  {/* live screen */}
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/rubric" element={<Rubric />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LogPage from "./pages/LogPage";
import RecommendationsPage from "./pages/RecommendationsPage"; 
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import OnboardingPage from "./pages/OnboardingPage" 
import CommunityPage from "./pages/CommunityPage";
import LoadingPage from "./pages/LoadingPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuth } from "./context/AuthContext";
import ComparisonPage from "./pages/ComparisonPage";
import BingeBuddiesPage from "./pages/BingeBuddiesPage";
import MessagesPage from "./pages/MessagesPage";
import { NotificationProvider } from "./context/NotificationContext";

// Wrapper protecting main layout features
function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, hasCompletedOnboarding } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isNewUserFlag = sessionStorage.getItem('isNewUser') === 'true';

  if (!hasCompletedOnboarding && isNewUserFlag) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

// Wrapper protecting Onboarding Page (prevents completed users from going backward)
function RequireNewUser({ children }: { children: ReactNode }) {
  const { user, loading, hasCompletedOnboarding } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (hasCompletedOnboarding) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/profile"    element={<ProfilePage />} />
      
        
        <Route 
          path="/onboarding" 
          element={
            <RequireNewUser>
              <OnboardingPage />
            </RequireNewUser>
          } 
        />

        <Route
          path="/home"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/log"
          element={
            <RequireAuth>
              <LogPage />
            </RequireAuth>
          }
        />

        <Route
          path="/recommendations"
          element={
            <RequireAuth>
              <RecommendationsPage />
            </RequireAuth>
          }
        />

        <Route
          path="/comparison"
          element={
            <RequireAuth>
              <ComparisonPage />
            </RequireAuth>
          }
        />

        <Route
          path="/social-connection-hub"
          element={
            <RequireAuth>
              <BingeBuddiesPage />
            </RequireAuth>
          }
        />

        <Route
          path="/messages"
          element={
            <RequireAuth>
              <MessagesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/messages/:otherUid"
          element={
            <RequireAuth>
              <MessagesPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.js";
import Home from "./components/Home.js";
import About from "./components/About.js";
import Objective from "./components/Objectives.js";
import Team from "./components/Team.js";
import Framework from "./components/Framework.js";
import Events from "./components/Events.js";
import FAQ from "./components/FAQ.js";
import Contact from "./components/Contact.js";
import Footer from "./components/Footer.js";
import TBI from "./components/TBI.js";
import InTTOTBI from "./components/InTTOTBI.js";
import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ProgramsPage from "./pages/ProgramsPage.js";
import EventsPage from './pages/EventsPage';
import Ecosystem from "./pages/Ecosystem";
import AdminDashboard from "./components/AdminDashboard.js";
import UserProfile from "./components/UserProfile";
import Messages from './pages/Messages';
import EntrepreneurDashboard from "./pages/EntrepreneurDashboard";
import CreateStartup from './pages/CreateStartup';
import InvestorDashboard from './pages/InvestorDashboard';
import EditStartup from './pages/EditStartup';
import StartupDetails from './pages/StartupDetails';
import VerifyAccount from './pages/VerifyAccount';
import Settings from './pages/Settings';
import ProtectedRoute from "./components/ProtectedRoute";
import Notifications from './pages/Notifications';
import Matches from './pages/Matches';
import AuthCallback from './pages/AuthCallback';
import ResetPassword from './pages/ResetPassword';

function MainPage() {
  const location = useLocation();

  // Handle hash navigation on home page
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      // Wait for page to render, then scroll
      const attemptScroll = (attempts = 0) => {
        const el = document.getElementById(hash);
        if (el) {
          const yOffset = -100;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else if (attempts < 10) {
          // Retry if element not found yet (page still loading)
          setTimeout(() => attemptScroll(attempts + 1), 100);
        }
      };
      
      setTimeout(() => {
        attemptScroll();
      }, 300);
    }
  }, [location.hash, location.pathname]);

  return (
    <>
      <Navbar />
      <Home />
      <About />
      <Objective />
      <Team />
      <FAQ />
      <Contact />
      <Footer />
    </>
  );
}

function App() {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/Tbi" element={<TBI />} />
        <Route path="/Tbi/InTTO" element={<InTTOTBI />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/ecosystem" element={<Ecosystem />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/entrepreneur-dashboard" element={<ProtectedRoute allowedRoles={['entrepreneur']}><EntrepreneurDashboard /></ProtectedRoute>} />
        <Route path="/create-startup" element={<ProtectedRoute allowedRoles={['entrepreneur', 'admin']}><CreateStartup /></ProtectedRoute>} />
        <Route path="/investor-dashboard" element={<ProtectedRoute allowedRoles={['investor']}><InvestorDashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<Navigate to="/entrepreneur-dashboard" />} />
        <Route path="/startup/:id" element={<ProtectedRoute><StartupDetails /></ProtectedRoute>} />
        <Route path="/edit-startup/:id" element={<ProtectedRoute allowedRoles={['entrepreneur', 'admin']}><EditStartup /></ProtectedRoute>} />
        <Route path="/verify-account" element={<ProtectedRoute><VerifyAccount /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

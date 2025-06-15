import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

function MainPage() {
  return (
    <>
      <Navbar />
      <Home />
      <About />
      <Objective />
      <Team />
      <Events />
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
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/entrepreneur-dashboard" element={<EntrepreneurDashboard />} />
        <Route path="/create-startup" element={<CreateStartup />} />
        <Route path="/investor-dashboard" element={<InvestorDashboard />} />
        <Route path="/dashboard" element={<Navigate to="/entrepreneur-dashboard" />} />
        <Route path="/startup/:id" element={<StartupDetails />} />
        <Route path="/edit-startup/:id" element={<EditStartup />} />
        <Route path="/verify-account" element={<VerifyAccount />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

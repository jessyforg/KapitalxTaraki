import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.js";
import Home from "./components/Home.js";
import About from "./components/About.js";
import Objective from "./components/Objectives.js";
import Team from "./components/Team.js";
import Program from "./components/Program.js";
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
import EventsPage from './pages/EventsPage';
import Ecosystem from "./pages/Ecosystem";
import AdminDashboard from "./components/AdminDashboard.js";
import UserProfile from "./components/UserProfile";
import Messages from './pages/Messages';

function MainPage() {
  return (
    <>
      <Navbar />
      <Home />
      <About />
      <Objective />
      <Team />
      <Program />
      <Framework />
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
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

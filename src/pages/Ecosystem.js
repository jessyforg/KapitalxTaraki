import React from "react";
import Navbar from "../components/Navbar";
import TBI from "../components/TBI";
import InTTOTBI from "../components/InTTOTBI";
import Framework from "../components/Framework";
import Footer from "../components/Footer";

function Ecosystem() {
  return (
    <div className="font-montserrat">
      <Navbar />
      {/* TBI Section */}
      <section id="tbi">
        <TBI />
      </section>
      {/* Mentors Section */}
      <section id="mentors">
        <InTTOTBI />
      </section>
      {/* Framework Section */}
      <section id="framework">
        <Framework />
        <Footer /> {/* Footer is now only after Framework, inside the section */}
      </section>
    </div>
  );
}

export default Ecosystem;
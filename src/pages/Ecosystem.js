import React from "react";
import Navbar from "../components/Navbar";
import TBI from "../components/TBI";
import InTTOTBI from "../components/InTTOTBI";
import Framework from "../components/Framework";

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
      </section>
    </div>
  );
}

export default Ecosystem;
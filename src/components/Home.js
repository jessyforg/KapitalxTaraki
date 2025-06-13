import React, { useEffect } from "react";
import tarakiLogo from "./imgs/TARAKI 10X WHITE.png";
import video from "../components/imgs/taraki-home-video.webm";

function Home() {
  useEffect(() => {
    document.title = "Welcome to TARAKI";
  }, []);

  return (
    <div className="font-montserrat overflow-x-hidden min-h-screen w-full flex flex-col items-center justify-center bg-trkblack">
      <section id="home" className="relative flex flex-col items-center justify-center w-full h-screen">
        {/* Video background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          loading="lazy"
          style={{ minHeight: '100vh', minWidth: '100vw' }}
        >
          <source src={video} type="video/webm" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 z-10"></div>
        <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
          <img
            src={tarakiLogo}
            alt="TARAKI LOGO"
            className="w-[60rem] tablet:w-[60rem] laptop-s:w-[60rem] desktop-m:w-[60rem] mx-auto"
            style={{ filter: "invert(0)" }}
          />
        </div>
      </section>
    </div>
  );
}

export default Home;

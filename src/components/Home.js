import React, { useEffect } from "react";
import tarakiLogo from "./imgs/TARAKI 10X WHITE.png";
import video from "../components/imgs/taraki-home-video.webm";

function Home() {
  useEffect(() => {
    document.title = "Welcome to TARAKI";
  }, []);

  return (
    <div className="font-montserrat overflow-x-hidden pt-12 min-h-[60vh] flex flex-col items-center justify-center bg-trkblack">
      <section id="home" className="relative flex flex-col items-center justify-center w-full h-[60vh] tablet:h-[70vh] laptop-s:h-[80vh] desktop-m:h-[90vh]">
        {/* Video background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          loading="lazy"
        >
          <source src={video} type="video/webm" />
          Your browser does not support the video tag.
        </video>
        {/* Overlay for dark effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-80 z-10"></div>
        {/* Centered logo and subtitle */}
        <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
          <img
            src={tarakiLogo}
            alt="TARAKI LOGO"
            className="w-[28rem] tablet:w-[32rem] laptop-s:w-[36rem] desktop-m:w-[40rem] mx-auto"
            style={{ filter: "invert(0)" }}
          />
        </div>
      </section>
    </div>
  );
}

export default Home;

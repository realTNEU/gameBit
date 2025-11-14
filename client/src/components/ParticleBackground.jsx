import React from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const particleOptions = {
  background: {
    color: {
      value: "#f0f4ff",
    },
  },
  fpsLimit: 60,
  particles: {
    number: {
      value: 30,
      density: { enable: true, area: 800 },
    },
    color: { value: "#6366f1" },
    links: { enable: false },
    move: {
      direction: "none",
      enable: true,
      outMode: "bounce",
      speed: 1.5,
    },
    opacity: { value: 0.7 },
    shape: {
      type: "image",
      image: {
        src: "https://img.icons8.com/color/48/000000/xbox-controller.png",
        width: 32,
        height: 32,
      },
    },
    size: { value: 24, random: true },
  },
  detectRetina: true,
};

function ParticleBackground() {
  // This function initializes the tsParticles instance and loads the full package with shapes, presets, etc.
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  // Optional callback after particles are loaded
  const particlesLoaded = (container) => {
    console.log("Particles loaded", container);
  };

  return (
    <Particles
      id="tsparticles"
      className="absolute top-0 left-0 w-full h-full -z-10"
      init={particlesInit}
      loaded={particlesLoaded}
      options={particleOptions}
    />
  );
}

export default ParticleBackground;

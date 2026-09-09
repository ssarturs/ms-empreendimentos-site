"use client";

import { useEffect, useState } from "react";
import { Icon } from "./site-header";

export default function InteriorTour({ slides, compact = false }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => setActiveIndex(0), [slides]);

  const activeSlide = slides[activeIndex];

  function move(offset) {
    setActiveIndex((current) => (current + offset + slides.length) % slides.length);
  }

  return (
    <div className={compact ? "interiorTour compact" : "interiorTour"} aria-roledescription="carrossel" aria-label="Tour pelos ambientes">
      <img
        key={activeSlide.src}
        src={activeSlide.src}
        alt={activeSlide.alt}
        width="1280"
        height="720"
        loading="lazy"
        decoding="async"
      />
      <div className="interiorTourShade" aria-hidden="true" />
      <div className="interiorTourLabel" aria-live="polite">
        <small>AMBIENTE {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</small>
        <strong>{activeSlide.label}</strong>
      </div>
      <div className="interiorTourControls">
        <button type="button" onClick={() => move(-1)} aria-label="Ver ambiente anterior">
          <Icon name="arrow" size={18} />
        </button>
        <div className="interiorTourDots" aria-hidden="true">
          {slides.map((slide, index) => <span className={index === activeIndex ? "active" : ""} key={slide.src} />)}
        </div>
        <button type="button" onClick={() => move(1)} aria-label="Ver próximo ambiente">
          <Icon name="arrow" size={18} />
        </button>
      </div>
    </div>
  );
}

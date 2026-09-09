"use client";

import { useEffect, useRef, useState } from "react";

const MIN_SCALE = 1;
const MAX_SCALE = 3.4;

const hotspots = [
  {
    id: "acesso",
    label: "Acesso e jardim",
    description: "Recuo frontal com vaga, jardim linear e entrada protegida.",
    x: 78,
    y: 62,
  },
  {
    id: "sala",
    label: "Sala integrada",
    description: "Estar e jantar compartilham um ambiente contínuo e iluminado.",
    x: 59,
    y: 65,
  },
  {
    id: "cozinha",
    label: "Cozinha",
    description: "Bancadas paralelas organizam preparo, armazenamento e refeições rápidas.",
    x: 61,
    y: 39,
  },
  {
    id: "suite",
    label: "Suíte",
    description: "Dormitório principal reservado, com banheiro de uso exclusivo.",
    x: 42,
    y: 31,
  },
  {
    id: "quarto",
    label: "Segundo dormitório",
    description: "Ambiente versátil para descanso, hóspedes ou rotina de estudos.",
    x: 31,
    y: 58,
  },
  {
    id: "gourmet",
    label: "Área gourmet",
    description: "Apoio ao quintal para receber, cozinhar e aproveitar a área externa.",
    x: 23,
    y: 27,
  },
  {
    id: "quintal",
    label: "Quintal",
    description: "Área aberta no fundo do lote com espaço para convivência e paisagismo.",
    x: 13,
    y: 31,
  },
];

export default function InteractivePlanImage() {
  const viewportRef = useRef(null);
  const dragRef = useRef(null);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [activeId, setActiveId] = useState("sala");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const active = hotspots.find((hotspot) => hotspot.id === activeId) ?? hotspots[0];

  function resetView() {
    setTransform({ scale: 1, x: 0, y: 0 });
  }

  function clampTranslation(scale, x, y) {
    const viewport = viewportRef.current;
    if (!viewport || scale <= MIN_SCALE) return { x: 0, y: 0 };
    const maxX = (viewport.clientWidth * (scale - 1)) / 2;
    const maxY = (viewport.clientHeight * (scale - 1)) / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  }

  function zoom(multiplier) {
    setTransform((current) => {
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, current.scale * multiplier));
      if (scale === MIN_SCALE) return { scale, x: 0, y: 0 };
      return { scale, ...clampTranslation(scale, current.x, current.y) };
    });
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    const onWheel = (event) => {
      event.preventDefault();
      zoom(event.deltaY < 0 ? 1.12 : 0.89);
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === viewportRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  function startDrag(event) {
    if (event.button !== undefined && event.button !== 0) return;
    if (dragRef.current) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: transform.x,
      originY: transform.y,
    };
  }

  function moveDrag(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setTransform((current) => ({
      ...current,
      ...clampTranslation(
        current.scale,
        drag.originX + event.clientX - drag.startX,
        drag.originY + event.clientY - drag.startY,
      ),
    }));
  }

  function stopDrag(event) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    dragRef.current = null;
  }

  async function toggleFullscreen() {
    const viewport = viewportRef.current;
    if (!viewport) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await viewport.requestFullscreen();
    } catch {
      // The remaining controls keep the experience usable when fullscreen is unavailable.
    }
  }

  return (
    <div className="imagePlanInteractive">
      <div
        className={isFullscreen ? "imagePlanViewport fullscreen" : "imagePlanViewport"}
        ref={viewportRef}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onDoubleClick={resetView}
        aria-label="Planta 3D interativa da Residência Lamarão"
      >
        <div
          className="imagePlanCanvas"
          style={{
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
            "--plan-scale": transform.scale,
            "--hotspot-scale": 1 / transform.scale,
          }}
        >
          <img
            src="/projetos/francenilson-aracaju-planta-3d.webp"
            alt="Planta humanizada 3D da residência térrea no Lamarão, com acesso frontal, ambientes integrados, dois dormitórios e quintal"
            width="1672"
            height="941"
            draggable="false"
          />
          {hotspots.map((hotspot, index) => (
            <button
              type="button"
              key={hotspot.id}
              className={activeId === hotspot.id ? "planHotspot active" : "planHotspot"}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              aria-label={`Ver ${hotspot.label}`}
              aria-pressed={activeId === hotspot.id}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => setActiveId(hotspot.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
            </button>
          ))}
        </div>

        <div className="planHotspotCard" aria-live="polite">
          <small>AMBIENTE SELECIONADO</small>
          <strong>{active.label}</strong>
          <p>{active.description}</p>
        </div>

        <div className="imagePlanToolbar" role="group" aria-label="Controles da planta interativa">
          <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => zoom(1.25)} aria-label="Aproximar">+</button>
          <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => zoom(0.8)} aria-label="Afastar">−</button>
          <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={resetView}>Centralizar</button>
          <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={toggleFullscreen}>{isFullscreen ? "Sair da tela cheia" : "Tela cheia"}</button>
        </div>
      </div>
      <p className="planGestureHint">Arraste para mover · Use a roda do mouse ou os botões para ampliar · Selecione os pontos da planta</p>
    </div>
  );
}

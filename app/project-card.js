"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Icon } from "./site-header";

const LEADS_ENDPOINT = "https://msleads-worker.arturzinzito.workers.dev";

const TurntablePlanViewer = dynamic(() => import("./turntable-plan-viewer"), {
  ssr: false,
  loading: () => <div className="projectViewerLoading" role="status">Preparando a maquete 3D…</div>,
});

const InteriorTour = dynamic(() => import("./interior-tour"), {
  ssr: false,
  loading: () => <div className="projectViewerLoading" role="status">Preparando o tour…</div>,
});

function MediaIcon({ interactive }) {
  return <Icon name={interactive ? "cube" : "image"} size={17} />;
}

export default function ProjectCard({ project, whatsappHref }) {
  const [activeMediaId, setActiveMediaId] = useState(project.media?.[0]?.id);

  if (project.teaser) {
    return (
      <article className="projectCard projectTeaser" aria-labelledby={`${project.id}-title`}>
        <div className="teaserBlueprint" aria-hidden="true" />
        <div className="teaserContent">
          <div className="projectCardKicker">
            <span>{project.number}</span>
            <span>PRÓXIMO LANÇAMENTO</span>
          </div>
          <div className="projectBadges">
            {project.badges.map((badge) => <span key={badge}>{badge}</span>)}
          </div>
          <div className="teaserCopy">
            <span className="teaserMonogram" aria-hidden="true">MS</span>
            <h3 id={`${project.id}-title`}>{project.title}</h3>
            <p>{project.description}</p>
          </div>
          <a className="projectCta teaserCta" href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <Icon name="whatsapp" size={20} />
            Quero receber o spoiler em primeira mão
            <Icon name="arrow" size={18} />
          </a>
        </div>
      </article>
    );
  }

  const activeMedia = project.media.find((media) => media.id === activeMediaId) || project.media[0];
  const panelId = `${project.id}-media-panel`;

  function selectByOffset(offset) {
    const currentIndex = project.media.findIndex((media) => media.id === activeMedia.id);
    const nextIndex = (currentIndex + offset + project.media.length) % project.media.length;
    setActiveMediaId(project.media[nextIndex].id);
  }

  function handleTabKeyDown(event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    selectByOffset(event.key === "ArrowRight" ? 1 : -1);
  }

  function trackProjectLead() {
    fetch(LEADS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tabela: "clientes",
        nome: null,
        origem: "site-projeto",
        servico_interesse: project.title,
        observacoes: "Clicou em 'Falar sobre este projeto'",
      }),
    }).catch(() => {});
  }

  return (
    <article className="projectCard" aria-labelledby={`${project.id}-title`}>
      <header className="projectCardHeader">
        <div className="projectCardKicker">
          <span>{project.number}</span>
          <span>{project.location}</span>
        </div>
        <h3 id={`${project.id}-title`}>{project.title}</h3>
        <p>{project.description}</p>
        <div className="projectBadges" aria-label="Categorias do projeto">
          {project.badges.map((badge) => <span key={badge}>{badge}</span>)}
        </div>
        <ul className="projectFacts" aria-label="Ficha técnica">
          {project.facts.map((fact) => <li key={fact}>{fact}</li>)}
        </ul>
      </header>

      <div
        className={`projectMediaPanel ${activeMedia.kind === "interactive" ? "isInteractive" : ""}`}
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${project.id}-${activeMedia.id}-tab`}
      >
        {activeMedia.kind === "image" && (
          <img
            key={activeMedia.id}
            className="projectMediaImage"
            src={activeMedia.src}
            alt={activeMedia.alt}
            width={activeMedia.width}
            height={activeMedia.height}
            loading="lazy"
            decoding="async"
          />
        )}

        {activeMedia.kind === "gallery" && <InteriorTour slides={activeMedia.slides} compact />}

        {activeMedia.kind === "interactive" && activeMedia.viewer === "lamarao-360" && (
          <TurntablePlanViewer />
        )}

        {activeMedia.kind === "interactive" && activeMedia.viewer === "cidade-nova-tour" && (
          <InteriorTour slides={activeMedia.slides} />
        )}

        <p className="projectMediaCaption">{activeMedia.caption}</p>
      </div>

      <div className="projectMediaTabs" role="tablist" aria-label={`Galeria de ${project.title}`} onKeyDown={handleTabKeyDown}>
        {project.media.map((media) => {
          const active = media.id === activeMedia.id;
          return (
            <button
              id={`${project.id}-${media.id}-tab`}
              key={media.id}
              type="button"
              role="tab"
              aria-controls={panelId}
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              className={active ? "active" : ""}
              onClick={() => setActiveMediaId(media.id)}
            >
              <MediaIcon interactive={media.kind === "interactive"} />
              {media.label}
            </button>
          );
        })}
      </div>

      <footer className="projectCardFooter">
        <span>Gostou deste projeto?</span>
        <a className="projectCta" href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={trackProjectLead}>
          <Icon name="whatsapp" size={20} />
          Falar sobre este projeto
          <Icon name="arrow" size={18} />
        </a>
      </footer>
    </article>
  );
}

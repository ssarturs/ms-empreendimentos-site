"use client";

import { useEffect, useState } from "react";

export function Icon({ name, size = 22 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    building: <><path d="M4 21V5l8-3 8 3v16"/><path d="M8 9h1m6 0h1M8 13h1m6 0h1M8 17h1m6 0h1"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 10h6m-6 4h6m-6 4h4"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
    hammer: <><path d="m14 5 5 5M12 7l3-3 5 5-3 3M14 10 5 19M4 20l3-1"/></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></>,
    key: <><circle cx="8" cy="15" r="4"/><path d="m11 12 8-8m-3 3 2 2m-5 1 2 2"/></>,
    map: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>,
    ruler: <><path d="m3 17 14-14 4 4L7 21H3v-4Z"/><path d="m14 6 4 4M11 9l2 2M8 12l2 2M5 15l2 2"/></>,
    spark: <><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/><path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/></>,
    whatsapp: <><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.5 9.5 0 0 1-3.8-.9L3 21l1.8-5a8.7 8.7 0 1 1 16.2-4.5Z"/><path d="M8.6 8.2c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .5.4l.8 1.8c.1.3.1.5-.1.7l-.6.8c-.2.2-.3.4-.1.7.4.8 1 1.5 1.7 2 .6.4 1 .6 1.3.3l.9-1.1c.2-.2.4-.3.7-.2l1.8.8c.3.1.5.3.5.5 0 .3-.2 1.3-.7 1.8-.5.6-1.3.8-2 .7-1-.1-2.2-.5-3.8-1.5a12 12 0 0 1-3.1-2.8c-.8-1.1-1.4-2.3-1.3-3.2 0-.6.2-1 .3-1.3Z"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export function Brand() {
  return (
    <a href="/#inicio" className="brand" aria-label="MS Empreendimentos - início">
      <span className="brandLogoViewport">
        <img
          className="brandLogo"
          src="/brand/ms-empreendimentos-logo-light.png"
          alt="MS Empreendimentos"
        />
      </span>
    </a>
  );
}


export function SiteHeader({ isHome = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const close = () => setMenuOpen(false);
    const escape = (event) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("resize", close);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", escape);
    };
  }, []);
  const section = (id) => (isHome ? "#" : "/#") + id;
  return (
    <header className="siteHeader">
      <div className="navShell">
        <Brand />
        <nav id="site-navigation" className={menuOpen ? "navLinks open" : "navLinks"} aria-label="Navegação principal" onClick={() => setMenuOpen(false)}>
          <a href={section("inicio")}>Início</a>
          <a href="/quem-somos" aria-current={isHome ? undefined : "page"}>Quem somos</a>
          <a href={section("servicos")}>Serviços</a>
          <a href={section("projetos")}>Projetos</a>
          <a href={section("plantas-3d")}>Plantas 3D</a>
          <a href={section("contato")}>Localização</a>
          <a href={section("contato")} className="navCta">Falar com a MS <Icon name="arrow" size={18} /></a>
        </nav>
        <button type="button" className="menuButton" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen(!menuOpen)}>
          <Icon name={menuOpen ? "close" : "menu"} />
        </button>
      </div>
    </header>
  );
}

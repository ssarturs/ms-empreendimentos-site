"use client";

import { useEffect, useState } from "react";
import { SiteHeader, Brand, Icon } from "./site-header";
import ProjectCard from "./project-card";
import { motion, useReducedMotion } from "framer-motion";

const WHATSAPP_NUMBER = "557999253884";
const ADDRESS =
  "Avenida Rosemary Vieira de Jesus, 1489, Piabeta, Nossa Senhora do Socorro - SE";

const services = [
  {
    id: "projetos",
    number: "01",
    title: "Projetos residenciais",
    short: "Ideias bem planejadas para construir com mais segurança.",
    detail:
      "Transformamos necessidades em um plano claro, funcional e alinhado ao seu terreno, estilo e prioridades.",
    icon: "ruler",
  },
  {
    id: "construcao",
    number: "02",
    title: "Construção de imóveis",
    short: "Acompanhamento cuidadoso em cada etapa da obra.",
    detail:
      "Da organização inicial à execução, conduzimos a obra com planejamento, comunicação e atenção aos detalhes.",
    icon: "building",
  },
  {
    id: "reformas",
    number: "03",
    title: "Reformas e ampliações",
    short: "Novos usos e mais valor para espaços existentes.",
    detail:
      "Reorganizamos, ampliamos e renovamos ambientes para acompanhar seus novos planos e necessidades.",
    icon: "hammer",
  },
  {
    id: "administracao",
    number: "04",
    title: "Administração de obras",
    short: "Coordenação para você acompanhar tudo com clareza.",
    detail:
      "Apoiamos o controle das etapas, das equipes e das decisões para manter a execução organizada.",
    icon: "clipboard",
  },
  {
    id: "imobiliario",
    number: "05",
    title: "Soluções imobiliárias",
    short: "Apoio para encontrar oportunidades e tomar decisões.",
    detail:
      "Atendimento próximo para quem procura um imóvel ou precisa avaliar caminhos para seu patrimônio.",
    icon: "key",
  },
  {
    id: "personalizadas",
    number: "06",
    title: "Soluções personalizadas",
    short: "Um atendimento pensado para a realidade de cada cliente.",
    detail:
      "Analisamos sua necessidade e indicamos o melhor caminho, reunindo construção, gestão e serviços sob medida.",
    icon: "spark",
  },
];

const portfolioProjects = [
  {
    id: "residencia-lamarao",
    number: "01",
    title: "Projeto Lamarão, Aracaju/SE",
    description: "Arquitetura contemporânea e ambientes conectados para uma rotina prática, confortável e acolhedora.",
    badges: ["PROJETO 3D & CONSTRUÇÃO", "RESIDENCIAL"],
    facts: ["168,16 m² de terreno", "83,59 m² construídos", "2 quartos"],
    whatsappMessage: "Olá! Gostaria de saber mais sobre o Projeto Residência Lamarão.",
    media: [
      {
        id: "fachada",
        label: "Fachada",
        kind: "image",
        src: "/projetos/casa-lamarao-fachada.jpg",
        alt: "Fachada contemporânea da Residência Lamarão",
        width: 1280,
        height: 720,
        caption: "Fachada contemporânea com linhas marcantes e composição arquitetônica atual.",
      },
      {
        id: "gourmet",
        label: "Área gourmet",
        kind: "image",
        src: "/projetos/casa-lamarao-area-externa.jpg",
        alt: "Área externa gourmet da Residência Lamarão",
        width: 1600,
        height: 900,
        caption: "Área externa integrada, pensada para convivência, conforto e uso cotidiano.",
      },
      {
        id: "planta-3d",
        label: "Planta 3D",
        kind: "interactive",
        viewer: "planta-03",
        caption: "Planta 03: gire a maquete aproximada, selecione os ambientes ou explore a imagem fotorrealista.",
      },
    ],
  },
  {
    id: "projeto-cidade-nova",
    number: "02",
    title: "Projeto Cidade Nova, Aracaju/SE",
    description: "Interiores integrados com marcenaria planejada, iluminação acolhedora e aproveitamento inteligente de cada ambiente.",
    badges: ["PROJETO 3D", "INTERIORES"],
    facts: ["Estar e jantar integrados", "Cozinha planejada", "Quartos e banheiros"],
    whatsappMessage: "Olá! Gostaria de saber mais sobre o Projeto Cidade Nova.",
    media: [
      {
        id: "sala",
        label: "Sala",
        kind: "image",
        src: "/projetos/cidade-nova-sala-estar.jpg",
        alt: "Projeto 3D da sala de estar integrada da residência Cidade Nova",
        width: 1280,
        height: 720,
        caption: "Sala de estar e jantar integradas, com circulação fluida e leitura visual contínua.",
      },
      {
        id: "cozinha",
        label: "Cozinha",
        kind: "image",
        src: "/projetos/cidade-nova-cozinha.jpg",
        alt: "Projeto 3D da cozinha planejada da residência Cidade Nova",
        width: 1280,
        height: 720,
        caption: "Marcenaria amadeirada, bancada escura e iluminação linear valorizam a cozinha.",
      },
      {
        id: "quarto",
        label: "Quarto",
        kind: "image",
        src: "/projetos/cidade-nova-quarto-escritorio.jpg",
        alt: "Projeto 3D do quarto com espaço de trabalho da residência Cidade Nova",
        width: 1280,
        height: 720,
        caption: "Quarto e escritório compartilham uma marcenaria funcional feita sob medida.",
      },
      {
        id: "banheiros",
        label: "Banheiros",
        kind: "gallery",
        caption: "Duas propostas com revestimentos claros, contraste e iluminação bem distribuída.",
        slides: [
          { src: "/projetos/cidade-nova-banheiro-suite.jpg", alt: "Projeto 3D do banheiro da suíte da residência Cidade Nova", label: "Banheiro da suíte" },
          { src: "/projetos/cidade-nova-banheiro-social.jpg", alt: "Projeto 3D do banheiro social da residência Cidade Nova", label: "Banheiro social" },
        ],
      },
      {
        id: "interiores",
        label: "Interiores",
        kind: "gallery",
        caption: "Percorra os ambientes renderizados do projeto, um espaço por vez.",
        slides: [
          { src: "/projetos/cidade-nova-sala-estar.jpg", alt: "Sala de estar do Projeto Cidade Nova", label: "Sala de estar" },
          { src: "/projetos/cidade-nova-sala-jantar.jpg", alt: "Sala de jantar do Projeto Cidade Nova", label: "Sala de jantar" },
          { src: "/projetos/cidade-nova-cozinha.jpg", alt: "Cozinha do Projeto Cidade Nova", label: "Cozinha" },
          { src: "/projetos/cidade-nova-quarto.jpg", alt: "Quarto principal do Projeto Cidade Nova", label: "Quarto principal" },
          { src: "/projetos/cidade-nova-quarto-escritorio.jpg", alt: "Quarto com escritório do Projeto Cidade Nova", label: "Quarto e escritório" },
          { src: "/projetos/cidade-nova-banheiro-suite.jpg", alt: "Banheiro da suíte do Projeto Cidade Nova", label: "Banheiro da suíte" },
          { src: "/projetos/cidade-nova-banheiro-social.jpg", alt: "Banheiro social do Projeto Cidade Nova", label: "Banheiro social" },
        ],
      },
    ],
  },
  {
    id: "casa-socorro",
    number: "03",
    title: "Casa Socorro",
    location: "Nossa Senhora do Socorro • SE",
    description: "Uma obra concluída com fachada sóbria e ambientes internos claros, funcionais e confortáveis.",
    badges: ["OBRA ENTREGUE", "RESIDENCIAL"],
    facts: ["Fachada concluída", "Ambientes internos", "Execução MS"],
    whatsappMessage: "Olá! Gostaria de saber mais sobre a Casa Socorro.",
    media: [
      {
        id: "fachada",
        label: "Fachada",
        kind: "image",
        src: "/projetos/casa-socorro-fachada.jpg",
        alt: "Fachada concluída da Casa Socorro",
        width: 1600,
        height: 1200,
        caption: "Fachada residencial concluída, com composição sóbria e funcional.",
      },
      {
        id: "interiores",
        label: "Interiores",
        kind: "image",
        src: "/projetos/casa-socorro-interior.jpg",
        alt: "Ambiente interno concluído da Casa Socorro",
        width: 1600,
        height: 1200,
        caption: "Ambientes internos claros e organizados para uma rotina mais confortável.",
      },
    ],
  },
  {
    id: "novo-empreendimento-ms",
    number: "04",
    title: "Novo Empreendimento MS",
    description: "Estamos preparando um novo conceito em moradia e arquitetura para a região.",
    badges: ["EM BREVE"],
    teaser: true,
    whatsappMessage: "Olá! Quero receber o spoiler do novo empreendimento da MS em primeira mão.",
  },
];

function Reveal({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 34, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.68, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function whatsappUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const LEADS_ENDPOINT = "https://msleads-worker.arturzinzito.workers.dev";

export default function Home() {
  const [activeService, setActiveService] = useState("construcao");
  const [intent, setIntent] = useState("Orçamento");
  const [service, setService] = useState("Construção de imóveis");
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  useEffect(() => {
    const contact = document.querySelector("#contato");
    if (!contact) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setContactVisible(entry.isIntersecting),
      { threshold: 0.08 },
    );
    observer.observe(contact);
    return () => observer.disconnect();
  }, []);

  function sendRequest(event) {
    event.preventDefault();
    const greeting = name.trim()
      ? `Olá! Meu nome é ${name.trim()}.`
      : "Olá!";
    const message =
      `${greeting} Gostaria de falar sobre ${intent.toLowerCase()} ` +
      `para o serviço de ${service}. Vim pelo site da MS Empreendimentos.`;
    fetch(LEADS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tabela: "clientes",
        nome: name.trim() || null,
        origem: "site",
        servico_interesse: service,
        observacoes: intent,
      }),
    }).catch(() => {});
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  }

  return (
    <main>
      <SiteHeader isHome />

      <section className="hero" id="inicio">
        <div className="heroGridLines" aria-hidden="true" />
        <div className="shell heroLayout">
          <div className="heroCopy">
            <p className="eyebrow"><span /> Construção • Imóveis • Soluções</p>
            <h1>Projetos que saem do <em>papel.</em><br />Resultados que ficam.</h1>
            <p className="heroLead">
              Planejamento, execução e atendimento próximo para transformar projetos em espaços que fazem sentido para você.
            </p>
            <div className="heroActions">
              <a className="button primary" href="#contato">
                Solicitar orçamento <Icon name="arrow" />
              </a>
              <a
                className="button ghost"
                href={whatsappUrl("Olá! Gostaria de agendar um atendimento com a MS Empreendimentos.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="calendar" /> Agendar atendimento
              </a>
            </div>
            <div className="heroPromises" aria-label="Diferenciais">
              <span><Icon name="check" size={16} /> Atendimento personalizado</span>
              <span><Icon name="check" size={16} /> Planejamento claro</span>
              <span><Icon name="check" size={16} /> Soluções sob medida</span>
            </div>
          </div>

          <div className="heroVisual" aria-label="Ilustração arquitetônica">
            <div className="orangePlane" />
            <div className="blueprintCard">
              <div className="drawingLabel">PROJETO / 001</div>
              <svg viewBox="0 0 560 500" role="img" aria-label="Desenho de uma residência contemporânea">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.45" opacity=".32"/>
                  </pattern>
                </defs>
                <rect width="560" height="500" fill="url(#grid)"/>
                <path className="houseFill" d="M70 376V208l144-74 90 47 72-40 116 67v168Z"/>
                <path className="houseLine" d="M70 376V208l144-74 90 47 72-40 116 67v168M70 208l144 76 90-103m-90 103v92m162-235v235M52 376h458"/>
                <path className="windowLine" d="M104 246h72v78h-72zm150 10h72v120h-72zm155-42h52v78h-52z"/>
                <path className="measureLine" d="M70 410h422M70 400v20m422-20v20M272 432h-54m126 0h-54"/>
                <text x="280" y="438" textAnchor="middle">10.80 m</text>
                <circle cx="214" cy="284" r="4" className="node"/>
                <circle cx="376" cy="141" r="4" className="node"/>
              </svg>
              <div className="drawingMeta">
                <span>PLANEJAMENTO</span><span>EXECUÇÃO</span><span>ENTREGA</span>
              </div>
            </div>
            <a
              className="locationBadge"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="pin"><Icon name="map" /></span>
              <span><small>NOSSO ENDEREÇO</small><strong>Piabeta, N. Sra. do Socorro</strong></span>
              <Icon name="arrow" size={19} />
            </a>
          </div>
        </div>
      </section>

      <section className="aboutSection" id="quem-somos">
        <div className="shell aboutGrid">
          <Reveal className="aboutCopy">
            <p className="eyebrow dark"><span /> Quem somos</p>
            <h2>Pessoas que constroem.<br />Histórias que se transformam.</h2>
            <p>
              A MS Empreendimentos LTDA nasceu em 07 de maio de 2026 com o propósito de transformar vidas: ajudar você a conquistar seu imóvel, renovar seus espaços e investir com segurança.
            </p>
            <p>
              Nossa equipe une experiência prática, trabalho e resiliência a um atendimento próximo. Para nós, uma casa representa conquista, segurança e família.
            </p>
            <div className="purposeCard">
              <small>NOSSO PROPÓSITO</small>
              <strong>Construir o presente com clareza para realizar o futuro com confiança.</strong>
            </div>
            <a className="button ghost aboutStoryLink" href="/quem-somos">Conheça nossa história <Icon name="arrow" size={18} /></a>
          </Reveal>

          <Reveal className="aboutVisual aboutTeamVisual" delay={0.08}>
            <div className="aboutImageFrame">
              <img src="/equipe/ms-empreendimentos-equipe.jpeg" alt="Equipe da MS Empreendimentos reunida na sede da empresa" width="960" height="1280" loading="lazy" />
            </div>
            <div className="aboutBadge">
              <span>MS</span>
              <div><small>NOSSA EQUIPE</small><strong>Compromisso com a sua história</strong></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="servicesSection" id="servicos">
        <div className="shell">
          <Reveal className="sectionHeading">
            <div>
              <p className="eyebrow dark"><span /> O que fazemos</p>
              <h2>Do primeiro traço<br />ao último detalhe.</h2>
            </div>
            <p>
              Escolha um serviço para conhecer melhor. Cada solução começa com uma conversa sobre o que você realmente precisa.
            </p>
          </Reveal>

          <Reveal className="servicesSubhead" delay={0.05}>
            <small>NOSSAS SOLUÇÕES</small>
            <h3>Como podemos ajudar</h3>
          </Reveal>

          <Reveal className="servicesGrid" delay={0.08}>
            {services.map((item) => (
              <button
                key={item.id}
                className={activeService === item.id ? "serviceCard active" : "serviceCard"}
                onClick={() => setActiveService(item.id)}
                aria-expanded={activeService === item.id}
              >
                <span className="serviceTop">
                  <span className="serviceIcon"><Icon name={item.icon} size={24} /></span>
                  <span className="serviceNumber">{item.number}</span>
                </span>
                <strong>{item.title}</strong>
                <span className="serviceShort">{item.short}</span>
                <span className="serviceDetail">{item.detail}</span>
                <span className="serviceLink">
                  {activeService === item.id ? "Serviço selecionado" : "Ver detalhes"}
                  <Icon name={activeService === item.id ? "check" : "arrow"} size={18} />
                </span>
              </button>
            ))}
          </Reveal>

          <Reveal className="serviceBand" delay={0.08}>
            <span className="bandIcon"><Icon name="spark" size={25} /></span>
            <div>
              <small>NÃO ENCONTROU O QUE PROCURA?</small>
              <strong>Conte seu projeto. Criamos uma solução personalizada.</strong>
            </div>
            <a href="#contato">Conversar agora <Icon name="arrow" size={18} /></a>
          </Reveal>
        </div>
      </section>

      <section className="projectsSection" id="projetos">
        <div className="shell">
          <Reveal className="galleryHeading">
            <div>
              <p className="eyebrow"><span /> Projetos & experiências 3D</p>
              <h2>Um projeto completo.<br />Todos os detalhes no mesmo lugar.</h2>
            </div>
            <p>Veja fachadas, interiores e maquetes interativas sem sair do projeto. Escolha uma mídia e explore no seu ritmo.</p>
          </Reveal>

          <div className="portfolioGrid">
            {portfolioProjects.map((project, index) => (
              <Reveal key={project.id} delay={Math.min(index * 0.04, 0.12)}>
                <ProjectCard
                  project={project}
                  whatsappHref={whatsappUrl(project.whatsappMessage)}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="contactSection" id="contato">
        <Reveal className="shell contactIntro">
          <p className="eyebrow"><span /> Próximo passo</p>
          <h2>Vamos tirar seu projeto<br />do papel?</h2>
          <p>Escolha como podemos ajudar e fale diretamente com a equipe pelo WhatsApp.</p>
        </Reveal>

        <Reveal className="shell contactLayout" delay={0.06}>
          <div className="contactFormCard">
            <div className="formHeader">
              <span>01</span>
              <div><small>ATENDIMENTO RÁPIDO</small><h3>Como podemos ajudar?</h3></div>
            </div>
            <form onSubmit={sendRequest}>
              <fieldset>
                <legend>Quero:</legend>
                <div className="intentChoices">
                  {["Orçamento", "Agendamento", "Tirar uma dúvida"].map((choice) => (
                    <button
                      type="button"
                      key={choice}
                      className={intent === choice ? "selected" : ""}
                      onClick={() => setIntent(choice)}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label>
                Serviço de interesse
                <span className="selectWrap">
                  <select value={service} onChange={(e) => setService(e.target.value)}>
                    {services.map((item) => <option key={item.id}>{item.title}</option>)}
                  </select>
                  <span>⌄</span>
                </span>
              </label>

              <label>
                Seu nome <small>(opcional)</small>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como podemos chamar você?"
                  autoComplete="name"
                  maxLength={80}
                  inputMode="text"
                />
              </label>

              <button className="button primary wide" type="submit">
                Continuar no WhatsApp <Icon name="whatsapp" />
              </button>
              <p className="formNote">Este formulário não salva seu nome. Ao continuar, seu nome e suas escolhas serão incluídos na mensagem aberta no WhatsApp, onde você poderá revisá-la antes de enviar. O mapa utiliza o serviço Google Maps.</p>
            </form>
          </div>

          <div className="locationCard">
            <div className="mapWrap">
              <iframe
                title="Localização da MS Empreendimentos"
                src={`https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                allow="fullscreen"
              />
              <div className="mapTag"><Icon name="map" size={18} /> NOSSA LOCALIZAÇÃO</div>
            </div>
            <div className="locationInfo">
              <div>
                <small>VISITE A MS EMPREENDIMENTOS</small>
                <h3>Avenida Rosemary Vieira de Jesus, 1489</h3>
                <p>Piabeta • Nossa Senhora do Socorro — SE</p>
              </div>
              <button className="copyButton" onClick={copyAddress}>
                <Icon name={copied ? "check" : "copy"} size={19} />
                {copied ? "Endereço copiado" : "Copiar endereço"}
              </button>
              <div className="contactRows">
                <a href={whatsappUrl("Olá! Vim pelo site e gostaria de falar com a MS Empreendimentos.")} target="_blank" rel="noopener noreferrer">
                  <span><Icon name="whatsapp" /></span>
                  <div><small>WHATSAPP</small><strong>(79) 9925-3884</strong></div>
                  <Icon name="arrow" size={18} />
                </a>
                <a href="https://www.instagram.com/ms.empreendimentos.48/" target="_blank" rel="noopener noreferrer">
                  <span><Icon name="instagram" /></span>
                  <div><small>INSTAGRAM</small><strong>@ms.empreendimentos.48</strong></div>
                  <Icon name="arrow" size={18} />
                </a>
              </div>
              <p className="hours"><Icon name="calendar" size={18} /> Segunda a sexta, 08h–12h e 13h–17h30 • Atendimento com hora marcada</p>
            </div>
          </div>
        </Reveal>

        <footer className="footer shell">
          <Brand />
          <p>Construindo o presente. Realizando o futuro.</p>
          <span>MS Empreendimentos LTDA • CNPJ 47.229.050/0001-09</span>
        </footer>
      </section>

      <a
        className={contactVisible ? "floatingWhatsApp hidden" : "floatingWhatsApp"}
        href={whatsappUrl("Olá! Vim pelo site e gostaria de falar com a MS Empreendimentos.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com a MS Empreendimentos no WhatsApp"
      >
        <Icon name="whatsapp" size={26} /><span>Fale conosco</span>
      </a>
    </main>
  );
}

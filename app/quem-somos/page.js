import { SiteHeader, Brand, Icon } from "../site-header";

const origin = "https://ms-empreendimentos-socorro.arturzinzito.chatgpt.site";
const title = "Quem somos | MS Empreendimentos";
const description = "Conheça a história, os valores e a equipe da MS Empreendimentos. Mercado imobiliário, construção civil e reformas com confiança e atendimento próximo.";
const teamPhoto = `${origin}/equipe/ms-empreendimentos-equipe.jpeg`;

export const metadata = {
  title,
  description,
  alternates: { canonical: `${origin}/quem-somos` },
  openGraph: {
    title, description, url: `${origin}/quem-somos`, type: "website",
    siteName: "MS Empreendimentos", locale: "pt_BR",
    images: [{ url: teamPhoto, width: 960, height: 1280, alt: "Equipe da MS Empreendimentos" }],
  },
  twitter: { card: "summary_large_image", title, description, images: [teamPhoto] },
};

const values = [
  ["Confiança", "Transparência para planejar e investir sem medo."],
  ["Qualidade", "Rigor técnico em cada projeto e entrega."],
  ["Honestidade & Respeito", "Relacionamentos pautados na ética com clientes, fornecedores e parceiros."],
  ["Compromisso", "Dedicação total para concretizar planos e sonhos."],
  ["Inovação & Excelência no Atendimento", "Busca contínua por soluções eficientes e um suporte humanizado."],
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="aboutPage" id="conteudo">
        <section className="companyHero" aria-labelledby="company-title">
          <div className="shell companyHeroGrid">
            <div className="companyIntro">
              <nav className="breadcrumbs" aria-label="Caminho da página"><a href="/">Início</a><span aria-hidden="true">/</span><span aria-current="page">Quem somos</span></nav>
              <p className="eyebrow"><span /> Sobre a MS Empreendimentos</p>
              <h1 id="company-title">Construindo espaços.<br /><em>Transformando vidas.</em></h1>
              <p className="companyLead">Cada conquista começa com um sonho. O nosso propósito é ajudar você a realizar o seu.</p>
              <div className="companyFounded"><span>O INÍCIO DA NOSSA HISTÓRIA</span><time dateTime="2026-05-07">07 de maio de 2026</time></div>
              <a className="button primary" href="#nossa-historia">Conheça a MS <Icon name="arrow" size={19} /></a>
            </div>
            <figure className="companyPortrait">
              <img src="/equipe/ms-empreendimentos-equipe.jpeg" alt="Quatro integrantes da equipe da MS Empreendimentos reunidos na sede da empresa" width="960" height="1280" fetchPriority="high" />
              <figcaption><span>GENTE QUE FAZ ACONTECER</span><strong>Equipe MS Empreendimentos</strong></figcaption>
            </figure>
          </div>
        </section>

        <section className="companyStory" id="nossa-historia" aria-labelledby="story-title">
          <div className="shell companySplit">
            <div><p className="eyebrow"><span /> Nossa história</p><h2 id="story-title">Trabalho, resiliência<br />e um propósito.</h2></div>
            <div className="companyProse">
              <p>A MS Empreendimentos LTDA nasceu em <strong>07 de maio de 2026</strong> com o propósito de transformar vidas. Nossa trajetória foi construída com base em trabalho duro, resiliência e na busca constante por ajudar pessoas a realizarem o sonho do imóvel próprio, reformarem seus ambientes ou investirem com segurança.</p>
              <p>Para nós, uma casa é muito mais do que paredes e janelas: representa conquista, segurança, família e o lugar onde os melhores momentos da vida acontecem.</p>
            </div>
          </div>
        </section>

        <section className="companyAreas" aria-labelledby="areas-title">
          <div className="shell">
            <p className="eyebrow"><span /> Áreas de atuação</p>
            <h2 id="areas-title">Soluções para cada plano.</h2>
            <div className="companyAreasGrid">
              <article><span className="companyAreaNumber">01</span><Icon name="key" size={30} /><h3>Mercado imobiliário</h3><p>Venda e intermediação de imóveis.</p></article>
              <article><span className="companyAreaNumber">02</span><Icon name="building" size={30} /><h3>Construção civil</h3><p>Planejamento e execução para transformar projetos em realidade.</p></article>
              <article><span className="companyAreaNumber">03</span><Icon name="hammer" size={30} /><h3>Reformas e melhoria de espaços</h3><p>Novas possibilidades para os ambientes que fazem parte da sua vida.</p></article>
            </div>
            <a className="companyTextLink" href="/#servicos">Explore nossos serviços <Icon name="arrow" size={19} /></a>
          </div>
        </section>

        <section className="companyValues" aria-labelledby="values-title">
          <div className="shell companySplit">
            <div><p className="eyebrow"><span /> Nossos valores</p><h2 id="values-title">O que sustenta<br />cada entrega.</h2><p className="companySectionLead">Princípios que orientam nossas decisões e a forma como cuidamos de cada relação.</p></div>
            <ol className="companyValueList">
              {values.map(([name, detail], index) => <li key={name}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h3>{name}</h3><p>{detail}</p></div></li>)}
            </ol>
          </div>
        </section>

        <section className="companyTeam" aria-labelledby="team-title">
          <div className="shell companySplit">
            <div><p className="eyebrow"><span /> Nossa equipe</p><h2 id="team-title">Experiência prática.<br />Compromisso humano.</h2></div>
            <div className="companyProse"><p>Por trás da MS Empreendimentos existe uma equipe experiente e com vivência prática no mercado — desde a rotina operacional até a gestão estratégica —, unida pelo compromisso de oferecer um ambiente seguro e confiável para transformar a sua história.</p><a className="button primary" href="/#contato">Converse com nossa equipe <Icon name="arrow" size={19} /></a></div>
          </div>
        </section>
      </main>
      <div className="companyFooter"><footer className="footer shell"><Brand /><p>Construindo o presente. Realizando o futuro.</p><span>MS Empreendimentos LTDA • CNPJ 47.229.050/0001-09</span></footer></div>
    </>
  );
}

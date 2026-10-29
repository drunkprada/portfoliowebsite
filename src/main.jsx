import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {github, papers, projects, achievements, roles, communities, education, skillGroups, experienceJourney, resume} from './data';
import './styles.css';
import Sketch from './Sketch';

const email = 'sahananaganandh@gmail.com';
const linkedin = 'https://www.linkedin.com/in/sahana-naganandh';

const employerLogos = {
  'Dell Technologies': {src:'/logos/dell.svg'},
  'Nectar Building Technologies Inc.': {src:'/logos/nectar.svg'},
  'Legal Horizons': {src:'/logos/legal-horizons.jpeg', square:true},
  'Manipal Institute of Higher Education': {src:'/logos/manipal.svg'},
};

function EmployerLogo({name}) {
  const logo = employerLogos[name];
  return logo ? <span className={'employer-logo' + (logo.square ? ' employer-logo--square' : '')}>
    <img src={logo.src} alt={name + ' logo'} width={logo.square ? 44 : 110} height="40" loading="lazy"/>
  </span> : null;
}

const tabs = [
  {id: 'home', label: 'Home'},
  {id: 'research', label: 'Research'},
  {id: 'projects', label: 'Projects'},
  {id: 'experience', label: 'Experience'},
];

const External = ({href, className = '', children, ...rest}) =>
  <a className={className} href={href} target="_blank" rel="noreferrer" {...rest}>{children}</a>;

/* ---------------- Floating nav ---------------- */
function Nav({page, dark, setDark, onReselect}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(scrollY > 8);
    on(); addEventListener('scroll', on, {passive: true});
    return () => removeEventListener('scroll', on);
  }, []);
  const contact = email ? 'mailto:' + email : github;
  return <div className={'navwrap' + (scrolled ? ' is-floating' : '')}>
    <header className="nav">
      <nav className="nav__links" aria-label="Main">
        {tabs.map(t => <a key={t.id} href={'#' + t.id} className={page === t.id ? 'is-active' : undefined}
          aria-current={page === t.id ? 'page' : undefined}
          onClick={page === t.id ? onReselect : undefined}>{t.label}</a>)}
      </nav>
      <div className="nav__right">
        <button className="theme" onClick={() => setDark(!dark)} aria-pressed={dark}
          aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}>
          <span className="theme__dot" aria-hidden="true"/>
        </button>
        <External className="nav__cta" href={contact}>{email ? 'Get in touch' : 'GitHub'} ↗</External>
      </div>
    </header>
  </div>;
}

function Footer() {
  return <footer className="footer">
    <div className="footer__links">
      {email && <a href={'mailto:' + email}>Email</a>}
      {linkedin && <External href={linkedin}>LinkedIn</External>}
      <External href={resume}>Resume</External>
      <External href={github}>GitHub</External>
    </div>
  </footer>;
}

/* ---------------- Intro ---------------- */
function useClock() {
  const fmt = () => new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit'}).format(new Date());
  const [t, setT] = useState(fmt);
  useEffect(() => { const id = setInterval(() => setT(fmt()), 15000); return () => clearInterval(id); }, []);
  return t;
}

function Reveal({as: Tag = 'div', className = '', children, ...rest}) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver !== 'function') return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        node.classList.add('is-revealed');
        observer.disconnect();
      }
    }, {threshold: .08});
    node.classList.add('will-reveal');
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <Tag ref={ref} className={'reveal ' + className} {...rest}>{children}</Tag>;
}

function ExperienceTimeline() {
  const stops = experienceJourney.filter(step => step.year);
  // The SVG and CSS columns share a 220-unit grid. Scaling the SVG with the
  // track keeps every bend attached to its milestone on phones and desktops.
  const points = stops.map((_, index) => ({x: 20 + index * 220, y: index % 2 ? 54 : 22}));
  const curve = points.reduce((path, point, index) => index === 0
    ? `M ${point.x} ${point.y}`
    : path + ` C ${points[index - 1].x + 90} ${points[index - 1].y}, ${point.x - 90} ${point.y}, ${point.x} ${point.y}`, '');
  return <section className="experience-strip" aria-labelledby="journey-heading">
    <div className="home-sectionhead section-heading">
      <h2 id="journey-heading">Experience</h2>
      <a className="text-link" href="#experience">View experience ↗</a>
    </div>
    <div className="journey-scroll" tabIndex={0} role="region" aria-label="Experience timeline, scroll horizontally">
      <Reveal className="journey-track">
      <svg className="journey-path" viewBox={`0 0 ${stops.length * 220} 76`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d={curve} pathLength="1"/>
      </svg>
      <ol className="journey-stops">
        {stops.map((step, index) => <li className="journey-stop" key={step.id} style={{'--dot-y': points[index].y + 'px'}}>
          <span className={'journey-dot tone-' + step.tone} aria-hidden="true"/>
          <div className="journey-logo"><EmployerLogo name={step.title}/>{!employerLogos[step.title] && <Sketch kind={step.id.startsWith('hackathon') ? 'star' : 'chip'}/>}</div>
          <p className="journey-date">{step.meta}</p>
          <h3>{step.title}</h3>
          <p className="journey-role">{step.label}</p>
        </li>)}
      </ol>
      </Reveal>
    </div>
  </section>;
}

function Skills() {
  return <section className="skills-section" aria-labelledby="skills-heading">
    <Reveal className="home-sectionhead"><h2 id="skills-heading">Skills</h2></Reveal>
    <div className="skills-groups">
      {skillGroups.map(group => <Reveal className="skills-group" key={group.label}>
        <h3>{group.label}</h3>
        <ul className="skill-cloud" aria-label={group.label}>
          {group.items.map((name, index) => <li key={name} className={'skill-bubble tone-' + group.tone}
            style={{'--tilt':(index % 3 - 1) + 'deg'}}>{name}</li>)}
        </ul>
      </Reveal>)}
    </div>
  </section>;
}

function Hackathons() {
  const heading = React.useId();
  return <section className="hackathons" aria-labelledby={heading}>
    <Reveal className="home-sectionhead"><h2 id={heading}>Hackathons</h2></Reveal>
    <div className="hackathon-grid">
      {achievements.map((achievement, index) => <Reveal as="article" className="card hackathon" key={achievement.title}>
        <span className={'award-result tone-' + ['lemon', 'rose', 'lilac'][index]}>{achievement.result}</span>
        <h3>{achievement.title}</h3>
        <p className="resume-date">{achievement.year}</p><p>{achievement.description}</p>
      </Reveal>)}
    </div>
  </section>;
}

function Home() {
  const time = useClock();
  return <div className="home">
    <section className="intro">
      <Reveal className="intro__copy">
        <p className="intro__eyebrow"><span className="live" aria-hidden="true"/>Edinburgh · {time}</p>
        <h1 id="home-heading" className="intro__name">Hi, I’m <span className="ink-name">Sahana.<svg viewBox="0 0 260 20" preserveAspectRatio="none" aria-hidden="true"><path d="M3 12Q61 1 125 10T256 7M12 17Q110 9 244 15" pathLength="1"/></svg></span></h1>
        <Sketch className="intro__doodle"/>
        <p className="intro__lede">I’m a third-year Electronics &amp; Computer Science student at the University of Edinburgh, with a background in backend development and AI research.</p>
        <p className="intro__bio">Previously at Dell in Dubai, building backend services and AI recruitment tools. Before Edinburgh, I studied Computer Science at VIT.</p>
        <div className="intro__cta">
          <External className="btn" href={resume}>View my resume <span aria-hidden="true">↗</span></External>
          <a className="btn btn--ghost" href={'mailto:' + email}>Contact me</a>
        </div>
        <div className="intro__links"><a href="#research">Read my research ↗</a><a href="#projects">See projects ↗</a></div>
      </Reveal>
    </section>

    <section className="home-resume" aria-labelledby="overview-heading">
      <Reveal className="home-sectionhead"><h2 id="overview-heading">Education</h2></Reveal>
      <div className="education-list">
        {education.map(item => <Reveal as="article" className="education-row" key={item.name}>
          <div className="education-row__date">{item.date}</div>
          <div className="education-row__body">
            <h3>{item.name}</h3>
            <p>{item.qualification}</p>
            <p className="education-row__detail">{item.detail}</p>
          </div>
          <span className={'education-row__mark tone-' + item.tone} aria-hidden="true">{item.mark}</span>
        </Reveal>)}
      </div>
    </section>

    <ExperienceTimeline/>
    <Skills/>
    <Reveal as="section" className="contact-strip" aria-labelledby="contact-heading">
      <div><h2 id="contact-heading">Get in touch</h2></div>
      <a className="text-link" href={'mailto:' + email}>{email} ↗</a>
    </Reveal>
  </div>;
}

/* ---------------- Shared bits ---------------- */
function PaperPreview({paper}) {
  return <External className="paper-preview" href={paper.links[0][1]} aria-label={'Read ' + paper.title}>
    <img src={paper.preview} alt={'First page of ' + paper.title} width="778" height="1100" loading="lazy"/>
  </External>;
}

function PageHead({id, title, sketch}) {
  return <header className="pagehead">
    <h1 id={id}>{title}</h1>
    <Sketch kind={sketch}/>
  </header>;
}

function Details({children, label = 'Read more'}) {
  const [open, setOpen] = useState(false);
  const id = React.useId();
  return <div className={'details' + (open ? ' is-open' : '')}>
    <button aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
      {open ? 'Show less' : label}<span aria-hidden="true">{open ? '−' : '+'}</span>
    </button>
    <div id={id} className="details__body" hidden={!open}>{children}</div>
  </div>;
}

/* ---------------- Research ---------------- */
function Research() {
  const [lead, ...rest] = papers;
  return <section className="page">
    <PageHead id="research-heading" title="Papers" sketch="star"/>

    <article className="card feature">
      <div className="feature__media"><PaperPreview paper={lead}/></div>
      <div className="feature__body">
        <span className="tag tag--win">{lead.status} · {lead.contribution}</span>
        <h2>{lead.title}</h2>
        <p className="muted">{lead.authors}</p>
        <p>{lead.summary}</p>
        <div className="feature__actions">{lead.links.map(([l, h]) => <External key={l} className="btn" href={h}>{l} ↗</External>)}</div>
        <div className="stats">
          <div><b>2</b><span>models tested</span></div>
          <div><b>5×</b><span>runs per setup</span></div>
          <div><b>4</b><span>tuning stages</span></div>
        </div>
      </div>
    </article>
    <Details label="The question, method & findings">
      <div className="qa">
        <div><h3>The question</h3><p>{lead.question}</p></div>
        <div><h3>The approach</h3><p>{lead.approach}</p></div>
        <div><h3>What we found</h3><p>{lead.finding}</p></div>
      </div>
    </Details>

    {rest.map(p => <React.Fragment key={p.id}>
      <article className="card paperrow">
        <div className="paperrow__media"><PaperPreview paper={p}/></div>
        <div className="paperrow__body">
          <span className="tag tag--dark">{p.status} · {p.contribution}</span>
          <h2>{p.title}</h2>
          <p className="muted">{p.authors}</p>
          <p>{p.summary}</p>
          <div className="feature__actions">{p.links.map(([l, h], i) => <External key={l} className={'btn' + (i ? ' btn--ghost' : '')} href={h}>{l} ↗</External>)}</div>
        </div>
      </article>
      <Details label="The question, method & findings">
        <div className="qa">
          <div><h3>The question</h3><p>{p.question}</p></div>
          <div><h3>The approach</h3><p>{p.approach}</p></div>
          <div><h3>What we found</h3><p>{p.finding}</p></div>
        </div>
      </Details>
    </React.Fragment>)}
  </section>;
}

/* ---------------- Projects ---------------- */
function Projects() {
  return <section className="page">
    <PageHead id="projects-heading" title="Things I’ve built" sketch="chip"/>
    <div className="project-list">
      {projects.map(p => <Reveal as="article" className="card proj" key={p.id}>
        <div className="proj__body">
          <div className="proj__top"><h2>{p.title}</h2><span className="muted">{p.tags.slice(0, 2).join(' · ')}</span></div>
          <p>{p.summary}</p>
          <p className="proj__context">{p.context}</p>
          <div className="proj__links">{p.links.map(([l, h]) => <External key={l} href={h}>{l} ↗</External>)}</div>
          <Details label="How it works"><p>{p.detail}</p><p>{p.note}</p></Details>
        </div>
      </Reveal>)}
    </div>
    <Hackathons/>
    <External className="card more" href={github}>
      <b>github.com/drunkprada ↗</b>
    </External>
  </section>;
}

/* ---------------- Experience ---------------- */
function Experience() {
  return <section className="page">
    <PageHead id="experience-heading" title="Where I’ve worked" sketch="rocket"/>
    <div className="experience-list">
      {roles.map(role => <Reveal as="article" className="experience-entry" key={role.name}>
        <div className="experience-entry__meta"><span>{role.date}</span><span>{role.location}</span></div>
        <div className="experience-entry__body">
          <EmployerLogo name={role.name}/>
          <p className="role-title">{role.role}</p>
          <h2>{role.name}</h2>
          <ul>{role.body.map(line => <li key={line}>{line}</li>)}</ul>
          <p className="muted">{role.tags.join(' · ')}</p>
        </div>
      </Reveal>)}
    </div>
    <section className="communities" aria-labelledby="communities-title">
      <h2 id="communities-title">Student clubs</h2>
      <div className="community-list">
        {communities.map(community => <Reveal as="article" className={'card community' + (community.current ? ' community--current' : '')} key={community.name}>
          <div className="community__meta">{!community.positions && <span className="role-title">{community.role}</span>}<span className="muted">{[community.date, community.duration].filter(Boolean).join(' · ')}</span></div>
          <h3><External href={community.href}>{community.name} ↗</External></h3>
          {community.positions ? <div className="community-positions">{community.positions.map(position => <div className="community-position" key={position.title}><h4>{position.title}</h4><p>{position.description}</p></div>)}</div>
            : <ul>{community.points.map(point => <li key={point}>{point}</li>)}</ul>}
        </Reveal>)}
      </div>
    </section>
  </section>;
}

/* ---------------- App ---------------- */
const views = {home: Home, research: Research, projects: Projects, experience: Experience};
const currentPage = () => { const raw = location.hash.slice(1).split('/')[0]; return Object.hasOwn(views, raw) ? raw : 'home'; };

function App() {
  const [page, setPage] = useState(currentPage);
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark');
  const main = useRef(null);
  const first = useRef(true);
  const focusPageStart = () => {
    main.current?.focus({preventScroll: true});
    scrollTo({top: 0, behavior: 'instant'});
  };
  const reselectPage = e => {
    // Only plain activation returns to the top; browser link shortcuts stay native.
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    focusPageStart();
  };
  useEffect(() => { const h = () => setPage(currentPage()); addEventListener('hashchange', h); return () => removeEventListener('hashchange', h); }, []);
  useEffect(() => {
    document.title = page === 'home' ? 'Sahana Naganandh' : `${tabs.find(t => t.id === page).label} · Sahana Naganandh`;
    if (first.current) { first.current = false; return; }
    focusPageStart();
  }, [page]);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0a0a0a' : '#f4f4f3');
    try { localStorage.setItem('portfolio-theme-v3', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);
  const Page = views[page];
  return <>
    <a className="skip" href="#main" onClick={e => { e.preventDefault(); main.current?.focus(); }}>Skip to content</a>
    <Nav page={page} dark={dark} setDark={setDark} onReselect={reselectPage}/>
    <main id="main" tabIndex={-1} ref={main} aria-labelledby={page + '-heading'} className={page === 'home' ? 'is-home' : undefined}>
      <div key={page} className="enter"><Page/></div>
    </main>
    <Footer/>
  </>;
}

createRoot(document.getElementById('root')).render(<App/>);

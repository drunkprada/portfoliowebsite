import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {github, papers, projects, achievements, roles, communities, education, skillGroups, skillJourney, resume} from './data';
import {SkillTrail} from './SkillTrail';
import './styles.css';

const email = 'sahananaganandh@gmail.com';
const linkedin = 'https://www.linkedin.com/in/sahana-naganandh';

const tabs = [
  {id: 'home', label: 'Home'},
  {id: 'research', label: 'Research'},
  {id: 'projects', label: 'Projects'},
  {id: 'experience', label: 'Experience'},
];

const External = ({href, className = '', children, ...rest}) =>
  <a className={className} href={href} target="_blank" rel="noreferrer" {...rest}>{children}</a>;

/* ---------------- Floating nav ---------------- */
function Nav({page, dark, setDark}) {
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
          aria-current={page === t.id ? 'page' : undefined}>{t.label}</a>)}
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
    <span>© {new Date().getFullYear()} Sahana Naganandh · Edinburgh</span>
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

function Skills() {
  const journey = useRef(null);
  return <section className="skills-section" aria-labelledby="skills-heading">
    <Reveal className="home-sectionhead"><span className="label">An evolving toolkit</span><h2 id="skills-heading">Skills, along the way.</h2></Reveal>
    <div className="skill-journey" ref={journey}>
      <SkillTrail container={journey}/>
      <ol className="skill-stops" aria-label="Skills and current learning">
      {skillJourney.map((step, index) => <li className="skill-stop" key={step.id}>
        <span className={'skill-stop__marker tone-' + step.tone + (step.id === 'learning' ? ' is-learning' : '')} aria-hidden="true">{step.id === 'learning' ? '✧' : String(index + 1).padStart(2,'0')}</span>
        <Reveal className="skill-stop__body">
          <span className="label">{step.id === 'learning' ? 'Exploring now' : ['The foundations','Making connections','AI & workflows'][index]}</span>
          <h3>{step.title}</h3><p>{step.description}</p>
          <ul className="skill-cloud" aria-label={step.title}>
            {step.groups.flatMap(label => {
              const group = skillGroups.find(group => group.label === label);
              return group.items.map((name, skillIndex) => <li key={name} className={'skill-bubble tone-' + group.tone}
                style={{'--tilt':(skillIndex % 3 - 1) * 2 + 'deg','--bubble-delay':skillIndex * 35 + 'ms'}} aria-label={name + ' · ' + group.label}>{name}</li>);
            })}
          </ul>
        </Reveal>
      </li>)}
      </ol>
    </div>
  </section>;
}

function Hackathons() {
  const heading = React.useId();
  return <section className="hackathons" aria-labelledby={heading}>
    <Reveal className="home-sectionhead"><span className="label">Building with a team</span><h2 id={heading}>Hackathons</h2></Reveal>
    <div className="hackathon-grid">
      {achievements.map((achievement, index) => <Reveal as="article" className="card hackathon" key={achievement.title}>
        <span className={'award-result tone-' + ['lemon', 'rose', 'lilac'][index]}>{achievement.result}</span>
        <h3>{achievement.title}</h3>
        <p>{achievement.description}</p>
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
        <h1 className="intro__name">Hi, I’m Sahana.</h1>
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
      <Reveal className="home-sectionhead"><span className="label">A little about me</span><h2 id="overview-heading">At a glance</h2></Reveal>
      <div className="resume-grid">
        <Reveal as="article" className="card resume-panel">
          <h3>Education</h3>
          {education.map(item => <div className="resume-entry" key={item.name}>
            <h4>{item.name}</h4><p>{item.qualification}</p><p className="muted">{item.detail}</p><span className="resume-date">{item.date}</span>
          </div>)}
        </Reveal>
        <Reveal as="article" className="card resume-panel">
          <h3>Experience</h3>
          {roles.map(role => <div className="resume-entry" key={role.name}>
            <h4>{role.role}</h4><p>{role.name}</p><span className="resume-date">{role.date}</span>
          </div>)}
          <a className="text-link" href="#experience">More about my experience ↗</a>
        </Reveal>
        <Reveal as="article" className="card resume-panel">
          <h3>Societies</h3>
          {communities.map(community => <div className="resume-entry" key={community.name}>
            <h4>{community.name}</h4><p>Senior Core Member · {community.duration}</p><p className="muted">Frontend development, organising events{community.name.startsWith('CodeChef') ? ' and hackathon judging.' : ' and sponsorship support.'}</p>
          </div>)}
        </Reveal>
      </div>
    </section>

    <Skills/>
    <Hackathons/>
    <Reveal as="section" className="contact-strip" aria-labelledby="contact-heading">
      <div><h2 id="contact-heading">Get in touch</h2><p>For opportunities, collaborations or a conversation.</p></div>
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

function PageHead({eyebrow, title, lede}) {
  return <header className="pagehead">
    <span className="label">{eyebrow}</span>
    <h1>{title}</h1>
    {lede && <p>{lede}</p>}
  </header>;
}

function Details({children, label = 'Read more'}) {
  const [open, setOpen] = useState(false);
  const id = React.useId();
  return <div className={'details' + (open ? ' is-open' : '')}>
    <button aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
      {open ? 'Show less' : label}<span aria-hidden="true">{open ? '−' : '+'}</span>
    </button>
    {open && <div id={id} className="details__body">{children}</div>}
  </div>;
}

/* ---------------- Research ---------------- */
function Research() {
  const [lead, ...rest] = papers;
  return <section className="page">
    <PageHead eyebrow="Research" title="Papers" lede="How operating-system settings change AI inference, and how to keep training data useful without exposing people."/>

    <article className="card feature">
      <div className="feature__media"><PaperPreview paper={lead}/></div>
      <div className="feature__body">
        <span className="tag tag--win">{lead.status} · {lead.contribution}</span>
        <h2>{lead.shortTitle}</h2>
        <p className="feature__title">{lead.title}</p>
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
    <PageHead eyebrow="Projects" title="Things I’ve built" lede="Finance, algorithms and AI workflows, with links to the code."/>
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
      <span className="label">More on GitHub</span>
      <b>github.com/drunkprada ↗</b>
      <span className="muted">Smaller experiments, coursework and society projects.</span>
    </External>
  </section>;
}

/* ---------------- Experience ---------------- */
function Experience() {
  return <section className="page">
    <PageHead eyebrow="Experience" title="Where I’ve worked" lede="Internships, research work and student societies."/>
    <div className="experience-list">
      {roles.map(role => <Reveal as="article" className="experience-entry" key={role.name}>
        <div className="experience-entry__meta"><span>{role.date}</span><span>{role.location}</span></div>
        <div className="experience-entry__body">
          <p className="label">{role.role}</p>
          <h2>{role.name}</h2>
          <p>{role.intro}</p>
          <ul>{role.body.map(line => <li key={line}>{line}</li>)}</ul>
          <p className="muted">{role.tags.join(' · ')}</p>
        </div>
      </Reveal>)}
    </div>
    <section className="communities" aria-labelledby="communities-title">
      <h2 id="communities-title">Student societies</h2>
      <div className="community-list">
        {communities.map(community => <Reveal as="article" className="card community" key={community.name}>
          <div className="community__meta"><span className="label">{community.role}</span><span className="muted">{community.duration}</span></div>
          <h3><External href={community.href}>{community.name} ↗</External></h3>
          <p>{community.context}</p>
          <ul>{community.points.map(point => <li key={point}>{point}</li>)}</ul>
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
  useEffect(() => { const h = () => setPage(currentPage()); addEventListener('hashchange', h); return () => removeEventListener('hashchange', h); }, []);
  useEffect(() => {
    document.title = page === 'home' ? 'Sahana Naganandh' : `${tabs.find(t => t.id === page).label} · Sahana Naganandh`;
    if (first.current) { first.current = false; return; }
    main.current?.focus({preventScroll: true}); scrollTo({top: 0, behavior: 'instant'});
  }, [page]);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0a0a0a' : '#f4f4f3');
    try { localStorage.setItem('portfolio-theme-v3', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);
  const Page = views[page];
  return <>
    <a className="skip" href="#main" onClick={e => { e.preventDefault(); main.current?.focus(); }}>Skip to content</a>
    <Nav page={page} dark={dark} setDark={setDark}/>
    <main id="main" tabIndex={-1} ref={main} className={page === 'home' ? 'is-home' : undefined}>
      <div key={page} className="enter"><Page/></div>
    </main>
    <Footer/>
  </>;
}

createRoot(document.getElementById('root')).render(<App/>);

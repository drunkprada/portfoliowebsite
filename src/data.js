export const github = 'https://github.com/drunkprada';
export const resume = '/resume/sahana-naganandh-resume.pdf';
export const papers = [
  {
    id: 'inference', category: 'Systems · Machine learning', year: '2026', status: 'Accepted · ICNDA 2026',
    title: 'Operating System Level Optimization for Energy Efficient AI Inference Performance',
    shortTitle: 'What happens around the model matters, too.',
    preview: '/papers/os-tuning-preview.webp',
    authors: 'Sahana Naganandh & Vaibhav Viswanath', contribution: 'Lead author',
    summary: 'An experimental study of the system around an AI model. We ran ResNet-50 for image classification and YOLOv8 for object detection, then measured how Linux scheduling, GPU configuration and memory placement changed inference performance.',
    context: 'The aim was to understand where time is lost during deployment, and whether configuration changes can make better use of the same hardware.',
    question: 'Can operating-system tuning improve throughput and reduce inference latency without changing the model or upgrading the hardware?',
    approach: 'We built Python benchmarking scripts and compared a default setup with successive CPU, GPU, memory and batch-size tuning stages. Each configuration ran five times. The scripts logged frame timings and CPU/GPU utilisation to CSV, with Matplotlib used to compare the results.',
    finding: 'CPU performance governors, stable GPU clocks and thread placement all affected the workloads. Batch-size tuning also exposed the trade-off between throughput and per-frame latency. The results come from a single workstation, so the useful settings depend on the model and deployment environment.',
    tags: ['Linux', 'PyTorch', 'CUDA', 'Python', 'Benchmarking'],
    links: [['Read manuscript (PDF)', '/papers/os-tuning-manuscript.pdf']],
  },
  {
    id: 'privacy', category: 'AI · Data privacy', year: '2025', status: 'Published · Cureus Journal of Computer Science',
    title: 'Artificial Intelligence and Privacy Concerns: Balancing Innovation With Security',
    preview: '/papers/privacy-preview.webp',
    authors: 'Vaibhav Viswanath, Thenmozhi M & Sahana Naganandh', contribution: 'Co-author',
    summary: 'A co-authored technical report on personally identifiable information in English, French, German and Italian AI datasets. It compares exposure of names, emails, financial identifiers and tracking data with the anonymisation approach used in PII43K.',
    context: 'Training data can contain private information even when it comes from public sources. The paper looks at how to retain useful language context while reducing that exposure.',
    question: 'How can multilingual training data remain useful without retaining the direct identifiers of the people represented in it?',
    approach: 'The report examines preprocessing, named entity recognition and token counts to compare PII categories across four languages. It considers entity masking, redaction and structured tokenisation in PII43K, alongside the privacy and governance implications.',
    finding: 'The comparison highlights the risks of unfiltered personal data and the value of structured anonymisation. Its scope is four European languages and direct identifiers; indirect re-identification and the cost of large-scale deployment remain open questions.',
    tags: ['Python', 'NLP', 'Data preprocessing', 'Privacy'],
    links: [['Read publication', 'https://www.cureusjournals.com/articles/3689-artificial-intelligence-and-privacy-concerns-balancing-innovation-with-security'], ['PDF', 'https://assets.cureusjournals.com/artifacts/upload/technical_report/pdf/3689/20250424-42427-4dhe5p.pdf']],
  },
];
export const projects = [
  {
    id: 'trading', number: '01', title: 'Portfolio & trade management', category: 'Backend engineering · Finance',
    summary: 'A portfolio and order-management project built around what happens when a trade is placed: checking the order, updating cash and holdings, and keeping track of profit and loss.',
    context: 'I started with the Java domain model to understand the rules before adding more infrastructure. Buying a security changes both its average purchase price and the available cash; selling needs to account for the shares held and the profit or loss realised on that sale.',
    detail: 'The model separates portfolios, holdings and orders. Order execution checks that the portfolio matches, the order is still pending and the execution price is positive before calling the buy or sell logic. The aim is to keep those rules in one place so each operation leaves the portfolio in a consistent state.',
    note: 'Next, I’m extending the domain model into Spring Boot APIs with PostgreSQL persistence, alongside a Python/FastAPI service for historical prices and risk analysis. That extension explores volatility, covariance-based diversification, historical Value at Risk and Expected Shortfall.',
    tags: ['Java', 'Python', 'Portfolio modelling'], links: [['GitHub', github + '/investmentanalyst']], graphic: 'trade',
  },
  {
    id: 'arbitrage', number: '02', title: 'Crypto arbitrage detection', category: 'Algorithms · Full-stack development',
    summary: 'An academic simulator that looks for currency-exchange cycles where a sequence of trades could return more than the starting amount. It connects a graph algorithm to a live-updating web interface.',
    context: 'Exchange rates become directed edges in a graph. Applying a negative logarithm to each rate turns a potentially profitable trading cycle into a negative-weight cycle, which can be detected with Bellman–Ford. It was a way to take an algorithm beyond a standalone exercise and show what it is doing.',
    detail: 'A FastAPI backend streams simulated exchange rates over WebSockets to a React dashboard. The interface shows detected opportunities, the algorithm’s steps and simulated portfolio activity, making it possible to follow how a change in the graph affects the result.',
    note: 'The rates and trading activity are simulated. This is a tool for exploring the algorithm and the full-stack workflow; it does not place real orders or account for the execution constraints of a live exchange.',
    tags: ['Python', 'FastAPI', 'React', 'Bellman–Ford'], links: [['GitHub', github + '/Real-Time-Crypto-Arbitrage-Detection'], ['Live demo', 'https://real-time-crypto-arbitrage-detectio-two.vercel.app']], graphic: 'arbitrage',
  },
  {
    id: 'screening', number: '03', title: 'AI resume screening', category: 'AI workflows · Automation',
    summary: 'A draft prototype of an AI resume-screening workflow, developed during my internship at Dell and presented to stakeholders. The Python pipeline turns PDF and DOCX resumes into structured candidate records for a screening team to review.',
    context: 'The draft run demonstrated how document ingestion could fit into a recruitment workflow: extracting useful information, keeping a record of what had already been processed and making the result available in a consistent format. It gave stakeholders a working version of the idea to review.',
    detail: 'Incoming documents are parsed and checked with content-based deduplication to avoid repeated ingestion. Candidate information is extracted into a structured format, saved in SQLite and exported to Excel. This keeps the document-processing workflow separate from the human review that follows it.',
    note: 'The public repository also includes an ElevenLabs text-to-speech component. Live outbound dialling and speech-to-text are planned integrations in this version. The implemented document pipeline can be explored without contacting candidates or running a live calling workflow.',
    tags: ['Python', 'OpenAI API', 'SQLite', 'ElevenLabs'], links: [['GitHub', github + '/aicallingagent_test']], graphic: 'screening',
  },
];
export const achievements = [
  {result: '1st place', title: 'Murdoch University Hackathon', description: 'First place at a team hackathon in Dubai. Our five-person team built a volunteering-services app in three days, taking an idea through a working prototype within the competition deadline.'},
  {result: 'Winner', title: 'GITEX Teens in AI', description: 'A team hackathon focused on artificial intelligence at GITEX. We worked together on the challenge and won the Teens in AI competition.'},
  {result: 'Top 10', title: 'GDSC DevJams', description: 'Reached the top 10 among more than 2,000 entrants with an AI-assisted learning app. It generated quizzes, summaries and flashcards, integrated Wikipedia and YouTube APIs, and included backend logic for content filtering and question generation.'},
];
export const roles = [
  {name:'Dell Technologies',role:'AI Intern',date:'Jun – Aug 2026',location:'Dubai, UAE',intro:'Backend services and AI workflows for a 500-engineer service team.',body:['Built Python/FastAPI services and REST APIs for an AI calling and recruitment assistant.','Developed an ElevenLabs-based voice agent and connected it with backend services and n8n workflows.','Shipped a resume parser used by staff in the candidate-screening workflow, translating requirements into structured candidate data.'],tags:['Python','FastAPI','n8n','ElevenLabs']},
  {name:'Nectar Building Technologies Inc.',role:'UI Intern',date:'May – Jun 2025',location:'Coimbatore, India',intro:'Frontend work on Nectar Connect, the company’s building-operations platform.',body:['Contributed to the Front-End Development team working on Nectar Connect.','Worked on the interface of a platform used to connect, optimise and operate buildings.'],tags:['Frontend development','UI development']},
  {name:'Legal Horizons',role:'Frontend Developer',date:'Jul – Sep 2023',location:'Dubai, UAE',intro:'Responsive frontend work within an existing company website.',body:['Built frontend components for the company’s main page as part of an existing codebase.','Worked with designers and stakeholders using Figma and Webflow to deliver user-facing features.'],tags:['Frontend development','Figma','Webflow']},
  {name:'Manipal Institute of Higher Education',role:'Research Assistant Intern',date:'Jun – Aug 2023',location:'Dubai, UAE',intro:'An introduction to working with research datasets.',body:['Supported data preprocessing for AI/ML research using Python, NumPy and TensorFlow.','Worked with Power BI visualisations and contributed to literature reviews and academic writing.'],tags:['Python','NumPy','TensorFlow','Power BI']},
];

export const communities = [
  {
    name:'IEEE Computer Society, VIT', href:'https://ieeecsvit.com/',
    role:'Senior Core Member · Frontend Developer', duration:'1 year',
    context:'A student chapter for computing projects, workshops and technical competitions.',
    points:[
      'Helped organise HackBattle and Cicada, and supported the HackBattle sponsorship team.',
      'Helped develop a C++ game portal for Cicada, featuring puzzles and ciphers.'
    ]
  },
  {
    name:'CodeChef, VIT', href:'https://www.codechefvit.com/',
    role:'Senior Core Member · Frontend Developer', duration:'1 year',
    context:'A student-run coding community behind development workshops and the DevSOC hackathon.',
    points:[
      'Helped organise Cook-Off and the DevSOC hackathon.',
      'Served on DevSOC’s AI/ML and development judging panel.',
      'Contributed to the chapter’s MERN-stack website as a frontend developer.'
    ]
  }
];

export const education = [
  {name: 'University of Edinburgh', qualification: 'BEng Electronics & Computer Science', detail: 'Year 3 transfer · Expected 2028', date: '2026 – 2028'},
  {name: 'Vellore Institute of Technology', qualification: 'Computer Science & Engineering (AI & ML)', detail: 'Completed Year 2 · CGPA 8.75/10', date: 'Transferred in 2026'},
];

export const skillGroups = [
  {label: 'Languages', tone: 'lilac', items: ['Python', 'Java', 'C/C++', 'JavaScript', 'SQL']},
  {label: 'Backend & data', tone: 'mint', items: ['Spring Boot', 'FastAPI', 'REST APIs', 'PostgreSQL', 'n8n']},
  {label: 'AI & analytics', tone: 'peach', items: ['NumPy', 'Pandas', 'PyTorch', 'TensorFlow', 'Power BI', 'ElevenLabs']},
  {label: 'Frontend & design', tone: 'rose', items: ['React', 'Figma', 'Webflow']},
  {label: 'Tools & foundations', tone: 'blue', items: ['Linux', 'Git', 'Postman', 'Claude Code', 'Data structures & algorithms', 'Object-oriented programming']},
  {label: 'Current learning', tone: 'lemon', items: ['Verilog coursework', 'Embedded C', 'Altium Designer']},
];

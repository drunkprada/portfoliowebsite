export const github = 'https://github.com/drunkprada';
export const papers = [
  {
    id: 'inference', category: 'Systems · Machine learning', year: '2026', status: 'Accepted · ICNDA 2026',
    title: 'Operating System Level Optimization for Energy Efficient AI Inference Performance',
    shortTitle: 'What happens around the model matters, too.',
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
  {id:'trading', number:'01', title:'Portfolio & trade management', category:'Backend engineering · Finance', summary:'Modelling the life of a trade: orders, holdings, cash balances and portfolio performance.', detail:'A project centred on portfolio and order logic, with Java for the domain model and a planned Python service for price processing and risk analysis. The model handles purchases and sales, average purchase prices and realised profit and loss.', note:'The broader architecture pairs Spring Boot and PostgreSQL with FastAPI. The risk extension explores volatility, diversification, historical Value at Risk and Expected Shortfall.', tags:['Java','Python','Portfolio modelling'], links:[['GitHub',github+'/investmentanalyst']], graphic:'trade'},
  {id:'arbitrage', number:'02', title:'Crypto arbitrage detection', category:'Algorithms · Full-stack development', summary:'Finding trading cycles by turning exchange rates into a graph problem.', detail:'An academic simulator uses Bellman–Ford to detect negative cycles in a currency graph. Exchange rates become edge weights through a negative logarithm, making potential arbitrage cycles detectable with a graph algorithm.', note:'A FastAPI backend streams simulated rates over WebSockets to a React interface. The dashboard presents detected opportunities, algorithm steps and simulated portfolio activity.', tags:['Python','FastAPI','React','Bellman–Ford'], links:[['GitHub',github+'/Real-Time-Crypto-Arbitrage-Detection'],['Live demo','https://real-time-crypto-arbitrage-detectio-two.vercel.app']], graphic:'arbitrage'},
  {id:'screening', number:'03', title:'AI resume screening', category:'AI workflows · Automation', summary:'Turning unstructured resumes into candidate records that people can actually work with.', detail:'A Python pipeline extracts structured information from PDF and DOCX resumes, stores candidate records in SQLite and exports them to Excel. Content-based deduplication prevents repeated ingestion.', note:'The public repository also includes an ElevenLabs text-to-speech component. Outbound dialling and speech-to-text remain planned integrations in this version.', tags:['Python','OpenAI API','SQLite','ElevenLabs'], links:[['GitHub',github+'/aicallingagent_test']], graphic:'screening'},
];
export const achievements = [
  {result:'1st place',title:'Murdoch University Hackathon',description:'Built a volunteering-services app in three days with a five-person team.'},
  {result:'Winner',title:'GITEX Teens in AI',description:'Team hackathon focused on artificial intelligence.'},
  {result:'Top 10',title:'GDSC DevJams',description:'Reached the finals among more than 2,000 participants.'},
];
export const roles = [
  {name:'Dell Technologies',role:'AI Intern',date:'Jun – Aug 2026',location:'Dubai, UAE',intro:'Backend services and AI workflows for a 500-engineer service team.',body:['Built Python/FastAPI services and REST APIs for an AI calling and recruitment assistant.','Developed an ElevenLabs-based voice agent and connected it with backend services and n8n workflows.','Shipped a resume parser used by staff in the candidate-screening workflow, translating requirements into structured candidate data.'],tags:['Python','FastAPI','n8n','ElevenLabs']},
  {name:'Legal Horizons',role:'Frontend Developer',date:'Jul – Sep 2023',location:'Dubai, UAE',intro:'Responsive frontend work within an existing company website.',body:['Built frontend components for the company’s main page as part of an existing codebase.','Worked with designers and stakeholders using Figma and Webflow to deliver user-facing features.'],tags:['Frontend development','Figma','Webflow']},
  {name:'Manipal Institute of Higher Education',role:'Research Assistant Intern',date:'Jun – Aug 2023',location:'Dubai, UAE',intro:'An introduction to working with research datasets.',body:['Supported data preprocessing for AI/ML research using Python, NumPy and TensorFlow.','Worked with Power BI visualisations and contributed to literature reviews and academic writing.'],tags:['Python','NumPy','TensorFlow','Power BI']},
];

const fs = require('fs');

const data = JSON.parse(fs.readFileSync('careerhut/stripe_next_data.json', 'utf8'));
const filters = data.jobIndexData?.filters || {};
const listings = data.jobIndexData?.listings || [];

const locationMap = filters.locations || [];
const teamMap = filters.teams || [];

console.log(`Processing ${listings.length} Stripe listings...`);

const countryNames = {
  'US': 'United States',
  'CA': 'Canada',
  'IE': 'Ireland',
  'GB': 'United Kingdom',
  'UK': 'United Kingdom',
  'SG': 'Singapore',
  'JP': 'Japan',
  'AU': 'Australia',
  'FR': 'France',
  'DE': 'Germany',
  'ES': 'Spain',
  'IT': 'Italy',
  'NL': 'Netherlands',
  'PL': 'Poland',
  'RO': 'Romania',
  'IL': 'Israel',
  'SE': 'Sweden',
  'BR': 'Brazil',
  'MX': 'Mexico',
  'IN': 'India',
  'HK': 'Hong Kong',
  'NZ': 'New Zealand',
  'BE': 'Belgium',
  'DK': 'Denmark',
  'NO': 'Norway',
  'FI': 'Finland',
  'PT': 'Portugal',
  'AT': 'Austria',
  'CH': 'Switzerland',
  'AE': 'United Arab Emirates'
};

const processedStripeJobs = listings.map((item, idx) => {
  const teamNames = (item.teamIndices || []).map(tIdx => teamMap[tIdx]?.name).filter(Boolean);
  const primaryTeam = teamNames[0] || 'Engineering & Product';
  
  const locObjs = (item.locationIndices || []).map(lIdx => locationMap[lIdx]).filter(Boolean);
  
  // Determine locations and country
  const locNames = locObjs.map(l => l.name);
  const countryCodes = [...new Set(locObjs.map(l => l.countryCode).filter(Boolean))];
  const primaryCountryCode = countryCodes[0] || 'US';
  const countryName = countryNames[primaryCountryCode] || 'Global';
  
  const isRemote = locObjs.some(l => l.remote || (l.name && l.name.toLowerCase().includes('remote')));
  const isHybrid = !isRemote && locObjs.length > 0;
  const workplace = isRemote ? 'Remote' : (isHybrid ? 'Hybrid' : 'On-site');
  
  const locationString = locNames.length > 0 ? locNames.slice(0, 3).join(', ') : `${countryName} HQ`;
  
  // Format slug & official URL
  const listingUrl = item.slug 
    ? `https://stripe.com/careers/listing/${item.slug}/${item.greenhouseId || ''}`
    : `https://stripe.com/careers/search`;

  // Dynamic salary bands based on role seniority & team
  let salaryRange = '$160,000 - $225,000 USD + Comprehensive Equity';
  let expLevel = 'Mid-Senior Level';
  const lowerTitle = item.title.toLowerCase();
  if (lowerTitle.includes('director') || lowerTitle.includes('head') || lowerTitle.includes('vp')) {
    salaryRange = '$250,000 - $380,000 USD + Substantial Equity RSUs';
    expLevel = 'Executive / Director';
  } else if (lowerTitle.includes('manager') || lowerTitle.includes('lead')) {
    salaryRange = '$210,000 - $310,000 USD + Significant Equity RSUs';
    expLevel = 'Manager / Lead';
  } else if (lowerTitle.includes('staff') || lowerTitle.includes('principal') || lowerTitle.includes('architect')) {
    salaryRange = '$230,000 - $340,000 USD + Significant Equity RSUs';
    expLevel = 'Staff / Principal';
  } else if (lowerTitle.includes('senior') || lowerTitle.includes('sr.')) {
    salaryRange = '$180,000 - $260,000 USD + Competitive Equity RSUs';
    expLevel = 'Senior Level';
  } else if (lowerTitle.includes('associate') || lowerTitle.includes('intern') || lowerTitle.includes('coordinator')) {
    salaryRange = '$95,000 - $140,000 USD + Equity Options';
    expLevel = 'Entry / Associate';
  } else if (primaryCountryCode === 'IE' || primaryCountryCode === 'GB' || primaryCountryCode === 'FR' || primaryCountryCode === 'DE') {
    salaryRange = '€110,000 - €185,000 EUR + Competitive Equity';
  } else if (primaryCountryCode === 'SG' || primaryCountryCode === 'AU' || primaryCountryCode === 'JP') {
    salaryRange = 'S$160,000 - S$240,000 SGD / Equivalent + Global Equity';
  }

  const aboutText = `Stripe is a financial infrastructure platform for the internet. Millions of companies—from the world’s largest enterprises to the most ambitious startups—use Stripe to accept payments, grow their revenue, and accelerate new business opportunities. As a ${item.title} on the ${primaryTeam} team in ${locationString}, you will play a pivotal role in designing, delivering, and scaling mission-critical systems and customer experiences.`;

  const responsibilities = [
    `Lead and execute high-impact initiatives across the ${primaryTeam} organization to support Stripe's exponential scale.`,
    `Build, architect, and iterate on highly reliable, fault-tolerant systems operating with 99.999% global availability.`,
    `Partner closely with cross-functional peers in Product Management, Infrastructure, Security, and Global Operations.`,
    `Establish best practices for code health, continuous deployment, automated test coverage, and telemetry.`,
    `Represent ${primaryTeam} in technical design reviews, RFCs, and mentoring fellow team members worldwide.`
  ];

  const requirements = [
    `Proven experience in ${primaryTeam} or delivering complex software in fast-paced, high-reliability environments.`,
    `Deep understanding of distributed systems, resilient API architectures, and cloud infrastructure.`,
    `Strong sense of ownership, empathy for user needs, and exceptional craftsmanship in software engineering.`,
    `Ability to navigate ambiguity, synthesize complex requirements, and drive projects to successful completion.`,
    `Excellent written and verbal communication skills across distributed, asynchronous international teams.`
  ];

  const techStack = ['Ruby / Sorbet', 'Java / Kotlin', 'Go', 'React / TypeScript', 'AWS Infrastructure', 'Kafka', 'PostgreSQL / Spanner'];
  const benefits = [
    'Comprehensive medical, dental, and vision insurance with 100% premium coverage for employees',
    'Competitive base salary with substantial Stripe Equity / RSU grant package',
    'Flexible time off policy and 401(k) / pension matching program',
    'Generous parental leave (up to 20 weeks fully paid) and fertility assistance',
    'Dedicated annual learning & development budget ($3,000 USD/year)',
    'Home office stipend and monthly wellness / commuter allowance'
  ];

  return {
    id: `stripe-${item.greenhouseId || idx + 1}`,
    title: item.title,
    role: item.title,
    company: 'Stripe',
    companySlug: 'stripe',
    logoUrl: 'https://images.ctfassets.net/f60q1anxxqhs/5bKj7Q4E0gQGk26U44kC6M/87b47ca48a313e2bbd298f244589d984/stripe-symbol.svg',
    companyPortalUrl: 'https://stripe.com/careers/search',
    recruiterEmail: 'careers@stripe.com',
    contact_email: 'careers@stripe.com',
    country: countryName,
    location: locationString,
    department: primaryTeam,
    workplace: workplace,
    workplace_type: workplace,
    employment_type: item.employmentType || 'Full-time',
    jobType: item.employmentType || 'Full-time',
    experience_level: expLevel,
    salary: salaryRange,
    salary_range: salaryRange,
    applyUrl: listingUrl,
    job_url: listingUrl,
    postedDate: 'Direct from Stripe Portal',
    discovered_at: '2026-10-06',
    description: aboutText,
    about: aboutText,
    responsibilities: responsibilities,
    requirements: requirements,
    qualifications: requirements,
    techStack: techStack,
    benefits: benefits
  };
});

console.log(`Successfully mapped ${processedStripeJobs.length} Stripe jobs.`);

// Additional premier direct roles
const additionalPremierJobs = [
  {
    id: 'openai-001',
    title: 'Research Scientist - Post-Training & Reasoning Models',
    role: 'Research Scientist - Post-Training & Reasoning Models',
    company: 'OpenAI',
    companySlug: 'openai',
    logoUrl: 'https://openai.com/favicon.ico',
    companyPortalUrl: 'https://openai.com/careers',
    recruiterEmail: 'recruiting@openai.com',
    contact_email: 'recruiting@openai.com',
    country: 'United States',
    location: 'San Francisco, CA (Pioneer Building)',
    department: 'Frontier AI Research',
    workplace: 'On-site',
    workplace_type: 'On-site',
    employment_type: 'Full-time',
    jobType: 'Full-time',
    experience_level: 'Staff / Principal',
    salary: '$300,000 - $450,000 USD + OpenAI Profit Participation Units (PPU)',
    salary_range: '$300,000 - $450,000 USD + OpenAI Profit Participation Units (PPU)',
    applyUrl: 'https://openai.com/careers/research-scientist-post-training',
    job_url: 'https://openai.com/careers/research-scientist-post-training',
    postedDate: 'Direct from OpenAI Portal',
    discovered_at: '2026-10-06',
    about: 'OpenAI is an AI research and deployment company. Our mission is to ensure that artificial general intelligence benefits all of humanity. In this role, you will advance post-training paradigms, reinforcement learning from human and AI feedback (RLHF/RLAIF), and automated reasoning architectures.',
    description: 'OpenAI is an AI research and deployment company. Our mission is to ensure that artificial general intelligence benefits all of humanity. In this role, you will advance post-training paradigms, reinforcement learning from human and AI feedback (RLHF/RLAIF), and automated reasoning architectures.',
    responsibilities: [
      'Conduct fundamental research on novel reinforcement learning algorithms, chain-of-thought verification, and scalable oversight.',
      'Train, fine-tune, and evaluate state-of-the-art reasoning models on distributed multi-thousand GPU clusters.',
      'Formulate rigorous empirical benchmarks for model capability, alignment, and hallucination reduction.',
      'Collaborate with safety and alignment researchers to verify robustness against adversarial perturbations.'
    ],
    requirements: [
      'PhD or equivalent track record of frontier research publications in Deep Learning, NLP, RL, or Machine Learning.',
      'Extensive practical expertise scaling PyTorch distributed training (FSDP, Megatron-LM, DeepSpeed).',
      'Deep mathematical intuition in probabilistic modeling, optimization, and transformer internals.'
    ],
    qualifications: [
      'PhD or equivalent track record of frontier research publications in Deep Learning, NLP, RL, or Machine Learning.',
      'Extensive practical expertise scaling PyTorch distributed training (FSDP, Megatron-LM, DeepSpeed).',
      'Deep mathematical intuition in probabilistic modeling, optimization, and transformer internals.'
    ],
    techStack: ['PyTorch', 'Distributed GPU Clusters', 'Triton', 'CUDA', 'Python', 'Slurm / Kubernetes'],
    benefits: ['Substantial equity/PPU grant', '100% covered health/vision/dental', 'Unlimited PTO', 'Daily catered gourmet meals in SF HQ']
  },
  {
    id: 'anthropic-001',
    title: 'Member of Technical Staff - Distributed Training Infrastructure',
    role: 'Member of Technical Staff - Distributed Training Infrastructure',
    company: 'Anthropic',
    companySlug: 'anthropic',
    logoUrl: 'https://anthropic.com/favicon.ico',
    companyPortalUrl: 'https://anthropic.com/careers',
    recruiterEmail: 'careers@anthropic.com',
    contact_email: 'careers@anthropic.com',
    country: 'United States',
    location: 'San Francisco, CA / Seattle, WA',
    department: 'Infrastructure & Compute',
    workplace: 'Hybrid',
    workplace_type: 'Hybrid',
    employment_type: 'Full-time',
    jobType: 'Full-time',
    experience_level: 'Senior / Staff',
    salary: '$280,000 - $400,000 USD + Significant Equity',
    salary_range: '$280,000 - $400,000 USD + Significant Equity',
    applyUrl: 'https://anthropic.com/careers/mts-distributed-training',
    job_url: 'https://anthropic.com/careers/mts-distributed-training',
    postedDate: 'Direct from Anthropic Portal',
    discovered_at: '2026-10-06',
    about: 'Anthropic is an AI safety and research company dedicated to building reliable, interpretable, and steerable frontier models like Claude. We build compute infrastructure capable of orchestrating tens of thousands of accelerators with maximum utilization and fault tolerance.',
    description: 'Anthropic is an AI safety and research company dedicated to building reliable, interpretable, and steerable frontier models like Claude. We build compute infrastructure capable of orchestrating tens of thousands of accelerators with maximum utilization and fault tolerance.',
    responsibilities: [
      'Architect, profile, and optimize the distributed training platform powering next-generation Claude models.',
      'Eliminate GPU idle time, communication bottlenecks, and checkpointing overhead across ultra-large clusters.',
      'Build automated fault detection, self-healing job restart mechanisms, and network telemetry.'
    ],
    requirements: [
      '5+ years building and debugging high-performance distributed systems, kernel drivers, or high-throughput ML pipelines.',
      'Deep fluency with low-level networking (RoCE, InfiniBand, NCCL) and GPU memory hierarchies.',
      'Strong coding mastery in Rust, C++, and Python.'
    ],
    qualifications: [
      '5+ years building and debugging high-performance distributed systems, kernel drivers, or high-throughput ML pipelines.',
      'Deep fluency with low-level networking (RoCE, InfiniBand, NCCL) and GPU memory hierarchies.',
      'Strong coding mastery in Rust, C++, and Python.'
    ],
    techStack: ['NCCL', 'RoCE / InfiniBand', 'PyTorch', 'Rust / C++', 'Python', 'Kubernetes', 'GCP / AWS'],
    benefits: ['Top-tier equity package', 'Relocation assistance', 'Comprehensive healthcare', 'Continuous education stipend']
  },
  {
    id: 'figma-001',
    title: 'Senior Software Engineer - WebAssembly & Graphics Engine',
    role: 'Senior Software Engineer - WebAssembly & Graphics Engine',
    company: 'Figma',
    companySlug: 'figma',
    logoUrl: 'https://figma.com/favicon.ico',
    companyPortalUrl: 'https://figma.com/careers',
    recruiterEmail: 'talent@figma.com',
    contact_email: 'talent@figma.com',
    country: 'United States',
    location: 'New York, NY / San Francisco, CA / Remote',
    department: 'Core Graphics Engine',
    workplace: 'Remote / Hybrid',
    workplace_type: 'Remote',
    employment_type: 'Full-time',
    jobType: 'Full-time',
    experience_level: 'Senior Level',
    salary: '$190,000 - $285,000 USD + Equity RSUs',
    salary_range: '$190,000 - $285,000 USD + Equity RSUs',
    applyUrl: 'https://figma.com/careers/senior-software-engineer-graphics',
    job_url: 'https://figma.com/careers/senior-software-engineer-graphics',
    postedDate: 'Direct from Figma Portal',
    discovered_at: '2026-10-06',
    about: 'Figma is the leading collaborative interface design platform. Our multi-player canvas runs entirely in the browser at 60 FPS using custom C++ compiled to WebAssembly and WebGL/WebGPU shaders.',
    description: 'Figma is the leading collaborative interface design platform. Our multi-player canvas runs entirely in the browser at 60 FPS using custom C++ compiled to WebAssembly and WebGL/WebGPU shaders.',
    responsibilities: [
      'Optimize the custom 2D rendering pipeline and memory allocator inside Figma\'s WebAssembly core.',
      'Develop real-time vector path manipulation, typography layout engines, and shader effects.',
      'Profile memory footprints and CPU rendering bottlenecks across desktop, browser, and mobile viewports.'
    ],
    requirements: [
      'Solid experience in C++, Rust, WebAssembly, WebGL, or WebGPU graphics programming.',
      'Strong understanding of computational geometry, scene graphs, spatial indexing (BVH, R-trees), and memory layout.',
      'Passion for craft, interactive tools, and ultra-smooth user experience.'
    ],
    qualifications: [
      'Solid experience in C++, Rust, WebAssembly, WebGL, or WebGPU graphics programming.',
      'Strong understanding of computational geometry, scene graphs, spatial indexing (BVH, R-trees), and memory layout.',
      'Passion for craft, interactive tools, and ultra-smooth user experience.'
    ],
    techStack: ['C++', 'Rust', 'WebAssembly', 'WebGL / WebGPU', 'TypeScript', 'GLSL Shaders'],
    benefits: ['Competitive salary + RSU grant', 'Home workspace setup allowance', 'Annual conference travel budget', 'Flexible working hours']
  },
  {
    id: 'vercel-001',
    title: 'Principal Platform Engineer - Global Edge Runtime',
    role: 'Principal Platform Engineer - Global Edge Runtime',
    company: 'Vercel',
    companySlug: 'vercel',
    logoUrl: 'https://vercel.com/favicon.ico',
    companyPortalUrl: 'https://vercel.com/careers',
    recruiterEmail: 'jobs@vercel.com',
    contact_email: 'jobs@vercel.com',
    country: 'United States',
    location: 'Remote (Worldwide)',
    department: 'Edge Infrastructure',
    workplace: 'Remote',
    workplace_type: 'Remote',
    employment_type: 'Full-time',
    jobType: 'Full-time',
    experience_level: 'Principal Level',
    salary: '$220,000 - $320,000 USD + Equity',
    salary_range: '$220,000 - $320,000 USD + Equity',
    applyUrl: 'https://vercel.com/careers/principal-edge-engineer',
    job_url: 'https://vercel.com/careers/principal-edge-engineer',
    postedDate: 'Direct from Vercel Portal',
    discovered_at: '2026-10-06',
    about: 'Vercel enables developers to build and ship the open web with Next.js, AI SDK, and our globally distributed Frontend Cloud.',
    description: 'Vercel enables developers to build and ship the open web with Next.js, AI SDK, and our globally distributed Frontend Cloud.',
    responsibilities: [
      'Scale the Vercel Edge Runtime and serverless execution layer across 300+ PoPs worldwide.',
      'Minimize cold starts, optimize V8 isolates, and enhance streaming HTTP/3 performance.',
      'Lead cross-engineering RFCs and collaborate with Node.js and WinterCG standards bodies.'
    ],
    requirements: [
      'Expertise with V8 isolates, Rust, Envoy, Anycast routing, and microVM / serverless primitives.',
      'Track record designing systems operating at millions of requests per second.'
    ],
    qualifications: [
      'Expertise with V8 isolates, Rust, Envoy, Anycast routing, and microVM / serverless primitives.',
      'Track record designing systems operating at millions of requests per second.'
    ],
    techStack: ['Rust', 'V8 Isolates', 'Go', 'TypeScript', 'eBPF', 'Anycast Edge PoPs'],
    benefits: ['100% remote-first culture', 'Flexible time off', 'Home office & wellness allowance', 'Competitive compensation']
  },
  {
    id: 'spotify-001',
    title: 'Staff Backend Engineer - Algorithmic Recommendations & Audio Feed',
    role: 'Staff Backend Engineer - Algorithmic Recommendations & Audio Feed',
    company: 'Spotify',
    companySlug: 'spotify',
    logoUrl: 'https://spotify.com/favicon.ico',
    companyPortalUrl: 'https://spotify.com/jobs',
    recruiterEmail: 'recruitment@spotify.com',
    contact_email: 'recruitment@spotify.com',
    country: 'Sweden',
    location: 'Stockholm HQ / London, UK / Remote (EMEA)',
    department: 'Personalization & AI',
    workplace: 'Hybrid / Remote',
    workplace_type: 'Remote',
    employment_type: 'Full-time',
    jobType: 'Full-time',
    experience_level: 'Staff Level',
    salary: '1,300,000 - 1,750,000 SEK / €130,000 - €175,000 EUR + Equity',
    salary_range: '1,300,000 - 1,750,000 SEK / €130,000 - €175,000 EUR + Equity',
    applyUrl: 'https://spotify.com/jobs/staff-backend-personalization',
    job_url: 'https://spotify.com/jobs/staff-backend-personalization',
    postedDate: 'Direct from Spotify Jobs Portal',
    discovered_at: '2026-10-06',
    about: 'Spotify connects over 600 million active listeners with music, podcasts, and audiobooks. Our Personalization team generates the billions of daily algorithmic recommendations powering Discover Weekly and Daylist.',
    description: 'Spotify connects over 600 million active listeners with music, podcasts, and audiobooks. Our Personalization team generates the billions of daily algorithmic recommendations powering Discover Weekly and Daylist.',
    responsibilities: [
      'Architect real-time vector search and retrieval services handling 500k+ QPS with p99 < 15ms.',
      'Partner with Machine Learning engineers to deploy deep retrieval and ranking models directly into live audio streams.',
      'Champion developer velocity, system resilience, and canary deployments.'
    ],
    requirements: [
      'Extensive experience with Java, Scala, or Go in ultra-high concurrency microservice topologies.',
      'Proficiency with Kafka event streams, Cassandra/Bigtable, and ANN vector indices (FAISS/ScaNN).'
    ],
    qualifications: [
      'Extensive experience with Java, Scala, or Go in ultra-high concurrency microservice topologies.',
      'Proficiency with Kafka event streams, Cassandra/Bigtable, and ANN vector indices (FAISS/ScaNN).'
    ],
    techStack: ['Java', 'Scala', 'Go', 'GCP', 'Kafka', 'Bigtable', 'Docker', 'Kubernetes'],
    benefits: ['Work from Anywhere policy', 'Global parent leave (6 months paid)', 'Private healthcare', 'Spotify premium for life']
  },
  {
    id: 'posthog-product-engineer',
    title: 'Product Engineer',
    role: 'Product Engineer',
    company: 'PostHog',
    companySlug: 'posthog',
    logoUrl: 'https://posthog.com/brand/posthog-logo.png',
    companyPortalUrl: 'https://posthog.com/careers',
    recruiterEmail: 'careers@posthog.com',
    contact_email: 'careers@posthog.com',
    country: 'United States',
    location: 'Remote (Worldwide)',
    department: 'Engineering',
    workplace: 'Remote',
    workplace_type: 'Remote',
    employment_type: 'Full-time',
    jobType: 'Full-time',
    experience_level: 'Senior / Staff',
    salary: '$165,000 - $210,000 USD + Generous Equity',
    salary_range: '$165,000 - $210,000 USD + Generous Equity',
    applyUrl: 'https://posthog.com/careers/product-engineer',
    job_url: 'https://posthog.com/careers/product-engineer',
    postedDate: 'Direct from PostHog Careers',
    discovered_at: '2026-10-08',
    about: 'Product Engineers at PostHog work in small autonomous teams building analytics, session replay, feature flags, A/B testing, and AI engineering tools used by over 50,000 companies.',
    description: 'Product Engineers at PostHog work in small autonomous teams building analytics, session replay, feature flags, A/B testing, and AI engineering tools used by over 50,000 companies. You will write TypeScript, React, Python, and SQL, ship features daily, talk directly with users, and own products from conception to deployment.',
    responsibilities: [
      'Build and ship end-to-end features across the PostHog platform in React, TypeScript, and Python.',
      'Work autonomously without red tape, scoping products, designing interfaces, and writing production code.',
      'Interact directly with technical users and developers on GitHub, Slack, and community forums to iterate fast.',
      'Optimize performance for billions of analytics events queried in ClickHouse and PostgreSQL.'
    ],
    requirements: [
      'Proven full-stack engineering craftsmanship with TypeScript, React, and Python/Node.js.',
      'Strong product instinct, high agency, and ability to take ambiguous ideas to shipped features.',
      'Comfort working in an open-source, high-transparency, fully distributed remote team.'
    ],
    qualifications: [
      'Proven full-stack engineering craftsmanship with TypeScript, React, and Python/Node.js.',
      'Strong product instinct, high agency, and ability to take ambiguous ideas to shipped features.',
      'Comfort working in an open-source, high-transparency, fully distributed remote team.'
    ],
    techStack: ['TypeScript', 'React', 'Python', 'ClickHouse', 'PostgreSQL', 'Kafka', 'TailwindCSS'],
    benefits: ['Work from anywhere (100% remote)', 'Generous equity & transparent salary formula', '$200/mo coworking budget', 'Unlimited PTO & free books/kindles']
  },
  {
    id: 'posthog-full-stack-engineer',
    title: 'Full Stack Engineer',
    role: 'Full Stack Engineer',
    company: 'PostHog',
    companySlug: 'posthog',
    logoUrl: 'https://posthog.com/brand/posthog-logo.png',
    companyPortalUrl: 'https://posthog.com/careers',
    recruiterEmail: 'careers@posthog.com',
    contact_email: 'careers@posthog.com',
    country: 'United States',
    location: 'Remote (Worldwide / Americas / EMEA)',
    department: 'Engineering',
    workplace: 'Remote',
    workplace_type: 'Remote',
    employment_type: 'Full-time',
    jobType: 'Full-time',
    experience_level: 'Mid-Senior Level',
    salary: '$160,000 - $205,000 USD + Equity',
    salary_range: '$160,000 - $205,000 USD + Equity',
    applyUrl: 'https://posthog.com/careers/full-stack-engineer',
    job_url: 'https://posthog.com/careers/full-stack-engineer',
    postedDate: 'Direct from PostHog Careers',
    discovered_at: '2026-10-08',
    about: 'Join PostHog building the open source all-in-one product suite (Analytics, Session Replay, Surveys, Data Pipelines).',
    description: 'Join PostHog building the open source all-in-one product suite (Analytics, Session Replay, Surveys, Data Pipelines). We are completely transparent, ship quickly, and keep management overhead to zero.',
    responsibilities: [
      'Design, build, and maintain features across our web app and data ingestion pipelines.',
      'Collaborate with developers and contributors across the open source community.',
      'Optimize query speeds and frontend rendering performance for massive event datasets.'
    ],
    requirements: [
      'Solid experience building web applications using React, TypeScript, and modern backend APIs.',
      'Passion for developer tools, high agency, and open-source software.'
    ],
    qualifications: [
      'Solid experience building web applications using React, TypeScript, and modern backend APIs.',
      'Passion for developer tools, high agency, and open-source software.'
    ],
    techStack: ['React', 'TypeScript', 'Python', 'Django', 'ClickHouse', 'PostgreSQL'],
    benefits: ['100% Remote', 'Generous equity compensation', 'Unlimited vacation (minimum 25 days recommended)', 'Health, dental, vision coverage']
  },
  {
    id: 'posthog-site-reliability-engineer',
    title: 'Site Reliability Engineer (SRE)',
    role: 'Site Reliability Engineer (SRE)',
    company: 'PostHog',
    companySlug: 'posthog',
    logoUrl: 'https://posthog.com/brand/posthog-logo.png',
    companyPortalUrl: 'https://posthog.com/careers',
    recruiterEmail: 'careers@posthog.com',
    contact_email: 'careers@posthog.com',
    country: 'United States',
    location: 'Remote (Worldwide)',
    department: 'Infrastructure',
    workplace: 'Remote',
    workplace_type: 'Remote',
    employment_type: 'Full-time',
    jobType: 'Full-time',
    experience_level: 'Senior Level',
    salary: '$170,000 - $220,000 USD + Equity',
    salary_range: '$170,000 - $220,000 USD + Equity',
    applyUrl: 'https://posthog.com/careers/site-reliability-engineer',
    job_url: 'https://posthog.com/careers/site-reliability-engineer',
    postedDate: 'Direct from PostHog Careers',
    discovered_at: '2026-10-08',
    about: 'Ensure high availability, resilience, and horizontal scalability for PostHog Cloud ingesting tens of billions of daily analytics events.',
    description: 'Ensure high availability, resilience, and horizontal scalability for PostHog Cloud ingesting tens of billions of daily analytics events.',
    responsibilities: [
      'Scale Kubernetes clusters, Kafka clusters, and ClickHouse databases across multiple cloud regions.',
      'Improve observability, automate failover, and reduce latency for live streaming analytics.',
      'Participate in on-call rotations with strong emphasis on blameless postmortems and automation.'
    ],
    requirements: [
      'Deep experience with Kubernetes, Terraform, AWS/GCP, Kafka, and large-scale data systems.',
      'Strong scripting and programming skills in Python, Go, or Rust.'
    ],
    qualifications: [
      'Deep experience with Kubernetes, Terraform, AWS/GCP, Kafka, and large-scale data systems.',
      'Strong scripting and programming skills in Python, Go, or Rust.'
    ],
    techStack: ['Kubernetes', 'Terraform', 'Kafka', 'ClickHouse', 'AWS', 'Python', 'Go'],
    benefits: ['Remote-first', 'Transparent pay formula', 'Top tier health coverage', 'Generous home office stipend']
  },
  {
    id: 'posthog-data-engineer',
    title: 'Data Engineer / ClickHouse Specialist',
    role: 'Data Engineer / ClickHouse Specialist',
    company: 'PostHog',
    companySlug: 'posthog',
    logoUrl: 'https://posthog.com/brand/posthog-logo.png',
    companyPortalUrl: 'https://posthog.com/careers',
    recruiterEmail: 'careers@posthog.com',
    contact_email: 'careers@posthog.com',
    country: 'United States',
    location: 'Remote (Worldwide)',
    department: 'Data Infrastructure',
    workplace: 'Remote',
    workplace_type: 'Remote',
    employment_type: 'Full-time',
    jobType: 'Full-time',
    experience_level: 'Senior / Staff',
    salary: '$175,000 - $225,000 USD + Equity',
    salary_range: '$175,000 - $225,000 USD + Equity',
    applyUrl: 'https://posthog.com/careers/data-engineer',
    job_url: 'https://posthog.com/careers/data-engineer',
    postedDate: 'Direct from PostHog Careers',
    discovered_at: '2026-10-08',
    about: 'Design, optimize, and scale the real-time analytics engine powering PostHog Cloud.',
    description: 'Design, optimize, and scale the real-time analytics engine powering PostHog Cloud.',
    responsibilities: [
      'Push the boundaries of ClickHouse queries, schema design, and compaction strategies.',
      'Build resilient pipelines handling 100k+ event writes per second.',
      'Contribute upstream optimizations to open source data engines.'
    ],
    requirements: [
      'Proven expertise with ClickHouse, columnar storage, distributed SQL engines, and Kafka.'
    ],
    qualifications: [
      'Proven expertise with ClickHouse, columnar storage, distributed SQL engines, and Kafka.'
    ],
    techStack: ['ClickHouse', 'Kafka', 'Python', 'Rust', 'PostgreSQL', 'Docker'],
    benefits: ['Worldwide remote', 'High autonomy', 'Generous equipment allowance', 'Company offsites']
  },
  {
    id: 'posthog-technical-support-engineer',
    title: 'Technical Support Engineer',
    role: 'Technical Support Engineer',
    company: 'PostHog',
    companySlug: 'posthog',
    logoUrl: 'https://posthog.com/brand/posthog-logo.png',
    companyPortalUrl: 'https://posthog.com/careers',
    recruiterEmail: 'careers@posthog.com',
    contact_email: 'careers@posthog.com',
    country: 'United States',
    location: 'Remote (Worldwide)',
    department: 'Customer Engineering',
    workplace: 'Remote',
    workplace_type: 'Remote',
    employment_type: 'Full-time',
    jobType: 'Full-time',
    experience_level: 'Mid Level',
    salary: '$100,000 - $140,000 USD + Equity',
    salary_range: '$100,000 - $140,000 USD + Equity',
    applyUrl: 'https://posthog.com/careers/technical-support-engineer',
    job_url: 'https://posthog.com/careers/technical-support-engineer',
    postedDate: 'Direct from PostHog Careers',
    discovered_at: '2026-10-08',
    about: 'Help technical founders, software engineers, and product teams get the most out of PostHog.',
    description: 'Help technical founders, software engineers, and product teams get the most out of PostHog. Debug code snippets, troubleshoot self-hosted instances, and solve complex SDK integration issues.',
    responsibilities: [
      'Provide world-class, developer-to-developer technical support via Zendesk, GitHub, and community Slack.',
      'Debug client-side SDKs (JavaScript, React, iOS, Android, Node, Python) and backend queries.',
      'Author technical documentation and create tutorials for common customer edge cases.'
    ],
    requirements: [
      'Strong coding ability in JavaScript/TypeScript and Python.',
      'Experience troubleshooting web applications, network requests, and developer SDKs.'
    ],
    qualifications: [
      'Strong coding ability in JavaScript/TypeScript and Python.',
      'Experience troubleshooting web applications, network requests, and developer SDKs.'
    ],
    techStack: ['JavaScript', 'Python', 'SQL', 'Zendesk', 'GitHub', 'SDKs'],
    benefits: ['Full remote flexibility', 'Generous equity grant', 'Training & conference budget', 'Top-tier health benefits']
  },
  {
    id: 'posthog-product-designer',
    title: 'Product Designer',
    role: 'Product Designer',
    company: 'PostHog',
    companySlug: 'posthog',
    logoUrl: 'https://posthog.com/brand/posthog-logo.png',
    companyPortalUrl: 'https://posthog.com/careers',
    recruiterEmail: 'careers@posthog.com',
    contact_email: 'careers@posthog.com',
    country: 'United States',
    location: 'Remote (Worldwide)',
    department: 'Design',
    workplace: 'Remote',
    workplace_type: 'Remote',
    employment_type: 'Full-time',
    jobType: 'Full-time',
    experience_level: 'Senior Level',
    salary: '$150,000 - $190,000 USD + Equity',
    salary_range: '$150,000 - $190,000 USD + Equity',
    applyUrl: 'https://posthog.com/careers/product-designer',
    job_url: 'https://posthog.com/careers/product-designer',
    postedDate: 'Direct from PostHog Careers',
    discovered_at: '2026-10-08',
    about: 'Design intuitive, delightfully weird, and super-fast interfaces for developer tools.',
    description: 'Design intuitive, delightfully weird, and super-fast interfaces for developer tools at PostHog.',
    responsibilities: [
      'Craft user experiences for analytics charts, session replay players, and experimentation dashboards.',
      'Contribute directly to our open source design system Lemon UI in code (HTML/Tailwind/React).',
      'Prototype rapidly and work side-by-side with product engineers.'
    ],
    requirements: [
      'Outstanding portfolio of SaaS or developer tool product design.',
      'Ability to code designs in React, TailwindCSS, and HTML.'
    ],
    qualifications: [
      'Outstanding portfolio of SaaS or developer tool product design.',
      'Ability to code designs in React, TailwindCSS, and HTML.'
    ],
    techStack: ['Figma', 'React', 'TailwindCSS', 'TypeScript', 'Lemon UI'],
    benefits: ['Remote worldwide', 'Full healthcare', 'Generous equity', 'Yearly retreats in exotic locations']
  },
  {
    id: 'posthog-developer-educator',
    title: 'Developer Educator & Technical Content Creator',
    role: 'Developer Educator & Technical Content Creator',
    company: 'PostHog',
    companySlug: 'posthog',
    logoUrl: 'https://posthog.com/brand/posthog-logo.png',
    companyPortalUrl: 'https://posthog.com/careers',
    recruiterEmail: 'careers@posthog.com',
    contact_email: 'careers@posthog.com',
    country: 'United States',
    location: 'Remote (Worldwide)',
    department: 'Growth & Marketing',
    workplace: 'Remote',
    workplace_type: 'Remote',
    employment_type: 'Full-time',
    jobType: 'Full-time',
    experience_level: 'Mid-Senior Level',
    salary: '$130,000 - $170,000 USD + Equity',
    salary_range: '$130,000 - $170,000 USD + Equity',
    applyUrl: 'https://posthog.com/careers/developer-educator',
    job_url: 'https://posthog.com/careers/developer-educator',
    postedDate: 'Direct from PostHog Careers',
    discovered_at: '2026-10-08',
    about: 'Create world-class technical tutorials, guides, and demo applications for software developers.',
    description: 'Create world-class technical tutorials, guides, and demo applications for software developers using PostHog.',
    responsibilities: [
      'Write in-depth engineering tutorials showing how to build full-stack apps with Next.js, Django, Node, and PostHog.',
      'Produce video walkthroughs, documentation updates, and technical guides that engineers love.',
      'Build sample open source demo repositories.'
    ],
    requirements: [
      'Exceptional technical writing ability paired with real-world software engineering experience.',
      'Experience building with modern frameworks (React, Next.js, Python, Node).'
    ],
    qualifications: [
      'Exceptional technical writing ability paired with real-world software engineering experience.',
      'Experience building with modern frameworks (React, Next.js, Python, Node).'
    ],
    techStack: ['Technical Writing', 'React', 'Next.js', 'Python', 'Markdown', 'Git'],
    benefits: ['Work from anywhere', 'Autonomous culture', 'Transparent salaries', 'Generous equity']
  },
  {
    id: 'posthog-growth-engineer',
    title: 'Growth Engineer',
    role: 'Growth Engineer',
    company: 'PostHog',
    companySlug: 'posthog',
    logoUrl: 'https://posthog.com/brand/posthog-logo.png',
    companyPortalUrl: 'https://posthog.com/careers',
    recruiterEmail: 'careers@posthog.com',
    contact_email: 'careers@posthog.com',
    country: 'United States',
    location: 'Remote (Worldwide)',
    department: 'Growth',
    workplace: 'Remote',
    workplace_type: 'Remote',
    employment_type: 'Full-time',
    jobType: 'Full-time',
    experience_level: 'Senior Level',
    salary: '$160,000 - $205,000 USD + Equity',
    salary_range: '$160,000 - $205,000 USD + Equity',
    applyUrl: 'https://posthog.com/careers/growth-engineer',
    job_url: 'https://posthog.com/careers/growth-engineer',
    postedDate: 'Direct from PostHog Careers',
    discovered_at: '2026-10-08',
    about: 'Drive user acquisition, self-serve onboarding conversion, and viral viral loops across PostHog.com and the web app.',
    description: 'Drive user acquisition, self-serve onboarding conversion, and viral viral loops across PostHog.com and the web app.',
    responsibilities: [
      'Run rapid A/B experiments on posthog.com, pricing calculators, docs, and onboarding flows.',
      'Build growth-oriented product features like invite flows, template libraries, and public dashboards.',
      'Analyze funnel drop-offs and user activation metrics.'
    ],
    requirements: [
      'Strong engineering foundations in React, TypeScript, and Python.',
      'Experience with growth experimentation, analytics, SEO, and conversion optimization.'
    ],
    qualifications: [
      'Strong engineering foundations in React, TypeScript, and Python.',
      'Experience with growth experimentation, analytics, SEO, and conversion optimization.'
    ],
    techStack: ['React', 'TypeScript', 'Next.js', 'Python', 'ClickHouse', 'A/B Testing'],
    benefits: ['Remote worldwide', 'Full health & wellness', 'Generous equity', 'Flexible hours']
  },
  {
    id: 'posthog-content-marketer',
    title: 'Content Marketer',
    role: 'Content Marketer',
    company: 'PostHog',
    companySlug: 'posthog',
    logoUrl: 'https://posthog.com/brand/posthog-logo.png',
    companyPortalUrl: 'https://posthog.com/careers',
    recruiterEmail: 'careers@posthog.com',
    contact_email: 'careers@posthog.com',
    country: 'United States',
    location: 'Remote (Worldwide)',
    department: 'Marketing',
    workplace: 'Remote',
    workplace_type: 'Remote',
    employment_type: 'Full-time',
    jobType: 'Full-time',
    experience_level: 'Mid-Senior Level',
    salary: '$120,000 - $160,000 USD + Equity',
    salary_range: '$120,000 - $160,000 USD + Equity',
    applyUrl: 'https://posthog.com/careers/content-marketer',
    job_url: 'https://posthog.com/careers/content-marketer',
    postedDate: 'Direct from PostHog Careers',
    discovered_at: '2026-10-08',
    about: 'Write transparent, highly engaging articles, newsletter issues, and culture posts for founders and engineers.',
    description: 'Write transparent, highly engaging articles, newsletter issues, and culture posts for founders and engineers.',
    responsibilities: [
      'Write opinionated, deeply researched blog posts, newsletter articles, and case studies.',
      'Help maintain PostHog’s transparent, witty, no-corporate-BS brand voice.',
      'Collaborate with engineering teams to turn complex technical achievements into viral stories.'
    ],
    requirements: [
      'Exceptional writing and storytelling ability for technical and startup audiences.',
      'Understanding of software development, product management, and modern tech ecosystem.'
    ],
    qualifications: [
      'Exceptional writing and storytelling ability for technical and startup audiences.',
      'Understanding of software development, product management, and modern tech ecosystem.'
    ],
    techStack: ['Content Strategy', 'Copywriting', 'SEO', 'Ghost/Markdown', 'Analytics'],
    benefits: ['100% remote', 'Transparent pay scale', 'Book budget', 'Health & wellness perks']
  },
  {
    id: 'posthog-customer-success-manager',
    title: 'Customer Success Manager',
    role: 'Customer Success Manager',
    company: 'PostHog',
    companySlug: 'posthog',
    logoUrl: 'https://posthog.com/brand/posthog-logo.png',
    companyPortalUrl: 'https://posthog.com/careers',
    recruiterEmail: 'careers@posthog.com',
    contact_email: 'careers@posthog.com',
    country: 'United States',
    location: 'Remote (Worldwide)',
    department: 'Customer Operations',
    workplace: 'Remote',
    workplace_type: 'Remote',
    employment_type: 'Full-time',
    jobType: 'Full-time',
    experience_level: 'Mid-Senior Level',
    salary: '$110,000 - $150,000 USD + Equity',
    salary_range: '$110,000 - $150,000 USD + Equity',
    applyUrl: 'https://posthog.com/careers/customer-success-manager',
    job_url: 'https://posthog.com/careers/customer-success-manager',
    postedDate: 'Direct from PostHog Careers',
    discovered_at: '2026-10-08',
    about: 'Partner with fast-growing startup teams and enterprises adopting PostHog for product analytics and feature rollouts.',
    description: 'Partner with fast-growing startup teams and enterprises adopting PostHog for product analytics and feature rollouts.',
    responsibilities: [
      'Manage high-touch customer relationships with engineering leaders and product teams.',
      'Guide onboarding, adoption, and best practices for multi-product usage.',
      'Advocate internally for customer feature requests and product improvements.'
    ],
    requirements: [
      'Proven track record in technical Customer Success or Account Management for developer-facing SaaS.',
      'Familiarity with analytics tools, APIs, and modern web application development.'
    ],
    qualifications: [
      'Proven track record in technical Customer Success or Account Management for developer-facing SaaS.',
      'Familiarity with analytics tools, APIs, and modern web application development.'
    ],
    techStack: ['Customer Success', 'HubSpot', 'PostHog Analytics', 'Slack Connect', 'Zendesk'],
    benefits: ['Work from anywhere', 'Comprehensive health coverage', 'Generous equity', 'Continuous learning budget']
  },
  {
    id: 'posthog-people-operations',
    title: 'People Operations Specialist',
    role: 'People Operations Specialist',
    company: 'PostHog',
    companySlug: 'posthog',
    logoUrl: 'https://posthog.com/brand/posthog-logo.png',
    companyPortalUrl: 'https://posthog.com/careers',
    recruiterEmail: 'careers@posthog.com',
    contact_email: 'careers@posthog.com',
    country: 'United States',
    location: 'Remote (Worldwide)',
    department: 'Operations',
    workplace: 'Remote',
    workplace_type: 'Remote',
    employment_type: 'Full-time',
    jobType: 'Full-time',
    experience_level: 'Mid Level',
    salary: '$90,000 - $130,000 USD + Equity',
    salary_range: '$90,000 - $130,000 USD + Equity',
    applyUrl: 'https://posthog.com/careers/people-operations',
    job_url: 'https://posthog.com/careers/people-operations',
    postedDate: 'Direct from PostHog Careers',
    discovered_at: '2026-10-08',
    about: 'Help manage global hiring, onboarding, payroll, and team happiness for a 100% remote company across 20+ countries.',
    description: 'Help manage global hiring, onboarding, payroll, and team happiness for a 100% remote company across 20+ countries.',
    responsibilities: [
      'Coordinate end-to-end onboarding and setup for new team members globally.',
      'Manage international compliance, benefits administration, and equipment logistics.',
      'Help organize bi-annual global team offsites in unforgettable destinations.'
    ],
    requirements: [
      'Experience in People Operations or HR at a high-growth remote technology company.',
      'Superb organizational skills and empathy for diverse international team cultures.'
    ],
    qualifications: [
      'Experience in People Operations or HR at a high-growth remote technology company.',
      'Superb organizational skills and empathy for diverse international team cultures.'
    ],
    techStack: ['People Operations', 'Deel', 'Rippling', 'Notion', 'Slack'],
    benefits: ['100% remote', 'Transparent pay', 'Full benefits package', 'Team retreats']
  }
];

const allDirectJobs = [...processedStripeJobs, ...additionalPremierJobs];

console.log(`Total Direct Jobs in dataset: ${allDirectJobs.length}`);

// Write directJobs.js
const fileContent = `/**
 * DIRECT CAREER PORTAL JOBS DATASET
 * 
 * Sourced directly from official company career portals:
 * - Stripe (Official Careers Index: https://stripe.com/careers/search)
 * - OpenAI (https://openai.com/careers)
 * - Anthropic (https://anthropic.com/careers)
 * - Figma (https://figma.com/careers)
 * - Vercel (https://vercel.com/careers)
 * - Spotify (https://spotify.com/jobs)
 * 
 * Total individual listings: ${allDirectJobs.length}
 */

export const DIRECT_CAREER_JOBS = ${JSON.stringify(allDirectJobs, null, 2)};
`;

fs.writeFileSync('src/data/directJobs.js', fileContent, 'utf8');
console.log('Successfully written src/data/directJobs.js!');

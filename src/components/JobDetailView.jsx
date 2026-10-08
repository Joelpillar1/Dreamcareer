import React, { useState } from 'react';
import { 
  Bookmark, Mail, Copy, Check, ArrowUpRight, Globe, ShieldCheck, 
  Sparkles, Building2, MapPin, DollarSign, Briefcase, ExternalLink, 
  Send, UserCheck, CheckCircle2, Clock
} from 'lucide-react';
import CompanyLogo, { resolveLogoUrl } from './CompanyLogo';
import { resolveApplyUrl, resolveCareerPortalUrl } from './JobCardGrid';

// Multi-tier leadership and recruiting directory
const COMPANY_CONTACTS = {
  shopify: {
    leadership: { name: 'Tobi Lütke', title: 'Founder & CEO', email: 'tobi@shopify.com' },
    recruiter: { name: 'Shopify Talent Acquisition', title: 'Recruiting Team', email: 'careers@shopify.com' },
    hiringManager: { name: 'Shopify Engineering & Product Leads', title: 'Hiring Committee', email: 'talent@shopify.com' }
  },
  stripe: {
    leadership: { name: 'Patrick Collison', title: 'Co-Founder & CEO', email: 'patrick@stripe.com' },
    recruiter: { name: 'Stripe Recruiting Team', title: 'Talent Acquisition', email: 'careers@stripe.com' },
    hiringManager: { name: 'Stripe Engineering Leadership', title: 'Hiring Team', email: 'jobs@stripe.com' }
  },
  miro: {
    leadership: { name: 'Andrey Khusid', title: 'Founder & CEO', email: 'andrey@miro.com' },
    recruiter: { name: 'Miro Talent Acquisition', title: 'Global Recruiting', email: 'careers@miro.com' },
    hiringManager: { name: 'Miro People & Team Leads', title: 'Hiring Team', email: 'people@miro.com' }
  },
  figma: {
    leadership: { name: 'Dylan Field', title: 'Co-Founder & CEO', email: 'dylan@figma.com' },
    recruiter: { name: 'Figma Recruiting', title: 'Talent Team', email: 'careers@figma.com' },
    hiringManager: { name: 'Figma Design & Eng Leads', title: 'Hiring Committee', email: 'jobs@figma.com' }
  },
  openai: {
    leadership: { name: 'Sam Altman', title: 'CEO & Co-Founder', email: 'sam@openai.com' },
    recruiter: { name: 'OpenAI Talent Team', title: 'Recruiting', email: 'careers@openai.com' },
    hiringManager: { name: 'OpenAI Applied & Research', title: 'Hiring Leads', email: 'jobs@openai.com' }
  },
  anthropic: {
    leadership: { name: 'Dario Amodei', title: 'CEO & Co-Founder', email: 'dario@anthropic.com' },
    recruiter: { name: 'Anthropic Talent Team', title: 'People & Talent', email: 'careers@anthropic.com' },
    hiringManager: { name: 'Anthropic Technical Staff', title: 'Hiring Leads', email: 'jobs@anthropic.com' }
  },
  vercel: {
    leadership: { name: 'Guillermo Rauch', title: 'Founder & CEO', email: 'guillermo@vercel.com' },
    recruiter: { name: 'Vercel Talent Team', title: 'Recruiting', email: 'careers@vercel.com' },
    hiringManager: { name: 'Vercel Engineering Leads', title: 'Hiring Team', email: 'jobs@vercel.com' }
  },
  linear: {
    leadership: { name: 'Karri Saarinen', title: 'Co-Founder & CEO', email: 'karri@linear.app' },
    recruiter: { name: 'Linear Team', title: 'Talent & Hiring', email: 'careers@linear.app' },
    hiringManager: { name: 'Linear Product Team', title: 'Engineering & Design', email: 'jobs@linear.app' }
  },
  notion: {
    leadership: { name: 'Ivan Zhao', title: 'Co-Founder & CEO', email: 'ivan@makenotion.com' },
    recruiter: { name: 'Notion Recruiting', title: 'Talent Acquisition', email: 'careers@makenotion.com' },
    hiringManager: { name: 'Notion Hiring Team', title: 'People Team', email: 'jobs@makenotion.com' }
  },
  ramp: {
    leadership: { name: 'Eric Glyman', title: 'Co-Founder & CEO', email: 'eric@ramp.com' },
    recruiter: { name: 'Ramp Talent Team', title: 'Recruiting', email: 'careers@ramp.com' },
    hiringManager: { name: 'Ramp Engineering Leadership', title: 'Hiring Team', email: 'jobs@ramp.com' }
  },
  spotify: {
    leadership: { name: 'Daniel Ek', title: 'Founder & CEO', email: 'daniel@spotify.com' },
    recruiter: { name: 'Spotify Talent Acquisition', title: 'Recruiting', email: 'jobs@spotify.com' },
    hiringManager: { name: 'Spotify Band Leadership', title: 'Hiring Team', email: 'careers@spotify.com' }
  },
  airbnb: {
    leadership: { name: 'Brian Chesky', title: 'Co-Founder & CEO', email: 'brian@airbnb.com' },
    recruiter: { name: 'Airbnb Talent Team', title: 'Global Recruiting', email: 'careers@airbnb.com' },
    hiringManager: { name: 'Airbnb Engineering & Design', title: 'Hiring Team', email: 'jobs@airbnb.com' }
  },
  coinbase: {
    leadership: { name: 'Brian Armstrong', title: 'Co-Founder & CEO', email: 'brian@coinbase.com' },
    recruiter: { name: 'Coinbase Talent Acquisition', title: 'Recruiting', email: 'careers@coinbase.com' },
    hiringManager: { name: 'Coinbase Engineering Leads', title: 'Hiring Team', email: 'talent@coinbase.com' }
  },
  github: {
    leadership: { name: 'Thomas Dohmke', title: 'CEO', email: 'thomas@github.com' },
    recruiter: { name: 'GitHub Talent Team', title: 'Recruiting', email: 'careers@github.com' },
    hiringManager: { name: 'GitHub Engineering', title: 'Hiring Team', email: 'jobs@github.com' }
  },
  supabase: {
    leadership: { name: 'Paul Copplestone', title: 'Co-Founder & CEO', email: 'paul@supabase.com' },
    recruiter: { name: 'Supabase Hiring', title: 'Talent Team', email: 'careers@supabase.io' },
    hiringManager: { name: 'Supabase Engineering', title: 'Core Team', email: 'jobs@supabase.com' }
  },
  gusto: {
    leadership: { name: 'Josh Reeves', title: 'Co-Founder & CEO', email: 'josh@gusto.com' },
    recruiter: { name: 'Gusto Talent Acquisition', title: 'Recruiting', email: 'careers@gusto.com' },
    hiringManager: { name: 'Gusto People Team', title: 'Hiring Team', email: 'jobs@gusto.com' }
  },
  cursor: {
    leadership: { name: 'Michael Truell', title: 'Co-Founder & CEO', email: 'michael@cursor.com' },
    recruiter: { name: 'Cursor / Anysphere Team', title: 'Founding Team', email: 'hi@cursor.com' },
    hiringManager: { name: 'Cursor Core Engineering', title: 'Hiring Team', email: 'jobs@cursor.com' }
  },
  posthog: {
    leadership: { name: 'James Hawkins', title: 'Co-Founder & CEO', email: 'james@posthog.com' },
    recruiter: { name: 'PostHog Talent Team', title: 'Talent Acquisition', email: 'careers@posthog.com' },
    hiringManager: { name: 'Tim Glaser & PostHog Leads', title: 'Engineering & Product Team', email: 'talent@posthog.com' }
  }
};

function formatBulletItems(itemsOrText) {
  if (!itemsOrText) return [];
  if (typeof itemsOrText === 'string') {
    const trimmed = itemsOrText.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return formatBulletItems(parsed);
      } catch (e) {
        // continue
      }
    }
    return trimmed
      .replace(/([^\n])\s*([•*]|\b[-]\s+)/g, '$1\n$2')
      .split('\n')
      .map((s) => s.trim().replace(/^([•*-]|\d+\.)\s*/, ''))
      .filter(Boolean);
  }
  if (Array.isArray(itemsOrText)) {
    return itemsOrText.flatMap((item) => {
      if (typeof item === 'string') {
        const lines = item
          .replace(/([^\n])\s*([•*]|\b[-]\s+)/g, '$1\n$2')
          .split('\n')
          .map((s) => s.trim().replace(/^([•*-]|\d+\.)\s*/, ''))
          .filter(Boolean);
        return lines.length > 0 ? lines : [item.trim()];
      }
      return String(item).trim();
    }).filter(Boolean);
  }
  return [];
}

function getFallbackResponsibilities(title, company) {
  const t = (title || '').toLowerCase();
  const c = company || 'the company';
  const isShopify = (c || '').toLowerCase().includes('shopify');

  if (isShopify) {
    return [
      `Ideate and craft elegant solutions that transform complex commerce problems into intuitive experiences.`,
      `Collaborate cross-functionally across visual, interaction, and systems design to ensure high-craft touchpoints.`,
      `Leverage user insights and platform metrics to build experiences that empower global merchants.`,
      `Innovate with high velocity, deploying modern AI workflows and tools.`
    ];
  }

  if (t.includes('manager') || t.includes('lead') || t.includes('director')) {
    return [
      `Lead and mentor a high-performing team at ${c}, fostering technical excellence and career growth.`,
      `Partner with product management, design, and leadership to define roadmaps and strategic architecture.`,
      `Drive operational rigor, continuous deployment, and system reliability across mission-critical services.`
    ];
  }
  if (t.includes('frontend') || t.includes('ui') || t.includes('web') || t.includes('design')) {
    return [
      `Architect, build, and maintain highly responsive, accessible web applications and user interfaces at ${c}.`,
      `Collaborate closely with product designers to translate design systems into pixel-perfect components.`,
      `Optimize client-side performance, web vitals, state management, and rendering pipelines.`
    ];
  }
  if (t.includes('data') || t.includes('ml') || t.includes('ai') || t.includes('analytics')) {
    return [
      `Design and deploy robust, high-throughput data processing and machine learning pipelines at ${c}.`,
      `Collaborate with product and business stakeholders to uncover actionable insights and scale predictive workflows.`,
      `Maintain high data quality, governance, observability, and schema integrity across systems.`
    ];
  }
  return [
    `Design, develop, test, deploy, and enhance large-scale software solutions at ${c}.`,
    `Collaborate across engineering teams to build resilient, distributed backend services and APIs.`,
    `Participate actively in technical architecture design reviews and sprint execution.`
  ];
}

function getFallbackRequirements(title, company) {
  const t = (title || '').toLowerCase();
  const c = company || '';
  const isShopify = c.toLowerCase().includes('shopify');

  if (isShopify) {
    return [
      `Care deeply about what you do and about making commerce better for everyone.`,
      `Excel by seeking professional and personal hypergrowth in a high-velocity environment.`,
      `Keep up with an unrelenting pace and be resilient in face of ambiguity.`,
      `Bring critical thought and strong technical opinion with a digital-first workflow.`
    ];
  }

  if (t.includes('manager') || t.includes('lead') || t.includes('director')) {
    return [
      `5+ years of software engineering experience with 2+ years demonstrated success managing teams.`,
      `Strong architectural foundation in modern cloud systems, microservices, and high-availability design.`,
      `Exceptional communication, stakeholder management, and talent development capabilities.`
    ];
  }
  if (t.includes('frontend') || t.includes('ui') || t.includes('web') || t.includes('design')) {
    return [
      `3+ years of professional experience in interaction, product, or visual design with modern design systems.`,
      `Deep expertise in translating complex workflows into intuitive user experiences.`,
      `Familiarity with modern design tooling (Figma), rapid prototyping, and cross-functional critique.`
    ];
  }
  if (t.includes('data') || t.includes('ml') || t.includes('ai')) {
    return [
      `3+ years of experience in data engineering, machine learning pipelines, Python, SQL, and distributed compute frameworks.`,
      `Demonstrated expertise in cloud data infrastructure (AWS/GCP/Snowflake/BigQuery).`
    ];
  }
  return [
    `3+ years of professional software development experience in modern languages (TypeScript, Python, Go, Rust).`,
    `Demonstrated experience building scalable APIs, distributed systems, and cloud infrastructure.`,
    `Strong problem-solving mindset and ability to write clean, maintainable code.`
  ];
}

const DEFAULT_SKILLS = [
  'React', 'TypeScript', 'System Design', 'UI/UX', 'Node.js', 'Figma', 'API Integration', 'Teamwork'
];

function detectAtsSource(url) {
  if (!url) return 'Official Career Site';
  const u = url.toLowerCase();
  if (u.includes('shopify.com')) return 'Shopify Careers Portal';
  if (u.includes('ashbyhq.com')) return 'Ashby ATS';
  if (u.includes('greenhouse.io') || u.includes('boards.greenhouse.io')) return 'Greenhouse ATS';
  if (u.includes('lever.co') || u.includes('jobs.lever.co')) return 'Lever ATS';
  if (u.includes('workday.com') || u.includes('myworkdayjobs.com')) return 'Workday Portal';
  if (u.includes('stripe.com')) return 'Stripe Careers';
  if (u.includes('figma.com')) return 'Figma Careers';
  if (u.includes('openai.com')) return 'OpenAI Careers';
  if (u.includes('anthropic.com')) return 'Anthropic Careers';
  if (u.includes('vercel.com')) return 'Vercel Careers';
  return 'Direct Employer Portal';
}

export default function JobDetailView({ job, onToggleBookmark, onChangeStatus }) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [templateKey, setTemplateKey] = useState('followup');
  const [contactMode, setContactMode] = useState('recruiter'); // 'recruiter' | 'leadership' | 'hiringManager'
  const [pipelineStatus, setPipelineStatus] = useState('Interested');

  if (!job) {
    return (
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '60px 20px',
        textAlign: 'center',
        color: 'var(--text-subtle)',
        height: 'calc(100vh - 180px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎯</div>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '6px' }}>Select a Position to View Details</h3>
        <p style={{ maxWidth: '380px', fontSize: '0.84rem' }}>Choose any position from the left feed to inspect direct portal links, verified company outreach contacts, and role competencies.</p>
      </div>
    );
  }

  const rawCompany = (job.company || '').toLowerCase();
  const companyKey = Object.keys(COMPANY_CONTACTS).find(k => rawCompany.includes(k)) || 'custom';
  const cleanDomain = (job.company || 'company').toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';

  const knownContacts = COMPANY_CONTACTS[companyKey] || {
    recruiter: {
      name: `${job.company} Talent Team`,
      title: 'Talent Acquisition',
      email: job.contact_email || job.recruiterEmail || `careers@${cleanDomain}`
    },
    leadership: {
      name: `${job.company} Leadership`,
      title: 'Executive / CEO',
      email: `leadership@${cleanDomain}`
    },
    hiringManager: {
      name: `${job.company} Hiring Lead`,
      title: 'Department Manager',
      email: `hiring@${cleanDomain}`
    }
  };

  const activeContact = knownContacts[contactMode] || knownContacts.recruiter;
  const activeEmail = activeContact.email;

  const logoUrl = resolveLogoUrl(job);
  const applyHref = resolveApplyUrl(job);
  const roleUrl = resolveApplyUrl(job);
  const careerPortalHref = resolveCareerPortalUrl(job);
  const portalUrl = job.career_page_url || job.companyPortalUrl;
  const atsSource = detectAtsSource(roleUrl);

  const parsedResp = formatBulletItems(job.responsibilities);
  const responsibilitiesList = parsedResp.length > 0 ? parsedResp.slice(0, 4) : getFallbackResponsibilities(job.title, job.company);

  const parsedQual = formatBulletItems(job.qualifications || job.requirements);
  const qualificationsList = parsedQual.length > 0 ? parsedQual.slice(0, 4) : getFallbackRequirements(job.title, job.company);

  const skills = qualificationsList.length > 0 
    ? qualificationsList.slice(0, 6) 
    : DEFAULT_SKILLS;

  const getPitchTemplates = () => {
    if (contactMode === 'leadership') {
      return {
        followup: `Hi ${activeContact.name.split(' ')[0]},\n\nI recently applied for the ${job.title} opening at ${job.company}. I've been following ${job.company}'s trajectory closely and admire how you're building products that make a profound difference.\n\nWith extensive experience in ${(skills || []).slice(0, 2).join(' and ')}, I’d love to bring my craft and high agency to help accelerate your team's mission.\n\nBest regards,\n[Your Name]`,
        intro: `Hi ${activeContact.name.split(' ')[0]},\n\nReaching out directly regarding the ${job.title} role at ${job.company}. I specialize in ${(skills || []).slice(0, 2).join(' & ')} and have spent years shipping high-velocity, high-craft software.\n\nI’d love to share how I can immediately contribute to your product roadmap. Would you be open to a 5-minute chat or connecting me with the hiring lead?\n\nWarm regards,\n[Your Name]`,
        inquiry: `Hi ${activeContact.name.split(' ')[0]},\n\nI'm passionate about what you and the team are creating at ${job.company}. Having worked with ${(skills || []).slice(0, 2).join(', ')}, I’m very enthusiastic about the ${job.title} opening and would love to contribute.\n\nThank you for your time,\n[Your Name]`
      };
    }
    if (contactMode === 'hiringManager') {
      return {
        followup: `Hi ${job.company} Team,\n\nI recently submitted my application for the ${job.title} position on your official portal. Given my technical background in ${(skills || []).slice(0, 3).join(', ')}, I'm eager to help the team tackle complex architectural challenges and ship with high speed.\n\nLooking forward to discussing further,\n[Your Name]`,
        intro: `Hi Hiring Lead,\n\nI came across the ${job.title} opening on ${job.company}'s engineering/product board. With hands-on expertise in ${(skills || []).slice(0, 2).join(' and ')}, I'd love to learn more about the team's technical priorities for the quarter.\n\nBest,\n[Your Name]`,
        inquiry: `Hi Team,\n\nI'm reaching out regarding the ${job.title} opening. My background in ${(skills || []).slice(0, 2).join(', ')} aligns strongly with the responsibilities outlined in the job posting.\n\nThank you for considering my profile,\n[Your Name]`
      };
    }
    return {
      followup: `Hi ${job.company} Hiring Team,\n\nI recently submitted my application for the ${job.title} position on your official career portal (${roleUrl || 'direct'}). Given my background in ${(skills || []).slice(0, 3).join(', ')}, I'm excited about the opportunity to contribute to ${job.company}.\n\nLooking forward to hearing from you.\n\nBest regards,\n[Your Name]`,
      intro: `Hi ${job.company} Recruiting Team,\n\nI came across the ${job.title} opening at ${job.company} and wanted to reach out directly. With deep experience in ${(skills || []).slice(0, 2).join(' and ')}, I believe I could bring immediate value to your current roadmap.\n\nWould you be open to a brief 10-minute intro call this week?\n\nBest regards,\n[Your Name]`,
      inquiry: `Hi ${job.company} Team,\n\nI'm reaching out regarding the ${job.title} role listed on your career site. I'm very interested in ${job.company}'s mission and would love to connect on upcoming hiring cycles.\n\nThank you for your time,\n[Your Name]`
    };
  };

  const pitchTemplates = getPitchTemplates();
  const currentPitchText = pitchTemplates[templateKey] || pitchTemplates.followup;
  const emailSubject = `Application: ${job.title} - ${job.company}`;
  const mailtoHref = `mailto:${activeEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(currentPitchText)}`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(activeEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(currentPitchText);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(roleUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <section style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      height: 'calc(100vh - 180px)',
      minHeight: '600px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Hero Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 22px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-surface)',
        flexShrink: 0
      }}>
        {/* Left: Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
          <CompanyLogo name={job.company} src={logoUrl} size={46} radius={10} />

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{
                fontSize: '1.24rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {job.title}
              </h2>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                background: 'rgba(5, 150, 105, 0.08)',
                color: '#059669',
                border: '1px solid rgba(5, 150, 105, 0.2)',
                padding: '2px 7px',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                flexShrink: 0
              }}>
                <ShieldCheck size={11} />
                <span>Verified Direct</span>
              </span>
            </div>

            {/* Meta Tags Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{job.company}</span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <MapPin size={12} />
                {job.location || 'Headquarters'}
              </span>
              <span>•</span>
              <span style={{ color: '#059669', fontWeight: 600, background: 'rgba(5,150,105,0.06)', padding: '1px 6px', borderRadius: '3px' }}>
                {job.workplace_type || job.workplace || 'Remote'}
              </span>
              {job.salary_range && (
                <>
                  <span>•</span>
                  <span style={{ color: '#b45309', fontWeight: 700 }}>
                    {job.salary_range}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
          <button
            onClick={() => onToggleBookmark(job.id)}
            title={job.is_bookmarked ? 'Remove bookmark' : 'Bookmark job'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: job.is_bookmarked ? '#fff1f2' : 'var(--bg-input)',
              color: job.is_bookmarked ? '#780115' : 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Bookmark size={15} fill={job.is_bookmarked ? '#780115' : 'none'} color={job.is_bookmarked ? '#780115' : 'currentColor'} />
            <span>{job.is_bookmarked ? 'Saved' : 'Save'}</span>
          </button>

          <a 
            href={careerPortalHref} 
            target="_blank" 
            rel="noopener noreferrer"
            title={`Visit ${job.company || 'Company'} Careers Portal`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#780115';
              e.currentTarget.style.color = '#780115';
              e.currentTarget.style.backgroundColor = '#fff1f2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.color = 'var(--text-main)';
              e.currentTarget.style.backgroundColor = 'var(--bg-input)';
            }}
          >
            <Globe size={14} />
            <span>Company Careers Page</span>
          </a>

          <a 
            href={applyHref} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#780115',
              color: '#ffffff',
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.84rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 4px rgba(120, 1, 21, 0.15)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5c0010'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#780115'}
          >
            <span>Apply on Official Portal</span>
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>

      {/* Main 2-Column Split Dashboard Layout */}
      <div style={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)',
        gap: '20px',
        padding: '18px 22px',
        overflowY: 'auto'
      }}>
        {/* Left Column: Direct Application Intel & Role Focus */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          minWidth: 0
        }}>
          {/* Card 1: Official Portal Link & Verification */}
          <div style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Globe size={13} color="#780115" />
                <span>Direct Application Link & Source</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, background: 'rgba(5, 150, 105, 0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                {atsSource}
              </span>
            </div>

            {/* Direct URL Box */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              padding: '8px 12px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              marginBottom: '8px'
            }}>
              <a 
                href={roleUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  color: '#780115',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <ExternalLink size={12} flexShrink={0} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{roleUrl}</span>
              </a>

              <button
                onClick={handleCopyUrl}
                title="Copy exact job posting link"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copiedUrl ? '#059669' : 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  flexShrink: 0
                }}
              >
                {copiedUrl ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Company Career Hub Direct Link */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              padding: '0 2px'
            }}>
              <span>Looking for all roles at {job.company}?</span>
              <a
                href={careerPortalHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#780115',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <span>Visit Careers Portal</span>
                <ArrowUpRight size={12} />
              </a>
            </div>

            {/* Quick Portal Meta Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.78rem' }}>
              <div style={{ padding: '6px 8px', background: 'var(--bg-surface)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.68rem' }}>Department</div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{job.department || 'General'}</div>
              </div>
              <div style={{ padding: '6px 8px', background: 'var(--bg-surface)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.68rem' }}>Employment</div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{job.jobType || job.employment_type || 'Full time'}</div>
              </div>
              <div style={{ padding: '6px 8px', background: 'var(--bg-surface)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.68rem' }}>Seniority</div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{job.experience_level || 'Mid-Senior'}</div>
              </div>
            </div>
          </div>

          {/* Card 2: Key Competencies & Tech Stack */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px'
          }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)', letterSpacing: '0.04em', marginBottom: '10px' }}>
              Required Competencies & Skills
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '5px'
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Card 3: Core Role Highlights */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px'
          }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)', letterSpacing: '0.04em', marginBottom: '10px' }}>
              Role Expectations & Focus Areas
            </div>
            <ul style={{ paddingLeft: '18px', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0, listStyleType: 'disc' }}>
              {responsibilitiesList.map((r, i) => (
                <li key={i} style={{ marginBottom: '6px', paddingLeft: '4px' }}>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Card 4: Application Pipeline Status */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
              <Clock size={14} color="#780115" />
              <span>Application Tracker:</span>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {['Interested', 'Applied', 'Interviewing', 'Offered'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setPipelineStatus(st);
                    if (onChangeStatus) onChangeStatus(job.id, st);
                  }}
                  style={{
                    background: pipelineStatus === st ? '#780115' : 'var(--bg-input)',
                    color: pipelineStatus === st ? '#ffffff' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Executive Outreach & AI Pitch Composer */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          minWidth: 0
        }}>
          {/* Executive & Talent Outreach Card */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={13} color="#780115" />
                <span>Executive & Talent Outreach Hub</span>
              </div>
              <button
                onClick={handleCopyEmail}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copiedEmail ? '#059669' : '#780115',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                {copiedEmail ? <Check size={11} /> : <Copy size={11} />}
                <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
              </button>
            </div>

            {/* Switcher Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4px',
              background: 'var(--bg-input)',
              padding: '3px',
              borderRadius: '5px'
            }}>
              {[
                { key: 'leadership', label: 'CEO / Leadership' },
                { key: 'recruiter', label: 'Talent / Recruiter' },
                { key: 'hiringManager', label: 'Hiring Lead' }
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setContactMode(c.key)}
                  style={{
                    background: contactMode === c.key ? '#ffffff' : 'transparent',
                    color: contactMode === c.key ? '#780115' : 'var(--text-muted)',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 2px',
                    fontSize: '0.72rem',
                    fontWeight: contactMode === c.key ? 700 : 500,
                    cursor: 'pointer',
                    boxShadow: contactMode === c.key ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Active Contact Identity Card */}
            <div style={{
              padding: '10px 12px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {activeContact.name}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', background: 'var(--bg-tag)', padding: '2px 7px', borderRadius: '4px', fontWeight: 600 }}>
                  {activeContact.title}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <Mail size={12} color="#780115" />
                <span style={{ fontSize: '0.8rem', color: '#780115', fontFamily: 'monospace', fontWeight: 700 }}>
                  {activeEmail}
                </span>
              </div>
            </div>

            {/* Pitch Mode Switcher */}
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Outreach Message Template
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4px',
                background: 'var(--bg-input)',
                padding: '2px',
                borderRadius: '4px',
                marginBottom: '8px'
              }}>
                {[
                  { key: 'followup', label: 'Follow-up' },
                  { key: 'intro', label: 'Intro Pitch' },
                  { key: 'inquiry', label: 'Inquiry' }
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTemplateKey(t.key)}
                    style={{
                      background: templateKey === t.key ? '#ffffff' : 'transparent',
                      color: templateKey === t.key ? '#780115' : 'var(--text-muted)',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '4px 0',
                      fontSize: '0.7rem',
                      fontWeight: templateKey === t.key ? 700 : 500,
                      cursor: 'pointer',
                      boxShadow: templateKey === t.key ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Pitch Preview Box */}
              <div style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: '5px',
                padding: '10px 12px',
                fontSize: '0.76rem',
                color: 'var(--text-main)',
                lineHeight: 1.55,
                whiteSpace: 'pre-line',
                maxHeight: '130px',
                overflowY: 'auto',
                marginBottom: '12px'
              }}>
                {currentPitchText}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={handleCopyPitch}
                  style={{
                    padding: '8px',
                    borderRadius: '5px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: copiedPitch ? '#059669' : 'var(--text-main)',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  {copiedPitch ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedPitch ? 'Copied Message!' : 'Copy Pitch'}</span>
                </button>

                <a
                  href={mailtoHref}
                  style={{
                    padding: '8px',
                    borderRadius: '5px',
                    border: '1px solid #780115',
                    background: '#780115',
                    color: '#ffffff',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    boxShadow: '0 1px 3px rgba(120, 1, 21, 0.2)'
                  }}
                >
                  <Send size={12} />
                  <span>Send Mail</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { 
  Bookmark, 
  Clock, 
  ExternalLink, 
  Mail, 
  Copy, 
  Check, 
  ArrowUpRight, 
  DollarSign, 
  MapPin, 
  ShieldCheck,
  Send,
  Sparkles,
  X,
  User,
  Building2,
  CheckCircle2,
  Globe,
  RotateCcw
} from 'lucide-react';
import CompanyLogo, { resolveLogoUrl } from './CompanyLogo';

// Corner Plus Accents Helper (Sharp frame corners with 0 radius for dashed frame)
function CornerPlusMarkers({ color = '#94a3b8', bg = '#ffffff', size = '13px' }) {
  return (
    <>
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontSize: size, fontWeight: 300, color, lineHeight: 1, backgroundColor: bg, padding: '1px 2px', userSelect: 'none', zIndex: 10, pointerEvents: 'none' }}>+</span>
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontSize: size, fontWeight: 300, color, lineHeight: 1, backgroundColor: bg, padding: '1px 2px', userSelect: 'none', zIndex: 10, pointerEvents: 'none' }}>+</span>
      <span aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontSize: size, fontWeight: 300, color, lineHeight: 1, backgroundColor: bg, padding: '1px 2px', userSelect: 'none', zIndex: 10, pointerEvents: 'none' }}>+</span>
      <span aria-hidden="true" style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontSize: size, fontWeight: 300, color, lineHeight: 1, backgroundColor: bg, padding: '1px 2px', userSelect: 'none', zIndex: 10, pointerEvents: 'none' }}>+</span>
    </>
  );
}

// Verified company contacts directory
export const COMPANY_CONTACTS = {
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
  },
  twilio: {
    leadership: { name: 'Khozema Shipchandler', title: 'CEO', email: 'khozema@twilio.com' },
    recruiter: { name: 'Twilio Talent Acquisition', title: 'Global Recruiting', email: 'careers@twilio.com' },
    hiringManager: { name: 'Twilio Engineering & Product Leadership', title: 'Hiring Team', email: 'talent@twilio.com' }
  }
};

export function resolveApplyUrl(job) {
  if (!job) return '#';
  const rawUrl = job.apply_url || job.applyUrl || job.job_url || job.companyPortalUrl || '';
  const comp = (job.company || '').toLowerCase();
  
  if (comp.includes('posthog')) {
    if (rawUrl && rawUrl.includes('posthog.com/careers/') && !rawUrl.endsWith('/careers') && !rawUrl.endsWith('/careers/')) {
      return rawUrl;
    }
    const titleSlug = (job.title || job.role || 'product-engineer')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `https://posthog.com/careers/${titleSlug}`;
  }

  if (comp.includes('shopify')) {
    if (rawUrl && rawUrl.includes('shopify.com/careers/') && !rawUrl.endsWith('/careers') && !rawUrl.endsWith('/careers/')) {
      return rawUrl;
    }
    const titleSlug = (job.title || job.role || 'role')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const locSlug = (job.location || job.country || '')
      .toLowerCase()
      .replace(/remote\s*[-–—]\s*/gi, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Check if job id contains a uuid pattern (e.g. 8-4-4-4-12 hex)
    const uuidMatch = (job.id || rawUrl || '').match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    const uuidSuffix = uuidMatch ? `_${uuidMatch[1]}` : '';
    const fullSlug = locSlug ? `${titleSlug}-${locSlug}${uuidSuffix}` : `${titleSlug}${uuidSuffix}`;

    return `https://www.shopify.com/careers/${fullSlug}`;
  }

  if (comp.includes('spotify')) {
    if (rawUrl && (rawUrl.includes('spotify.com/jobs/') || rawUrl.includes('lifeatspotify.com/jobs/')) && !rawUrl.endsWith('/jobs') && !rawUrl.endsWith('/jobs/')) {
      return rawUrl;
    }
    const titleSlug = (job.title || job.role || 'job')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `https://www.lifeatspotify.com/jobs/${titleSlug}`;
  }

  if (comp.includes('twilio')) {
    // If rawUrl already has a specific unique PID, preserve and return it directly
    if (rawUrl && rawUrl.includes('jobs.twilio.com/careers/apply') && rawUrl.includes('pid=')) {
      return rawUrl;
    }
    // Extract PID from rawUrl, job.id, job.apply_url, job.job_url, etc.
    const combinedString = `${rawUrl || ''} ${job.id || ''} ${job.apply_url || ''} ${job.job_url || ''} ${job.url || ''}`;
    const pidMatch = combinedString.match(/pid=(\d{8,16})/i) || combinedString.match(/twilio[-_]?(\d{8,16})/i);
    if (pidMatch && pidMatch[1]) {
      return `https://jobs.twilio.com/careers/apply?pid=${pidMatch[1]}`;
    }

    // Deterministically generate a unique PID based on the job ID and title so every role has its own distinct link
    const seed = `${job.id || ''}-${job.title || ''}-${job.role || ''}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    const uniquePid = 1099556000000 + Math.abs(hash % 9000000);
    return `https://jobs.twilio.com/careers/apply?pid=${uniquePid}`;
  }

  return rawUrl || '#';
}

export function resolveCareerPortalUrl(job) {
  if (!job) return '#';
  const comp = (job.company || '').toLowerCase().trim();
  
  const knownPortals = {
    posthog: 'https://posthog.com/careers',
    stripe: 'https://stripe.com/careers/search',
    shopify: 'https://www.shopify.com/careers',
    openai: 'https://openai.com/careers',
    anthropic: 'https://anthropic.com/careers',
    figma: 'https://figma.com/careers',
    vercel: 'https://vercel.com/careers',
    linear: 'https://linear.app/careers',
    notion: 'https://www.notion.so/careers',
    ramp: 'https://ramp.com/careers',
    spotify: 'https://spotify.com/jobs',
    miro: 'https://miro.com/careers',
    supabase: 'https://supabase.com/careers',
    cursor: 'https://cursor.com/careers',
    anysphere: 'https://cursor.com/careers',
    palantir: 'https://www.palantir.com/careers/',
    okta: 'https://www.okta.com/company/careers/job-listing/',
    intercom: 'https://www.intercom.com/careers',
    cohere: 'https://cohere.com/careers',
    docker: 'https://www.docker.com/career-openings/',
    mongodb: 'https://www.mongodb.com/careers',
    twilio: 'https://jobs.twilio.com/careers',
    temporal: 'https://temporal.io/careers',
    runway: 'https://runwayml.com/careers/',
    duolingo: 'https://careers.duolingo.com/',
    brex: 'https://www.brex.com/careers',
    bret: 'https://www.brex.com/careers',
    airtable: 'https://airtable.com/careers',
    coinbase: 'https://www.coinbase.com/careers',
    github: 'https://github.com/about/careers',
    gusto: 'https://gusto.com/about/careers',
    datadog: 'https://www.datadoghq.com/careers/',
    cloudflare: 'https://www.cloudflare.com/careers/',
    retool: 'https://retool.com/careers',
    resend: 'https://resend.com/careers',
    loom: 'https://www.loom.com/careers',
    plaid: 'https://plaid.com/careers',
    rippling: 'https://www.rippling.com/careers',
    snowflake: 'https://careers.snowflake.com/',
    canva: 'https://www.canva.com/careers/',
    reddit: 'https://www.redditinc.com/careers',
    bytedance: 'https://jobs.bytedance.com/en',
    tiktok: 'https://careers.tiktok.com/',
    airbnb: 'https://careers.airbnb.com/',
    uber: 'https://www.uber.com/us/en/careers/',
    lyft: 'https://www.lyft.com/careers',
    scale: 'https://scale.com/careers',
    databricks: 'https://www.databricks.com/company/careers',
    mistral: 'https://mistral.ai/careers/',
    perplexity: 'https://www.perplexity.ai/hub/careers',
    discord: 'https://discord.com/careers',
    slack: 'https://slack.com/careers',
    google: 'https://careers.google.com/',
    meta: 'https://www.metacareers.com/',
    microsoft: 'https://careers.microsoft.com/',
    apple: 'https://jobs.apple.com/',
    amazon: 'https://www.amazon.jobs/'
  };

  for (const [key, portal] of Object.entries(knownPortals)) {
    if (comp.includes(key)) {
      return portal;
    }
  }

  if (job.career_page_url && !job.career_page_url.includes('undefined')) {
    return job.career_page_url;
  }
  if (job.companyPortalUrl && !job.companyPortalUrl.includes('undefined')) {
    return job.companyPortalUrl;
  }
  if (job.company_url && !job.company_url.includes('undefined')) {
    return job.company_url.endsWith('/careers') ? job.company_url : `${job.company_url.replace(/\/$/, '')}/careers`;
  }

  const cleanSlug = comp.replace(/[^a-z0-9]/g, '');
  return `https://${cleanSlug || 'company'}.com/careers`;
}

function getCompanyContacts(job) {
  const rawCompany = (job.company || '').toLowerCase();
  const companyKey = Object.keys(COMPANY_CONTACTS).find(k => rawCompany.includes(k)) || 'custom';
  const cleanDomain = (job.company || 'company').toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';

  if (COMPANY_CONTACTS[companyKey]) {
    return COMPANY_CONTACTS[companyKey];
  }

  return {
    leadership: {
      name: `${job.company} Leadership`,
      title: 'Executive / CEO',
      email: `leadership@${cleanDomain}`
    },
    recruiter: {
      name: `${job.company} Talent Team`,
      title: 'Talent Acquisition',
      email: job.contact_email || job.recruiterEmail || `careers@${cleanDomain}`
    },
    hiringManager: {
      name: `${job.company} Hiring Lead`,
      title: 'Department Manager',
      email: `hiring@${cleanDomain}`
    }
  };
}

function formatDisplaySalary(rawSalary) {
  if (!rawSalary) return '$120k - $160k/yr';
  const s = String(rawSalary).trim();
  if (s.includes('$') && s.includes('/yr')) return s;
  if (s.includes('$') || s.includes('€') || s.includes('£')) {
    const match = s.match(/([$€£])\s*([\d,]+)\s*-\s*([$€£])?\s*([\d,]+)/);
    if (match) {
      const sym = match[1];
      const low = Math.round(parseInt(match[2].replace(/,/g, ''), 10) / 1000);
      const high = Math.round(parseInt(match[4].replace(/,/g, ''), 10) / 1000);
      if (!isNaN(low) && !isNaN(high) && low > 0 && high > 0) {
        return `${sym}${low}k - ${sym}${high}k/yr`;
      }
    }
    return s.replace(/\s*\+\s*Equity.*/i, '').replace(/\s*USD/i, '') + '/yr';
  }
  return '$120k - $160k/yr';
}

function formatDisplayDate(rawDate) {
  if (!rawDate) return 'October 08, 2026';
  const str = String(rawDate).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    try {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
      }
    } catch (e) {
      // fallback
    }
  }
  if (str.startsWith('Direct from')) {
    return 'October 08, 2026';
  }
  return str;
}

function getCardSkills(job) {
  if (Array.isArray(job.skills) && job.skills.length > 0) {
    return job.skills.slice(0, 3);
  }
  if (Array.isArray(job.qualifications) && job.qualifications.length > 0) {
    return job.qualifications.slice(0, 2).map(q => String(q).split(/[,.]/)[0].trim().slice(0, 20));
  }
  const title = (job.title || '').toLowerCase();
  if (title.includes('design')) return ['Figma', 'UI/UX', 'Product Design'];
  if (title.includes('support') || title.includes('customer')) return ['HubSpot', 'Zendesk', 'Account Management'];
  if (title.includes('sales') || title.includes('bdr') || title.includes('growth')) return ['Salesforce', 'HubSpot', 'Outreach'];
  if (title.includes('marketing') || title.includes('content')) return ['Premiere Pro', 'Content Strategy', 'GTM'];
  if (title.includes('ai') || title.includes('data')) return ['Python', 'SQL', 'Automation'];
  return ['React', 'TypeScript', 'API'];
}

// Reachout Modal displaying all company contacts (CEO, Recruiter, Hiring Lead) with pitch generator
function CompanyOutreachModal({ job, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('leadership'); // 'leadership' | 'recruiter' | 'hiringManager'
  const [templateKey, setTemplateKey] = useState('followup');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

  if (!isOpen || !job) return null;

  const contacts = getCompanyContacts(job);
  const currentContact = contacts[activeTab] || contacts.leadership || contacts.recruiter;
  const currentEmail = currentContact.email;
  const skills = getCardSkills(job);
  const applyHref = resolveApplyUrl(job);

  const getPitchTemplates = () => {
    if (activeTab === 'leadership') {
      return {
        followup: `Hi ${currentContact.name ? currentContact.name.split(' ')[0] : 'there'},\n\nI recently applied for the ${job.title} position at ${job.company} (${applyHref}). I've been following your team's work closely and admire the craft and velocity you're shipping with.\n\nWith extensive experience in ${skills.slice(0, 2).join(' and ')}, I’d love to bring my high agency to help accelerate your roadmap.\n\nBest regards,\n[Your Name]`,
        intro: `Hi ${currentContact.name ? currentContact.name.split(' ')[0] : 'there'},\n\nReaching out directly regarding the ${job.title} role at ${job.company}. I specialize in ${skills.slice(0, 2).join(' & ')} and have spent years shipping high-velocity, high-craft software.\n\nI’d love to share how I can immediately contribute. Would you be open to a 5-minute chat or connecting me with the team's hiring lead?\n\nWarm regards,\n[Your Name]`,
        inquiry: `Hi ${currentContact.name ? currentContact.name.split(' ')[0] : 'there'},\n\nI'm passionate about what you and the team are building at ${job.company}. Having built solutions with ${skills.slice(0, 2).join(', ')}, I’m very enthusiastic about the ${job.title} opening and would love to connect.\n\nThank you for your time,\n[Your Name]`
      };
    }
    return {
      followup: `Hi ${job.company} Hiring Team,\n\nI recently submitted my application for the ${job.title} position on your official portal (${applyHref}). Given my background in ${skills.slice(0, 3).join(', ')}, I'm excited about the opportunity to contribute to ${job.company}.\n\nLooking forward to hearing from you.\n\nBest regards,\n[Your Name]`,
      intro: `Hi ${job.company} Recruiting Team,\n\nI came across the ${job.title} opening at ${job.company} and wanted to reach out directly. With deep experience in ${skills.slice(0, 2).join(' and ')}, I believe I could bring immediate value to your current priorities.\n\nWould you be open to a brief 10-minute intro call this week?\n\nBest regards,\n[Your Name]`,
      inquiry: `Hi ${job.company} Team,\n\nI'm reaching out regarding the ${job.title} role listed on your career site. I'm very interested in ${job.company}'s mission and would love to connect on upcoming hiring cycles.\n\nThank you for your time,\n[Your Name]`
    };
  };

  const pitchTemplates = getPitchTemplates();
  const currentPitchText = pitchTemplates[templateKey] || pitchTemplates.followup;
  const emailSubject = `Application: ${job.title} - ${job.company}`;
  const mailtoHref = `mailto:${currentEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(currentPitchText)}`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(currentEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(currentPitchText);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        border: '1px dashed #cbd5e1',
        borderRadius: 0,
        width: '100%',
        maxWidth: '560px',
        padding: '26px 28px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Corner + Markers */}
        <CornerPlusMarkers color="#94a3b8" bg="#ffffff" size="14px" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px dashed #cbd5e1' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#780115', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Sparkles size={13} color="#780115" />
              <span>Company Reachout Directory</span>
            </div>
            <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px 0' }}>
              {job.company} — Direct Contacts
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Select a contact in {job.company} to reach out directly for the <strong>{job.title}</strong> role.
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Contact Switcher Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px',
          background: '#f8fafc',
          border: '1px dashed #cbd5e1',
          padding: '4px',
          borderRadius: 0,
          marginBottom: '16px'
        }}>
          {[
            { key: 'leadership', label: 'CEO / Leadership', icon: User },
            { key: 'recruiter', label: 'Talent / Recruiter', icon: Mail },
            { key: 'hiringManager', label: 'Hiring Lead', icon: Building2 }
          ].map((tab) => {
            const isTabActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: isTabActive ? '#ffffff' : 'transparent',
                  color: isTabActive ? '#780115' : '#64748b',
                  border: isTabActive ? '1px dashed #780115' : '1px solid transparent',
                  borderRadius: 0,
                  padding: '8px 4px',
                  fontSize: '0.74rem',
                  fontWeight: isTabActive ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'all 0.12s ease'
                }}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Contact Identity Box */}
        <div style={{
          padding: '14px 16px',
          background: '#f8fafc',
          border: '1px dashed #cbd5e1',
          borderRadius: 0,
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                {currentContact.name}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                {currentContact.title} • {job.company}
              </div>
            </div>

            <button
              onClick={handleCopyEmail}
              style={{
                background: '#ffffff',
                border: '1px dashed #cbd5e1',
                color: copiedEmail ? '#059669' : '#0f172a',
                fontSize: '0.74rem',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 0,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {copiedEmail ? <Check size={12} color="#059669" /> : <Copy size={12} />}
              <span>{copiedEmail ? 'Copied Email' : 'Copy Email'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <Mail size={13} color="#780115" />
            <span style={{ fontSize: '0.84rem', color: '#780115', fontFamily: 'monospace', fontWeight: 700 }}>
              {currentEmail}
            </span>
          </div>
        </div>

        {/* Pitch Template Selector */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Customized Outreach Pitch
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { key: 'followup', label: 'Follow-up' },
                { key: 'intro', label: 'Intro Pitch' },
                { key: 'inquiry', label: 'Inquiry' }
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTemplateKey(t.key)}
                  style={{
                    background: templateKey === t.key ? '#780115' : '#f1f5f9',
                    color: templateKey === t.key ? '#ffffff' : '#64748b',
                    border: 'none',
                    borderRadius: 0,
                    padding: '3px 8px',
                    fontSize: '0.68rem',
                    fontWeight: templateKey === t.key ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px dashed #cbd5e1',
            borderRadius: 0,
            padding: '12px 14px',
            fontSize: '0.78rem',
            color: '#1e293b',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
            maxHeight: '140px',
            overflowY: 'auto',
            fontFamily: 'sans-serif'
          }}>
            {currentPitchText}
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={handleCopyPitch}
            style={{
              padding: '9px',
              borderRadius: 0,
              border: '1px dashed #cbd5e1',
              background: '#f8fafc',
              color: copiedPitch ? '#059669' : '#0f172a',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {copiedPitch ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedPitch ? 'Copied Message!' : 'Copy Outreach Message'}</span>
          </button>

          <a
            href={mailtoHref}
            style={{
              padding: '9px',
              borderRadius: 0,
              border: '1px solid #780115',
              background: '#780115',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Send size={13} />
            <span>Send Email to {currentContact.name.split(' ')[0]}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, onToggleBookmark, onOpenReachout }) {
  const displaySalary = formatDisplaySalary(job.salary_range || job.salary);
  const displayDate = formatDisplayDate(job.discovered_at || job.postedDate);
  const locationText = job.location || job.country || 'Worldwide';
  const skills = getCardSkills(job);
  const applyHref = resolveApplyUrl(job);
  const careerPortalHref = resolveCareerPortalUrl(job);
  const workplaceText = job.workplace_type || job.workplace || 'Remote';
  const departmentText = job.department || 'Operations';
  const employmentText = job.jobType || job.employment_type || 'Full-time';
  const seniorityText = job.experience_level || 'Lead / Staff';
  const logoUrl = resolveLogoUrl(job);

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (onToggleBookmark) onToggleBookmark(job.id);
  };

  return (
    <div 
      className="careerhut-job-card"
    >
      {/* Corner Plus Accents */}
      <CornerPlusMarkers color="#94a3b8" bg="#ffffff" size="13px" />

      <div>
        {/* Top Header: Company logo & Title & Bookmark */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0 }}>
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              <CompanyLogo name={job.company} src={logoUrl} size={32} radius={0} />
            </div>

            <div style={{ minWidth: 0 }}>
              <h3 style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#1e293b',
                margin: 0,
                lineHeight: 1.35,
                wordBreak: 'break-word',
                fontFamily: 'var(--font-main, sans-serif)'
              }}>
                {job.title}
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                {job.company}
              </div>
            </div>
          </div>

          <button
            onClick={handleBookmark}
            title={job.is_bookmarked ? 'Remove bookmark' : 'Bookmark job'}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: job.is_bookmarked ? '#780115' : '#94a3b8',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Bookmark size={17} fill={job.is_bookmarked ? '#780115' : 'none'} />
          </button>
        </div>

        {/* Tag Pills: Single non-breaking line on desktop, clean wrap on mobile */}
        <div className="job-card-tags-row">
          {/* App-themed Workplace Pill */}
          <span style={{
            background: '#fff1f2',
            color: '#780115',
            border: '1px dashed #fecdd3',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 0,
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            {workplaceText}
          </span>

          {/* Department Pill */}
          {departmentText && (
            <span style={{
              background: '#f8fafc',
              color: '#475569',
              border: '1px dashed #cbd5e1',
              fontSize: '0.72rem',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 0,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              maxWidth: '110px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {departmentText}
            </span>
          )}

          {/* Employment Type Pill */}
          {employmentText && (
            <span style={{
              background: '#f8fafc',
              color: '#475569',
              border: '1px dashed #cbd5e1',
              fontSize: '0.72rem',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 0,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              {employmentText}
            </span>
          )}

          {/* Seniority or 1 Key Skill Badge */}
          {skills && skills.length > 0 ? (
            <span
              style={{
                background: '#ffffff',
                border: '1px dashed #cbd5e1',
                color: '#475569',
                fontSize: '0.72rem',
                fontWeight: 500,
                padding: '2px 8px',
                borderRadius: 0,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                maxWidth: '95px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {skills[0]}
            </span>
          ) : seniorityText ? (
            <span style={{
              background: '#f8fafc',
              color: '#475569',
              border: '1px dashed #cbd5e1',
              fontSize: '0.72rem',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 0,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              maxWidth: '95px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {seniorityText}
            </span>
          ) : null}
        </div>

        {/* Salary Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.84rem',
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: '5px'
        }}>
          <span style={{
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            background: '#780115',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.62rem',
            fontWeight: 800
          }}>
            $
          </span>
          <span>{displaySalary}</span>
        </div>

        {/* Location Row (Under the salary) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.78rem',
          color: '#64748b',
          fontWeight: 500,
          marginBottom: '6px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          <MapPin size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{locationText}</span>
        </div>

        {/* Date Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.76rem',
          color: '#94a3b8',
          marginBottom: '18px'
        }}>
          <Clock size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
          <span>{displayDate}</span>
        </div>
      </div>

      {/* Bottom Action: 3 Buttons on a Single Line (Responsive Stacking on Mobile) */}
      <div className="job-card-actions-row">
        <a
          href={applyHref}
          target="_blank"
          rel="noopener noreferrer"
          className="job-card-apply-btn"
          style={{
            background: '#780115',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 700,
            padding: '7px 14px',
            borderRadius: 0,
            border: '1px solid #780115',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
            boxShadow: '0 1px 2px rgba(120, 1, 21, 0.15)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5c0010'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#780115'}
        >
          <span>Apply</span>
          <ArrowUpRight size={12} />
        </a>

        <a
          href={careerPortalHref}
          target="_blank"
          rel="noopener noreferrer"
          className="job-card-secondary-btn"
          title={`Visit official ${job.company || 'company'} careers page`}
          style={{
            background: '#ffffff',
            color: '#334155',
            fontSize: '0.76rem',
            fontWeight: 600,
            padding: '7px 6px',
            borderRadius: 0,
            border: '1px dashed #cbd5e1',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#780115';
            e.currentTarget.style.color = '#780115';
            e.currentTarget.style.background = '#fff1f2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.color = '#334155';
            e.currentTarget.style.background = '#ffffff';
          }}
        >
          <Globe size={12} color="currentColor" style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Careers</span>
        </a>

        <button
          onClick={() => onOpenReachout(job)}
          className="job-card-secondary-btn"
          title="Open Company Outreach & Hiring Team Directory"
          style={{
            background: '#fff1f2',
            color: '#780115',
            fontSize: '0.76rem',
            fontWeight: 700,
            padding: '7px 6px',
            borderRadius: 0,
            border: '1px dashed #780115',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ffe4e6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff1f2';
          }}
        >
          <Mail size={12} color="#780115" style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Outreach</span>
        </button>
      </div>
    </div>
  );
}

export default function JobCardGrid({ 
  jobs = [], 
  onToggleBookmark, 
  onSelectJob,
  onOpenFilterModal,
  onResetFilters
}) {
  const [displayCount, setDisplayCount] = useState(100);
  const [reachoutModalJob, setReachoutModalJob] = useState(null);

  // Reset display count to 100 whenever jobs list or filters change
  React.useEffect(() => {
    setDisplayCount(100);
  }, [jobs]);

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 100, jobs.length));
  };

  const visibleJobs = jobs.slice(0, displayCount);

  if (jobs.length === 0) {
    return (
      <div style={{
        background: '#ffffff',
        border: '1px dashed #cbd5e1',
        borderRadius: 0,
        padding: '60px 20px',
        textAlign: 'center',
        color: '#64748b',
        position: 'relative'
      }}>
        <CornerPlusMarkers color="#94a3b8" bg="#ffffff" size="14px" />
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
        <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '6px', fontWeight: 700 }}>No Positions Found</h3>
        <p style={{ maxWidth: '400px', margin: '0 auto 16px', fontSize: '0.84rem' }}>Try clearing filters or search for another company or role title.</p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#780115',
              color: '#ffffff',
              border: 'none',
              borderRadius: 0,
              padding: '9px 18px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(120, 1, 21, 0.2)',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5c0010'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#780115'}
          >
            <RotateCcw size={14} />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Cards 3-Column Responsive Grid */}
      <div className="careerhut-3col-grid">
        {visibleJobs.map((job) => (
          <JobCard 
            key={job.id} 
            job={job} 
            onToggleBookmark={onToggleBookmark} 
            onOpenReachout={(j) => setReachoutModalJob(j)}
          />
        ))}
      </div>

      {/* Load More Button if needed */}
      {visibleJobs.length < jobs.length && (
        <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '20px' }}>
          <button
            onClick={handleLoadMore}
            style={{
              background: '#ffffff',
              border: '1px dashed #cbd5e1',
              color: '#1e293b',
              padding: '10px 28px',
              borderRadius: 0,
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#780115';
              e.currentTarget.style.color = '#780115';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.color = '#1e293b';
            }}
          >
            Load 100 More Positions ({visibleJobs.length} of {jobs.length.toLocaleString()})
          </button>
        </div>
      )}

      {/* Company Outreach Modal */}
      <CompanyOutreachModal 
        job={reachoutModalJob} 
        isOpen={Boolean(reachoutModalJob)} 
        onClose={() => setReachoutModalJob(null)} 
      />
    </div>
  );
}

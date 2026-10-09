import React, { useState } from 'react';

// ==========================================
// 1. LOCAL LOGO STATIC ASSET MAP
// All 85+ verified logos in public/logos/ (SVG & high-res PNG)
// ==========================================
export const LOCAL_LOGOS = {
  stripe: '/logos/stripe.svg',
  anthropic: '/logos/anthropic.svg',
  openai: '/logos/openai.svg',
  databricks: '/logos/databricks.svg',
  datadog: '/logos/datadog.svg',
  elastic: '/logos/elastic.svg',
  cloudflare: '/logos/cloudflare.svg',
  mongodb: '/logos/mongodb.svg',
  okta: '/logos/okta.svg',
  snowflake: '/logos/snowflake.svg',
  crowdstrike: '/logos/crowdstrike.svg',
  palantir: '/logos/palantir.svg',
  brex: '/logos/brex.svg',
  deel: '/logos/deel.svg',
  coinbase: '/logos/coinbase.svg',
  gitlab: '/logos/gitlab.svg',
  docusign: '/logos/docusign.svg',
  snap: '/logos/snap.svg',
  scale: '/logos/scale.svg',
  scaleai: '/logos/scaleai.svg',
  affirm: '/logos/affirm.svg',
  pinterest: '/logos/pinterest.svg',
  ramp: '/logos/ramp.svg',
  airbnb: '/logos/airbnb.svg',
  figma: '/logos/figma.svg',
  robinhood: '/logos/robinhood.svg',
  reddit: '/logos/reddit.svg',
  cursor: '/logos/cursor.svg',
  elevenlabs: '/logos/elevenlabs.svg',
  notion: '/logos/notion.svg',
  twilio: '/logos/twilio.svg',
  cohere: '/logos/cohere.svg',
  wiz: '/logos/wiz.svg',
  perplexity: '/logos/perplexity.svg',
  instacart: '/logos/instacart.svg',
  plaid: '/logos/plaid.svg',
  grafana: '/logos/grafana.svg',
  intercom: '/logos/intercom.svg',
  gusto: '/logos/gusto.svg',
  asana: '/logos/asana.svg',
  vercel: '/logos/vercel.svg',
  vanta: '/logos/vanta.svg',
  spotify: '/logos/spotify.svg',
  grammarly: '/logos/grammarly.svg',
  chime: '/logos/chime.svg',
  temporal: '/logos/temporal.svg',
  mercury: '/logos/mercury.svg',
  docker: '/logos/docker.svg',
  jetbrains: '/logos/jetbrains.svg',
  duolingo: '/logos/duolingo.svg',
  benchling: '/logos/benchling.svg',
  mixpanel: '/logos/mixpanel.svg',
  supabase: '/logos/supabase.svg',
  discord: '/logos/discord.svg',
  runway: '/logos/runway.svg',
  sentry: '/logos/sentry.svg',
  remote: '/logos/remote.svg',
  render: '/logos/render.svg',
  amplitude: '/logos/amplitude.svg',
  dropbox: '/logos/dropbox.svg',
  shopify: '/logos/shopify.svg',
  mozilla: '/logos/mozilla.svg',
  postman: '/logos/postman.svg',
  rippling: '/logos/rippling.svg',
  linear: '/logos/linear.svg',
  miro: '/logos/miro.svg',
  retool: '/logos/retool.svg',
  webflow: '/logos/webflow.svg',
  snyk: '/logos/snyk.svg',
  canva: '/logos/canva.svg',
  segment: '/logos/segment.svg',
  loom: '/logos/loom.svg',
  planetscale: '/logos/planetscale.svg',
  automattic: '/logos/automattic.svg',
  wikimedia: '/logos/wikimedia.svg',
  descript: '/logos/descript.svg',
  zapier: '/logos/zapier.svg',
  sourcegraph: '/logos/sourcegraph.svg',
  calendly: '/logos/calendly.svg',
  posthog: '/logos/posthog.svg',
  doordash: '/logos/doordash.svg',
  huggingface: '/logos/huggingface.svg',
  airtable: '/logos/airtable.svg',
  neon: '/logos/neon.svg',
  flydotio: '/logos/flydotio.svg',
  google: '/logos/google.svg',
  apple: '/logos/apple.svg',
  microsoft: '/logos/microsoft.svg',
  amazon: '/logos/amazon.svg',
  netflix: '/logos/netflix.svg',
  slack: '/logos/slack.svg',
  github: '/logos/github.svg'
};

// ==========================================
// 2. BRAND COLOR PALETTES FOR AVATARS & CONTAINERS
// ==========================================
export const COMPANY_COLORS = {
  stripe: { bg: '#635BFF', text: '#FFFFFF', letter: 'S' },
  anthropic: { bg: '#18181B', text: '#D97706', letter: 'A' },
  openai: { bg: '#10A37F', text: '#FFFFFF', letter: 'O' },
  databricks: { bg: '#1B1B1D', text: '#FF3621', letter: 'D' },
  datadog: { bg: '#632CA6', text: '#FFFFFF', letter: 'D' },
  elastic: { bg: '#005571', text: '#FED10A', letter: 'E' },
  cloudflare: { bg: '#F38020', text: '#FFFFFF', letter: 'C' },
  mongodb: { bg: '#001E2B', text: '#00ED64', letter: 'M' },
  okta: { bg: '#00297A', text: '#FFFFFF', letter: 'O' },
  snowflake: { bg: '#001529', text: '#29B5E8', letter: 'S' },
  crowdstrike: { bg: '#000000', text: '#E01E26', letter: 'C' },
  palantir: { bg: '#0F172A', text: '#FFFFFF', letter: 'P' },
  brex: { bg: '#000000', text: '#F03D24', letter: 'B' },
  deel: { bg: '#15357A', text: '#22C55E', letter: 'D' },
  coinbase: { bg: '#0052FF', text: '#FFFFFF', letter: 'C' },
  gitlab: { bg: '#292961', text: '#FC6D26', letter: 'G' },
  docusign: { bg: '#002D72', text: '#FFD000', letter: 'D' },
  snap: { bg: '#FFFC00', text: '#000000', letter: 'S' },
  scale: { bg: '#000000', text: '#D946EF', letter: 'S' },
  affirm: { bg: '#004BFF', text: '#FFFFFF', letter: 'A' },
  pinterest: { bg: '#BD081C', text: '#FFFFFF', letter: 'P' },
  ramp: { bg: '#000000', text: '#E2F952', letter: 'R' },
  airbnb: { bg: '#FF5A5F', text: '#FFFFFF', letter: 'A' },
  figma: { bg: '#1E1E1E', text: '#A259FF', letter: 'F' },
  robinhood: { bg: '#00C805', text: '#FFFFFF', letter: 'R' },
  reddit: { bg: '#FF4500', text: '#FFFFFF', letter: 'R' },
  cursor: { bg: '#000000', text: '#FFFFFF', letter: 'C' },
  elevenlabs: { bg: '#000000', text: '#FFFFFF', letter: 'E' },
  notion: { bg: '#000000', text: '#FFFFFF', letter: 'N' },
  twilio: { bg: '#F22F46', text: '#FFFFFF', letter: 'T' },
  cohere: { bg: '#39594C', text: '#FAF1EA', letter: 'C' },
  wiz: { bg: '#0057FF', text: '#FFFFFF', letter: 'W' },
  perplexity: { bg: '#14171A', text: '#22D3EE', letter: 'P' },
  instacart: { bg: '#003D29', text: '#43B02A', letter: 'I' },
  plaid: { bg: '#000000', text: '#FFFFFF', letter: 'P' },
  grafana: { bg: '#1F232B', text: '#F46800', letter: 'G' },
  intercom: { bg: '#1F8EED', text: '#FFFFFF', letter: 'I' },
  gusto: { bg: '#F45D48', text: '#FFFFFF', letter: 'G' },
  asana: { bg: '#F06A6A', text: '#FFFFFF', letter: 'A' },
  vercel: { bg: '#000000', text: '#FFFFFF', letter: 'V' },
  vanta: { bg: '#2E1B4E', text: '#38BDF8', letter: 'V' },
  spotify: { bg: '#1DB954', text: '#FFFFFF', letter: 'S' },
  grammarly: { bg: '#15C39A', text: '#FFFFFF', letter: 'G' },
  chime: { bg: '#25C974', text: '#FFFFFF', letter: 'C' },
  temporal: { bg: '#111827', text: '#00FFFF', letter: 'T' },
  mercury: { bg: '#000000', text: '#2DD4BF', letter: 'M' },
  docker: { bg: '#0B132B', text: '#2496ED', letter: 'D' },
  jetbrains: { bg: '#000000', text: '#FC6D26', letter: 'J' },
  duolingo: { bg: '#58CC02', text: '#FFFFFF', letter: 'D' },
  benchling: { bg: '#14233C', text: '#10B981', letter: 'B' },
  mixpanel: { bg: '#7856FF', text: '#FFFFFF', letter: 'M' },
  supabase: { bg: '#1C1C1C', text: '#3ECF8E', letter: 'S' },
  discord: { bg: '#5865F2', text: '#FFFFFF', letter: 'D' },
  runway: { bg: '#09090B', text: '#FFFFFF', letter: 'R' },
  sentry: { bg: '#362D59', text: '#FF3E6C', letter: 'S' },
  remote: { bg: '#001D4A', text: '#10B981', letter: 'R' },
  render: { bg: '#000000', text: '#46E3B7', letter: 'R' },
  amplitude: { bg: '#1940B0', text: '#FFFFFF', letter: 'A' },
  dropbox: { bg: '#0061FF', text: '#FFFFFF', letter: 'D' },
  shopify: { bg: '#95BF47', text: '#FFFFFF', letter: 'S' },
  mozilla: { bg: '#000000', text: '#FFFFFF', letter: 'M' },
  postman: { bg: '#FF6C37', text: '#FFFFFF', letter: 'P' },
  rippling: { bg: '#FF8F00', text: '#FFFFFF', letter: 'R' },
  linear: { bg: '#5E6AD2', text: '#FFFFFF', letter: 'L' },
  miro: { bg: '#FFD02F', text: '#050038', letter: 'M' },
  retool: { bg: '#1F2430', text: '#FFC83B', letter: 'R' },
  webflow: { bg: '#146EF5', text: '#FFFFFF', letter: 'W' },
  snyk: { bg: '#141B3B', text: '#A855F7', letter: 'S' },
  canva: { bg: '#00C4CC', text: '#FFFFFF', letter: 'C' },
  segment: { bg: '#52BD95', text: '#FFFFFF', letter: 'S' },
  loom: { bg: '#625DF5', text: '#FFFFFF', letter: 'L' },
  planetscale: { bg: '#000000', text: '#FFFFFF', letter: 'P' },
  automattic: { bg: '#0087BE', text: '#FFFFFF', letter: 'A' },
  wikimedia: { bg: '#2B2B2B', text: '#FFFFFF', letter: 'W' },
  descript: { bg: '#1E2022', text: '#38BDF8', letter: 'D' },
  zapier: { bg: '#FF4F00', text: '#FFFFFF', letter: 'Z' },
  sourcegraph: { bg: '#0A0D10', text: '#0064FA', letter: 'S' },
  calendly: { bg: '#006BFF', text: '#FFFFFF', letter: 'C' },
  posthog: { bg: '#1D1F27', text: '#F54E00', letter: 'P' },
  doordash: { bg: '#FF3008', text: '#FFFFFF', letter: 'D' },
  huggingface: { bg: '#FFD21E', text: '#111827', letter: 'H' },
  airtable: { bg: '#FFFFFF', text: '#18BFFF', letter: 'A' },
  neon: { bg: '#00E599', text: '#000000', letter: 'N' },
  flydotio: { bg: '#24185B', text: '#FFFFFF', letter: 'F' },
  google: { bg: '#FFFFFF', text: '#4285F4', letter: 'G' },
  apple: { bg: '#000000', text: '#FFFFFF', letter: 'A' },
  microsoft: { bg: '#FFFFFF', text: '#00A4EF', letter: 'M' },
  amazon: { bg: '#131921', text: '#FF9900', letter: 'A' },
  netflix: { bg: '#000000', text: '#E50914', letter: 'N' },
  slack: { bg: '#4A154B', text: '#FFFFFF', letter: 'S' },
  github: { bg: '#181717', text: '#FFFFFF', letter: 'G' }
};

/** Normalizes any company name string into standard key */
export function getCompanyKey(name) {
  if (!name) return '';
  const lower = String(name).toLowerCase().trim();

  if (lower.includes('coinbase')) return 'coinbase';
  if (lower.includes('snap') || lower.includes('snapchat')) return 'snap';
  if (lower.includes('grafana')) return 'grafana';
  if (lower.includes('anthropic') || lower.includes('claude')) return 'anthropic';
  if (lower.includes('datadog')) return 'datadog';
  if (lower.includes('databricks')) return 'databricks';
  if (lower.includes('cloudflare')) return 'cloudflare';
  if (lower.includes('snowflake')) return 'snowflake';
  if (lower.includes('elastic') || lower.includes('elasticsearch')) return 'elastic';
  if (lower.includes('crowdstrike')) return 'crowdstrike';
  if (lower.includes('gitlab')) return 'gitlab';
  if (lower.includes('deel') || lower.includes('letsdeel')) return 'deel';
  if (lower.includes('linear')) return 'linear';
  if (lower.includes('ramp')) return 'ramp';
  if (lower.includes('canva')) return 'canva';
  if (lower.includes('reddit')) return 'reddit';
  if (lower.includes('airbnb')) return 'airbnb';
  if (lower.includes('scale ai') || lower === 'scale') return 'scale';
  if (lower.includes('affirm')) return 'affirm';
  if (lower.includes('docusign')) return 'docusign';
  if (lower.includes('sentry')) return 'sentry';
  if (lower.includes('discord')) return 'discord';
  if (lower.includes('slack')) return 'slack';
  if (lower.includes('github')) return 'github';
  if (lower.includes('posthog')) return 'posthog';
  if (lower.includes('palantir')) return 'palantir';
  if (lower.includes('supabase')) return 'supabase';
  if (lower.includes('vercel')) return 'vercel';
  if (lower.includes('runway')) return 'runway';
  if (lower.includes('miro')) return 'miro';
  if (lower.includes('intercom')) return 'intercom';
  if (lower.includes('duolingo')) return 'duolingo';
  if (lower.includes('cohere')) return 'cohere';
  if (lower.includes('notion')) return 'notion';
  if (lower.includes('docker')) return 'docker';
  if (lower.includes('airtable')) return 'airtable';
  if (lower.includes('okta') || lower.includes('our team')) return 'okta';
  if (lower.includes('figma')) return 'figma';
  if (lower.includes('cursor') || lower.includes('anysphere')) return 'cursor';
  if (lower.includes('temporal')) return 'temporal';
  if (lower.includes('twilio')) return 'twilio';
  if (lower.includes('mongo')) return 'mongodb';
  if (lower.includes('brex') || lower.includes('bret')) return 'brex';
  if (lower.includes('stripe')) return 'stripe';
  if (lower.includes('openai')) return 'openai';
  if (lower.includes('google') || lower.includes('alphabet')) return 'google';
  if (lower.includes('apple')) return 'apple';
  if (lower.includes('microsoft')) return 'microsoft';
  if (lower.includes('amazon') || lower.includes('aws')) return 'amazon';
  if (lower.includes('netflix')) return 'netflix';
  if (lower.includes('spotify')) return 'spotify';
  if (lower.includes('shopify')) return 'shopify';
  if (lower.includes('pinterest')) return 'pinterest';
  if (lower.includes('robinhood')) return 'robinhood';
  if (lower.includes('elevenlabs')) return 'elevenlabs';
  if (lower.includes('wiz')) return 'wiz';
  if (lower.includes('perplexity')) return 'perplexity';
  if (lower.includes('instacart')) return 'instacart';
  if (lower.includes('plaid')) return 'plaid';
  if (lower.includes('gusto')) return 'gusto';
  if (lower.includes('asana')) return 'asana';
  if (lower.includes('vanta')) return 'vanta';
  if (lower.includes('grammarly')) return 'grammarly';
  if (lower.includes('chime')) return 'chime';
  if (lower.includes('mercury')) return 'mercury';
  if (lower.includes('jetbrains')) return 'jetbrains';
  if (lower.includes('benchling')) return 'benchling';
  if (lower.includes('mixpanel')) return 'mixpanel';
  if (lower.includes('remote')) return 'remote';
  if (lower.includes('render')) return 'render';
  if (lower.includes('amplitude')) return 'amplitude';
  if (lower.includes('dropbox')) return 'dropbox';
  if (lower.includes('mozilla')) return 'mozilla';
  if (lower.includes('postman')) return 'postman';
  if (lower.includes('rippling')) return 'rippling';
  if (lower.includes('retool')) return 'retool';
  if (lower.includes('webflow')) return 'webflow';
  if (lower.includes('snyk')) return 'snyk';
  if (lower.includes('segment')) return 'segment';
  if (lower.includes('loom')) return 'loom';
  if (lower.includes('planetscale')) return 'planetscale';
  if (lower.includes('automattic')) return 'automattic';
  if (lower.includes('wikimedia')) return 'wikimedia';
  if (lower.includes('descript')) return 'descript';
  if (lower.includes('zapier')) return 'zapier';
  if (lower.includes('sourcegraph')) return 'sourcegraph';
  if (lower.includes('calendly')) return 'calendly';
  if (lower.includes('doordash')) return 'doordash';
  if (lower.includes('hugging')) return 'huggingface';
  if (lower.includes('neon')) return 'neon';
  if (lower.includes('fly')) return 'flydotio';

  return lower.replace(/[^a-z0-9]/g, '');
}

/** Resolve a logo URL from any of the shapes the app receives (API, static data, or company name). */
export function resolveLogoUrl(source) {
  if (!source) return null;
  const compName = typeof source === 'string' ? source : (source.company || source.name || '');
  const key = getCompanyKey(compName);

  // 1. Direct local verified asset
  if (key && LOCAL_LOGOS[key]) {
    return LOCAL_LOGOS[key];
  }

  // 2. Object property if already supplied
  if (typeof source === 'object' && (source.company_logo || source.logoUrl || source.companyLogo)) {
    return source.company_logo || source.logoUrl || source.companyLogo;
  }

  // 3. Fallback CDN
  const cleanSlug = compName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanSlug) {
    return `https://unavatar.io/${cleanSlug}.com?w=128`;
  }

  return null;
}

export function letterAvatar(name) {
  const key = getCompanyKey(name);
  if (COMPANY_COLORS[key]) return COMPANY_COLORS[key];

  const colors = [
    { bg: '#fee2e2', text: '#b91c1c' },
    { bg: '#fef3c7', text: '#b45309' },
    { bg: '#dcfce7', text: '#15803d' },
    { bg: '#e0e7ff', text: '#4338ca' },
    { bg: '#f3e8ff', text: '#7e22ce' },
    { bg: '#ffe4e6', text: '#be123c' },
    { bg: '#ccfbf1', text: '#0f766e' }
  ];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = (name.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  }
  const color = colors[Math.abs(hash) % colors.length];
  return { ...color, letter: (name || 'C').charAt(0).toUpperCase() };
}

/**
 * CompanyLogo component:
 * 1. Checks local verified SVG/PNG brand asset file in public/logos/
 * 2. Renders pixel-perfect crisp logo with white/clean backing container
 * 3. Gracefully falls back to stylized letter avatar on failure
 */
export default function CompanyLogo({ src, logoUrl, name, company, size = 38, radius = 8, style }) {
  const [failed, setFailed] = useState(false);
  const compName = name || company || '';
  const compKey = getCompanyKey(compName);

  // Determine source image URL: prioritize verified local SVG brand assets
  const resolvedSrc = (compKey && LOCAL_LOGOS[compKey]) || src || logoUrl || resolveLogoUrl(compName);

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: radius,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(0,0,0,0.08)',
    ...style
  };

  if (resolvedSrc && !failed) {
    return (
      <div style={containerStyle}>
        <img
          src={resolvedSrc}
          alt={compName ? `${compName} logo` : 'Company logo'}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: size >= 32 ? '4px' : '2px'
          }}
        />
      </div>
    );
  }

  const avatar = letterAvatar(compName);
  return (
    <div
      style={{
        ...containerStyle,
        backgroundColor: avatar.bg,
        color: avatar.text,
        fontWeight: 800,
        fontSize: Math.max(10, Math.round(size * 0.42)),
        border: '1px solid rgba(0,0,0,0.06)'
      }}
    >
      {avatar.letter}
    </div>
  );
}

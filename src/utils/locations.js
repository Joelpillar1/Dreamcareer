/**
 * Location utilities: free-form job location strings -> country / region.
 *
 * The crawler stores raw location text ("San Francisco, CA | New York City, NY",
 * "Remote - India", "GB-London", "Bengaluru, India", ...). The sidebar needs a
 * clean, complete country list to filter on, so we resolve every role's location
 * to one or more canonical countries here (client-side, so it works with the API
 * data *and* with the bundled fallback data).
 */

/* ------------------------------------------------------------------ *
 * 1. Noise: strings that carry no geographic information
 * ------------------------------------------------------------------ */
const NO_LOC = /^(not specified|unspecified|unknown|n\/?a|none|tbd|-|—|\?|null|undefined)$/i;

/* ------------------------------------------------------------------ *
 * 2. Country name / alias / city patterns
 *    Longest alias first inside each entry; matched case-insensitively.
 * ------------------------------------------------------------------ */
const COUNTRIES = [
  // NOTE: no bare "america" alias -- "North America" must stay a region.
  ['United States', '🇺🇸', ['united states', 'u\\.?s\\.?a\\.?', '\\bu\\.?s\\.?(?![a-z])', 'usca',
    'washington\\s*d\\.?c\\.?', 'washington,?\\s*d\\.?c\\.?']],
  ['United Kingdom', '🇬🇧', ['united kingdom', 'u\\.?k\\.?', 'great britain', '\\bengland\\b', '\\bscotland\\b', 'gb-[a-z]',
    'london', 'manchester', 'birmingham', 'leeds', 'bristol', 'edinburgh', 'glasgow',
    'sheffield', 'liverpool', 'newcastle', 'brighton', 'nottingham', 'aberdeen', 'reading']],
  ['Canada', '🇨🇦', ['\\bcanada\\b', '\\bcan\\b', 'toronto', 'montreal', 'vancouver', 'ottawa',
    'quebec city', '\\bquebec\\b', 'waterloo', 'calgary', 'edmonton', 'winnipeg', 'halifax',
    'ontario', 'alberta', 'british columbia', 'manitoba', 'saskatchewan', 'nova scotia',
    'new brunswick', 'newfoundland']],
  ['Ireland', '🇮🇪', ['\\bireland\\b', 'dublin', '\\bcork\\b', 'galway', 'limerick']],
  ['India', '🇮🇳', ['\\bindia\\b', 'bengaluru', 'bangalore', 'gurugram', 'gurgaon', 'hyderabad', 'mumbai', 'pune', 'chennai', 'delhi', 'noida', 'kolkata', 'ahmedabad', 'coimbatore', 'trivandrum', '\\bkochi\\b', 'jaipur', 'indore']],
  ['Singapore', '🇸🇬', ['\\bsingapore\\b']],
  ['Japan', '🇯🇵', ['\\bjapan\\b', '\\btokyo\\b', 'osaka', 'yokohama', 'jp-[a-z]']],
  ['Australia', '🇦🇺', ['\\baustralia\\b', 'sydney', 'melbourne', 'brisbane', '\\bperth\\b', 'adelaide', 'canberra']],
  ['Germany', '🇩🇪', ['\\bgermany\\b', 'berlin', 'munich', 'münchen', 'hamburg', 'frankfurt', 'cologne', 'köln', 'stuttgart', 'düsseldorf', 'heidelberg']],
  ['France', '🇫🇷', ['\\bfrance\\b', '\\bparis\\b', '\\blyon\\b', 'nantes', 'toulouse']],
  ['Netherlands', '🇳🇱', ['\\bnetherlands\\b', 'amsterdam', 'utrecht', 'rotterdam', 'the hague']],
  ['Spain', '🇪🇸', ['\\bspain\\b', 'madrid', 'barcelona', 'valencia', 'seville']],
  ['Portugal', '🇵🇹', ['\\bportugal\\b', 'lisbon', 'lisboa', '\\bporto\\b', 'braga']],
  ['Poland', '🇵🇱', ['\\bpoland\\b', 'warsaw', 'warszawa', 'krakow', 'kraków', 'wroclaw', 'gdansk', 'poznan', 'łódź', 'lodz', 'katowice', 'warsaw metropolitan']],
  ['Switzerland', '🇨🇭', ['switzerland', 'zurich', 'zürich', 'geneva', 'basel', 'lausanne']],
  ['Sweden', '🇸🇪', ['\\bsweden\\b', 'stockholm', 'gothenburg', 'göteborg', 'malmo', 'malmö']],
  ['Norway', '🇳🇴', ['\\bnorway\\b', '\\boslo\\b', 'bergen', 'trondheim']],
  ['Denmark', '🇩🇰', ['\\bdenmark\\b', 'copenhagen', '\\baarhus\\b']],
  ['Finland', '🇫🇮', ['\\bfinland\\b', 'helsinki', 'espoo', 'tampere']],
  ['Italy', '🇮🇹', ['\\bitaly\\b', 'milan', 'milano', '\\brome\\b', '\\broma\\b', 'turin', 'torino', 'bologna', 'padua', 'padova', 'florence']],
  ['Belgium', '🇧🇪', ['\\bbelgium\\b', 'brussels', 'antwerp', 'ghent']],
  ['Austria', '🇦🇹', ['\\baustria\\b', 'vienna', '\\bgraz\\b', 'linz']],
  ['Czechia', '🇨🇿', ['czech', 'prague', 'praha', 'brno']],
  ['Romania', '🇷🇴', ['\\bromania\\b', 'bucharest', 'cluj', 'iași', 'iasi', 'timisoara', 'brasov']],
  ['Bulgaria', '🇧🇬', ['\\bbulgaria\\b', '\\bsofia\\b', 'plovdiv', 'varna']],
  ['Hungary', '🇭🇺', ['\\bhungary\\b', 'budapest']],
  ['Greece', '🇬🇷', ['\\bgreece\\b', 'athens', 'thessaloniki']],
  ['Serbia', '🇷🇸', ['\\bserbia\\b', 'belgrade']],
  ['Croatia', '🇭🇷', ['\\bcroatia\\b', 'zagreb', 'split']],
  ['Slovenia', '🇸🇮', ['\\bslovenia\\b', 'ljubljana']],
  ['Slovakia', '🇸🇰', ['\\bslovakia\\b', 'bratislava']],
  ['Ukraine', '🇺🇦', ['\\bukraine\\b', '\\bkyiv\\b', '\\bkiev\\b', 'lviv', 'kharkiv']],
  ['Turkey', '🇹🇷', ['\\bturkey\\b', 'türkiye', 'istanbul', 'izmir', 'ankara']],
  ['Israel', '🇮🇱', ['\\bisrael\\b', 'tel aviv', 'haifa', 'jerusalem']],
  ['Estonia', '🇪🇪', ['\\bestonia\\b', 'tallinn']],
  ['Latvia', '🇱🇻', ['\\blatvia\\b', '\\briga\\b']],
  ['Lithuania', '🇱🇹', ['\\blithuania\\b', 'vilnius', 'kaunas']],
  ['Iceland', '🇮🇸', ['\\biceland\\b', 'reykjavik', 'reykjavík']],
  ['Luxembourg', '🇱🇺', ['\\bluxembourg\\b']],
  ['Malta', '🇲🇹', ['\\bmalta\\b']],
  ['Cyprus', '🇨🇾', ['\\bcyprus\\b', 'nicosia']],
  ['China', '🇨🇳', ['\\bchina\\b', 'beijing', 'shanghai', 'shenzhen', 'hangzhou', 'chengdu', 'guangzhou', 'beijing']],
  ['South Korea', '🇰🇷', ['south korea', 'republic of korea', '\\bkorea\\b', 'seoul', 'suwon']],
  ['Hong Kong', '🇭🇰', ['hong kong']],
  ['Taiwan', '🇹🇼', ['\\btaiwan\\b', 'taipei', 'hsinchu']],
  ['Malaysia', '🇲🇾', ['\\bmalaysia\\b', 'kuala lumpur', 'penang', 'johor bahru']],
  ['Indonesia', '🇮🇩', ['\\bindonesia\\b', 'jakarta', 'bandung', 'bali']],
  ['Thailand', '🇹🇭', ['\\bthailand\\b', 'bangkok', 'phuket']],
  ['Vietnam', '🇻🇳', ['\\bvietnam\\b', 'ho chi minh', 'hanoi', 'da nang']],
  ['Philippines', '🇵🇭', ['\\bphilippines\\b', 'manila', 'cebu']],
  ['United Arab Emirates', '🇦🇪', ['united arab emirates', 'u\\.?a\\.?e\\.?', 'dubai', 'abu dhabi', 'sharjah']],
  ['Saudi Arabia', '🇸🇦', ['saudi', 'riyadh', 'jeddah']],
  ['Qatar', '🇶🇦', ['\\bqatar\\b', 'doha']],
  ['Egypt', '🇪🇬', ['\\begypt\\b', '\\bcairo\\b', 'giza']],
  ['Nigeria', '🇳🇬', ['\\bnigeria\\b', 'lagos', 'abuja']],
  ['Kenya', '🇰🇪', ['\\bkenya\\b', 'nairobi']],
  ['Ghana', '🇬🇭', ['\\bghana\\b', 'accra']],
  ['South Africa', '🇿🇦', ['south africa', 'cape town', 'johannesburg', 'durban']],
  ['Cameroon', '🇨🇲', ['\\bcameroon\\b', 'douala', 'yaound']],
  ['Angola', '🇦🇴', ['\\bangola\\b', 'luanda']],
  ['Brazil', '🇧🇷', ['\\bbrazil\\b', 'são paulo', 'sao paulo', 'rio de janeiro', 'curitiba', 'florianópolis', 'florianopolis', 'belo horizonte', 'brasília', 'brasilia']],
  ['Argentina', '🇦🇷', ['\\bargentina\\b', 'buenos aires']],
  ['Chile', '🇨🇱', ['\\bchile\\b', 'santiago']],
  ['Colombia', '🇨🇴', ['\\bcolombia\\b', 'bogotá', 'bogota', 'medellín', 'medellin']],
  ['Mexico', '🇲🇽', ['(?<!new )\\bmexico\\b', 'guadalajara', 'monterrey', 'querétaro', 'queretaro']],
  ['Costa Rica', '🇨🇷', ['costa rica', 'san josé']],
  // NB: no \b around non-ASCII ("perú") -- JS \b only understands [A-Za-z0-9_].
  ['Peru', '🇵🇪', ['per(?:u|ú)', '\\blima\\b']],
  ['Uruguay', '🇺🇾', ['\\buruguay\\b', 'montevideo']],
  ['Dominican Republic', '🇩🇴', ['dominican republic', 'santo domingo']],
  ['Guatemala', '🇬🇹', ['\\bguatemala\\b', 'guatemala city']],
  ['Panama', '🇵🇦', ['\\bpanama\\b', 'panama city']],
  ['Ecuador', '🇪🇨', ['\\becuador\\b', 'quito']],
  ['Bolivia', '🇧🇴', ['\\bbolivia\\b', 'la paz']],
  ['Paraguay', '🇵🇾', ['\\bparaguay\\b', 'asuncion']],
  ['Armenia', '🇦🇲', ['\\barmenia\\b', 'yerevan']],
  ['Azerbaijan', '🇦🇿', ['\\bazerbaijan\\b', 'baku']],
  ['Kazakhstan', '🇰🇿', ['\\bkazakhstan\\b', 'almaty', 'astana']],
  ['Georgia', '🇬🇪', ['tbilisi', 'batumi']],
  ['Belarus', '🇧🇾', ['\\bbelarus\\b', 'minsk']],
  ['Montenegro', '🇲🇪', ['\\bmontenegro\\b', 'podgorica']],
  ['Kosovo', '🇽🇰', ['\\bkosovo\\b', 'pristina']],
  ['Bosnia and Herzegovina', '🇧🇦', ['bosnia', 'sarajevo']],
  ['Albania', '🇦🇱', ['\\balbania\\b', 'tirana']],
  ['North Macedonia', '🇲🇰', ['macedonia', 'skopje']],
  ['Moldova', '🇲🇩', ['\\bmoldova\\b', 'chisinau']],
  ['Pakistan', '🇵🇰', ['\\bpakistan\\b', 'islamabad', 'karachi', 'lahore']],
  ['Bangladesh', '🇧🇩', ['\\bbangladesh\\b', 'dhaka']],
  ['Sri Lanka', '🇱🇰', ['sri lanka', 'colombo']],
  ['Nepal', '🇳🇵', ['\\bnepal\\b', 'kathmandu']],
  ['Jordan', '🇯🇴', ['\\bjordan\\b', '\\bamman\\b']],
  ['Lebanon', '🇱🇧', ['\\blebanon\\b', 'beirut']],
  ['Morocco', '🇲🇦', ['\\bmorocco\\b', 'casablanca', 'rabat']],
  ['Algeria', '🇩🇿', ['\\balgeria\\b', 'algiers']],
  ['Tunisia', '🇹🇳', ['\\btunisia\\b', 'tunis']],
  ['Ethiopia', '🇪🇹', ['\\bethiopia\\b', 'addis ababa']],
  ['Tanzania', '🇹🇿', ['\\btanzania\\b', 'dar es salaam']],
  ['Uganda', '🇺🇬', ['\\buganda\\b', 'kampala']],
  ['Rwanda', '🇷🇼', ['\\brwanda\\b', 'kigali']],
  ['Senegal', '🇸🇳', ['\\bsenegal\\b', 'dakar']],
  ["Côte d'Ivoire", '🇨🇮', ['ivoire', 'ivory coast', 'abidjan']],
  ['New Zealand', '🇳🇿', ['new zealand', 'auckland', 'wellington', 'christchurch']],
];

/* ------------------------------------------------------------------ *
 * 3. US-only fallbacks
 * ------------------------------------------------------------------ */
const US_CITIES = [
  'san francisco', 'new york', 'seattle', 'austin', 'boston', 'chicago', 'denver',
  'los angeles', 'san jose', 'palo alto', 'mountain view', 'menlo park', 'bellevue',
  'redmond', 'portland', 'salt lake city', 'atlanta', 'pittsburgh', 'dallas', 'houston',
  'phoenix', 'las vegas', 'raleigh', 'durham', 'charlotte', 'minneapolis', 'ann arbor',
  'madison', 'boise', 'boulder', 'san diego', 'sacramento', 'oakland', 'tampa', 'orlando',
  'miami', 'columbus', 'nashville', 'kansas city', 'st louis', 'indianapolis', 'detroit',
  'buffalo', 'rochester', 'hartford', 'newark', 'arlington', 'alexandria', 'tysons',
  'boca raton', 'tempe', 'scottsdale', 'tucson', 'omaha', 'des moines',
  'wichita', 'huntsville', 'bloomington', 'champaign', 'silver spring', 'reston',
  'herndon', 'brookline', 'quincy', 'jersey city', 'hoboken',
  'white plains', 'stamford', 'norwalk', 'san mateo', 'redwood city',
  'cupertino', 'honolulu', 'college park', 'chapel hill', 'provo', 'albany', 'erie',
];

const US_STATE_NAMES = [
  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut',
  'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
  'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan',
  'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire',
  'new jersey', 'new mexico', 'new york', 'north carolina', 'north dakota', 'ohio',
  'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina', 'south dakota',
  'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west virginia',
  'wisconsin', 'wyoming', 'district of columbia',
];

const US_STATE_ABBRS = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN',
  'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV',
  'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN',
  'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
];

/* ------------------------------------------------------------------ *
 * 4. Regions (used only when no single country can be resolved)
 * ------------------------------------------------------------------ */
const REGIONS = [
  ['EMEA', [/\bemea\b/i]],
  ['Europe', [/\beurope\b/i, /\bcee\b/i, /central and eastern europe/i]],
  ['North America', [/\bnorth america\b/i, /\bnortham\b/i, /\bnoram\b/i, /\bnamer\b/i, /\bamer\b/i]],
  ['Latin America', [/\blatin america\b/i, /\blatam\b/i, /\bsouth america\b/i]],
  ['APAC / Asia', [/\bapac\b/i, /\bapj\b/i, /\basia\b/i]],
  ['Middle East', [/\bmena\b/i, /\bmiddle east\b/i]],
  ['Africa', [/\bafrica\b/i]],
  ['Remote / Global', [/\bremote\b/i, /\bdistributed\b/i, /\bglobal\b/i, /\banywhere\b/i, /\bworldwide\b/i, /\bworld\b/i]],
];

/* ------------------------------------------------------------------ *
 * Compiled helpers
 * ------------------------------------------------------------------ */
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** An alias is written as a regex when it carries metacharacters; otherwise it's a literal. */
const aliasToSource = (a) => (a.includes('\\') || /[$^*+?()[\]{}|]/.test(a) ? a : escapeRe(a));

const COUNTRY_RES = COUNTRIES.map(([name, flag, aliases]) => ({
  name,
  flag,
  res: aliases.map(aliasToSource).map((a) => new RegExp(`(?:^|[^a-z])${a}(?![a-z])`, 'i')),
}));

const US_CITY_RES = new RegExp(
  `(?:^|[^a-z])(?:${US_CITIES.map(escapeRe).sort((a, b) => b.length - a.length).join('|')})(?![a-z])`,
  'i'
);

const US_SEGMENTS = new Set(
  [...US_STATE_NAMES, ...US_STATE_ABBRS, ...US_STATE_NAMES.map((s) => s.replace(/\s+/g, ''))]
    .map((s) => s.toLowerCase().replace(/[^a-z]/g, ''))
);

const PREFIX_RES = /\b([A-Z]{2})-[A-Za-z]/;

const NOISE_WORDS = /\b(remote|hybrid|onsite|on-site|in-office|in office|office|hq|distributed|global|anywhere|worldwide|flexible|friendly|based|hub|only|within|site|sites|locations?|opening|openings|role|roles|job|jobs|position|positions|team|teams|multi|multiple|other|various|several|plus|more|region|regions|country|countries)\b/gi;

/**
 * Resolve one location string to the list of countries it mentions.
 * @param {string} location raw location text (job.location)
 * @param {string} [country] optional job.country value from the fallback data
 * @returns {string[]} canonical country names (may be empty, may be >1)
 */
export function countriesFromLocation(location, country) {
  const found = [];
  const add = (name) => {
    if (name && !found.includes(name)) found.push(name);
  };

  const raw = `${location || ''} ${country || ''}`.trim();
  if (!raw || NO_LOC.test(raw.trim())) return [];

  // Some boards concatenate fields without separators
  // ("...MarketingFinanceRemote - USRemotePosted 9 days ago"). Splitting
  // UPPERCASE / camelCase runs back apart makes those parseable again.
  const norm = raw
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2');

  // Country value from the bundled fallback data is already canonical.
  if (country && COUNTRIES.some(([n]) => n.toLowerCase() === country.trim().toLowerCase())) {
    add(COUNTRIES.find(([n]) => n.toLowerCase() === country.trim().toLowerCase())[0]);
  }

  // 1. country-shaped prefix codes: "US-CA-Menlo Park", "GB-London", "JP-Tokyo"
  const pfx = PREFIX_RES.exec(norm);
  if (pfx) {
    const map = {
      US: 'United States', GB: 'United Kingdom', UK: 'United Kingdom', JP: 'Japan',
      AU: 'Australia', SG: 'Singapore', IE: 'Ireland', PL: 'Poland', SE: 'Sweden',
      NO: 'Norway', FI: 'Finland', DK: 'Denmark', NL: 'Netherlands', PT: 'Portugal',
      CZ: 'Czechia', RO: 'Romania', CH: 'Switzerland', IL: 'Israel', AE: 'United Arab Emirates',
      BR: 'Brazil', MX: 'Mexico', IN: 'India', DE: 'Germany', FR: 'France', ES: 'Spain',
      TR: 'Turkey', ZA: 'South Africa', NZ: 'New Zealand', KR: 'South Korea', CN: 'China',
    };
    if (map[pfx[1]]) add(map[pfx[1]]);
  }

  // 2. country names, aliases and international cities
  for (const { name, res } of COUNTRY_RES) {
    if (found.includes(name)) continue;
    for (const re of res) {
      if (re.test(norm)) {
        add(name);
        break;
      }
    }
  }

  // 3. US cities (unambiguous city names)
  if (!found.includes('United States') && US_CITY_RES.test(norm)) add('United States');

  // 4. US state names / abbreviations sitting in their own segment
  if (!found.includes('United States')) {
    const segments = norm
      .replace(new RegExp(NOISE_WORDS.source, 'gi'), ' ')
      .split(/[,;/|•·\-–—:()[\]]+/);
    for (const seg of segments) {
      const key = seg.trim().toLowerCase().replace(/[^a-z]/g, '');
      if (key && US_SEGMENTS.has(key)) {
        add('United States');
        break;
      }
    }
  }

  return found;
}

/**
 * Resolve a location string to region buckets (only useful when no country
 * was found, e.g. "EMEA", "Remote, Global", "LATAM, NORAM").
 * @returns {string[]} lower-cased region labels
 */
export function regionsFromLocation(location) {
  const s = `${location || ''}`
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  if (!s || NO_LOC.test(s.trim())) return [];
  const out = [];
  for (const [label, res] of REGIONS) {
    if (res.some((re) => re.test(s)) && !out.includes(label.toLowerCase())) out.push(label.toLowerCase());
  }
  return out;
}

/**
 * Build the sidebar location lists from every loaded job.
 * @param {Array<{location?:string,country?:string}>} jobs
 * @returns {{countries:Array<{label,value,icon,count}>, regions:Array<{label,value,icon,count}>}}
 */
export function buildLocationLists(jobs) {
  const countryCounts = new Map();
  const regionCounts = new Map();

  for (const job of jobs || []) {
    const loc = job.location || '';
    const countries = countriesFromLocation(loc, job.country);
    if (countries.length) {
      for (const c of countries) countryCounts.set(c, (countryCounts.get(c) || 0) + 1);
    } else {
      for (const r of regionsFromLocation(loc)) regionCounts.set(r, (regionCounts.get(r) || 0) + 1);
    }
  }

  const flagFor = new Map(COUNTRIES.map(([n, f]) => [n, f]));
  const regionIcons = {
    emea: '🌍', europe: '🇪🇺', 'north america': '🌎', 'latin america': '🌎',
    'apac / asia': '🌏', 'middle east': '🕌', africa: '🌍', 'remote / global': '🌐',
  };

  const countries = [...countryCounts.entries()]
    .map(([label, count]) => ({ label, value: label, icon: flagFor.get(label) || '🌐', count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const regions = [...regionCounts.entries()]
    .map(([key, count]) => {
      const entry = REGIONS.find(([label]) => label.toLowerCase() === key);
      const label = entry ? entry[0] : key;
      return { label, value: label, icon: regionIcons[key] || '🌐', count };
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  return { countries, regions };
}

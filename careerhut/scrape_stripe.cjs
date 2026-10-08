const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching Stripe careers search page...');
  const res = await fetchUrl('https://stripe.com/careers/search');
  console.log('Response status:', res.status, 'Body size:', res.body.length);
  
  // Look for next data or script tags
  const nextMatch = res.body.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (nextMatch) {
    console.log('Found __NEXT_DATA__ payload!');
    const parsed = JSON.parse(nextMatch[1]);
    console.log('Keys in props:', Object.keys(parsed.props || {}));
    console.log('Keys in pageProps:', Object.keys(parsed.props?.pageProps || {}));
    fs.writeFileSync('careerhut/stripe_next_data.json', JSON.stringify(parsed.props?.pageProps, null, 2));
    console.log('Saved careerhut/stripe_next_data.json');
  } else {
    console.log('__NEXT_DATA__ not found. Let us check for json scripts or html table.');
    // look for all script tags
    const scriptMatches = [...res.body.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
    console.log('Total scripts found:', scriptMatches.length);
    fs.writeFileSync('careerhut/stripe_page.html', res.body);
  }
}

main().catch(console.error);

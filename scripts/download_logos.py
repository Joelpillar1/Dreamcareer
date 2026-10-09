import os
import urllib.request
from concurrent.futures import ThreadPoolExecutor

os.makedirs("public/logos", exist_ok=True)

companies = {
    "stripe": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/stripe.svg",
    "anthropic": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/anthropic.svg",
    "openai": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/openai.svg",
    "databricks": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/databricks.svg",
    "datadog": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/datadog.svg",
    "elastic": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/elastic.svg",
    "cloudflare": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/cloudflare.svg",
    "mongodb": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mongodb.svg",
    "okta": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/okta.svg",
    "snowflake": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/snowflake.svg",
    "crowdstrike": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/crowdstrike.svg",
    "palantir": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/palantir.svg",
    "brex": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/brex.svg",
    "deel": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/letsdeel.svg",
    "coinbase": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/coinbase.svg",
    "gitlab": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/gitlab.svg",
    "docusign": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/docusign.svg",
    "snap": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/snapchat.svg",
    "scale": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/scale.svg",
    "scaleai": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/scale.svg",
    "affirm": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/affirm.svg",
    "pinterest": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/pinterest.svg",
    "ramp": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/ramp.svg",
    "airbnb": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/airbnb.svg",
    "figma": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/figma.svg",
    "robinhood": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/robinhood.svg",
    "reddit": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/reddit.svg",
    "cursor": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/cursor.svg",
    "elevenlabs": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/elevenlabs.svg",
    "notion": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/notion.svg",
    "twilio": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/twilio.svg",
    "cohere": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/cohere.svg",
    "wiz": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/wiz.svg",
    "perplexity": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/perplexity.svg",
    "instacart": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/instacart.svg",
    "plaid": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/plaid.svg",
    "grafana": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/grafana.svg",
    "intercom": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/intercom.svg",
    "gusto": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/gusto.svg",
    "asana": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/asana.svg",
    "vercel": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/vercel.svg",
    "vanta": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/vanta.svg",
    "spotify": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/spotify.svg",
    "grammarly": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/grammarly.svg",
    "chime": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/chime.svg",
    "temporal": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/temporal.svg",
    "mercury": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mercury.svg",
    "docker": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/docker.svg",
    "jetbrains": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/jetbrains.svg",
    "duolingo": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/duolingo.svg",
    "benchling": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/benchling.svg",
    "mixpanel": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mixpanel.svg",
    "supabase": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/supabase.svg",
    "discord": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/discord.svg",
    "runway": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/runway.svg",
    "sentry": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/sentry.svg",
    "remote": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/remote.svg",
    "render": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/render.svg",
    "amplitude": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/amplitude.svg",
    "dropbox": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/dropbox.svg",
    "shopify": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/shopify.svg",
    "mozilla": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mozilla.svg",
    "postman": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/postman.svg",
    "rippling": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/rippling.svg",
    "linear": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/linear.svg",
    "miro": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/miro.svg",
    "retool": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/retool.svg",
    "webflow": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/webflow.svg",
    "snyk": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/snyk.svg",
    "canva": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/canva.svg",
    "segment": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/segment.svg",
    "loom": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/loom.svg",
    "planetscale": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/planetscale.svg",
    "automattic": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/automattic.svg",
    "wikimedia": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/wikimediafoundation.svg",
    "descript": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/descript.svg",
    "zapier": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/zapier.svg",
    "sourcegraph": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/sourcegraph.svg",
    "calendly": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/calendly.svg",
    "posthog": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/posthog.svg",
    "doordash": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/doordash.svg",
    "huggingface": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/huggingface.svg",
    "airtable": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/airtable.svg",
    "neon": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/neon.svg",
    "flydotio": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/flydotio.svg",
    "google": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/google.svg",
    "apple": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/apple.svg",
    "microsoft": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/microsoft.svg",
    "amazon": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/amazon.svg",
    "netflix": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/netflix.svg",
    "slack": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/slack.svg",
    "github": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/github.svg"
}

headers = {'User-Agent': 'Mozilla/5.0'}

def fetch_one(item):
    name, url = item
    dest_svg = os.path.join("public/logos", f"{name}.svg")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=8) as resp:
            content = resp.read().decode('utf-8')
            with open(dest_svg, 'w', encoding='utf-8') as f:
                f.write(content)
        return (name, True, None)
    except Exception as e:
        return (name, False, str(e))

with ThreadPoolExecutor(max_workers=16) as executor:
    results = list(executor.map(fetch_one, list(companies.items())))

succeeded = [r[0] for r in results if r[1]]
failed = [r[0] for r in results if not r[1]]
print(f"DONE! Succeeded: {len(succeeded)}, Failed: {len(failed)}")
if failed:
    print(f"Failed list: {failed}")

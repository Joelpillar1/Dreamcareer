import os
import shutil
import json

# Ensure public/logos has all available assets
extra_copies = {
    "stripe": "public/stripe-logo.svg",
    "shopify": "public/shopify-logo.svg",
    "openai": "public/openai-logo.svg",
    "anthropic": "public/anthropic-logo.svg",
    "figma": "public/figma-logo.svg",
    "miro": "public/miro-logo.svg",
    "supabase": "public/supabase-logo.png",
    "notion": "public/notion-logo.png",
    "docker": "public/docker-logo.png",
    "duolingo": "public/duolingo-logo.png",
    "intercom": "public/intercom-logo.png",
    "mongodb": "public/mongodb-logo.png",
    "okta": "public/okta-logo.png",
    "palantir": "public/palantir-logo.png",
    "runway": "public/runway-logo.png",
    "temporal": "public/temporal-logo.png",
    "twilio": "public/twilio-logo.png",
    "vercel": "public/vercel-logo.png",
    "airtable": "public/airtable-logo.png"
}

for k, src in extra_copies.items():
    if os.path.exists(src):
        ext = os.path.splitext(src)[1]
        dest = f"public/logos/{k}{ext}"
        if not os.path.exists(dest):
            shutil.copyfile(src, dest)
            print(f"Copied {src} -> {dest}")

with open('public/data/companies.json', 'r') as f:
    comps = json.load(f)

print(f"Total companies in database: {len(comps)}")
for c in comps:
    name = c['company']
    print(f"Checking {name}...")

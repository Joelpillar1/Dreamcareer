import os
import urllib.request
import json
from concurrent.futures import ThreadPoolExecutor

os.makedirs("public/logos", exist_ok=True)

companies = {
    "crowdstrike": "crowdstrike.com",
    "deel": "deel.com",
    "scale": "scale.com",
    "scaleai": "scale.com",
    "affirm": "affirm.com",
    "ramp": "ramp.com",
    "wiz": "wiz.io",
    "plaid": "plaid.com",
    "vanta": "vanta.com",
    "chime": "chime.com",
    "mercury": "mercury.com",
    "benchling": "benchling.com",
    "remote": "remote.com",
    "amplitude": "amplitude.com",
    "rippling": "rippling.com",
    "segment": "segment.com",
    "descript": "descript.com",
    "sourcegraph": "sourcegraph.com"
}

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def fetch_brand(item):
    name, domain = item
    dest_png = os.path.join("public/logos", f"{name}.png")
    dest_svg = os.path.join("public/logos", f"{name}.svg")
    
    if os.path.exists(dest_svg) or os.path.exists(dest_png):
        return (name, True, "Already exists")

    urls = [
        f"https://unavatar.io/{domain}?w=256",
        f"https://logo.clearbit.com/{domain}?size=256",
        f"https://www.google.com/s2/favicons?domain={domain}&sz=128"
    ]
    for u in urls:
        try:
            req = urllib.request.Request(u, headers=headers)
            with urllib.request.urlopen(req, timeout=6) as resp:
                data = resp.read()
                if len(data) > 100:
                    with open(dest_png, 'wb') as f:
                        f.write(data)
                    return (name, True, u)
        except Exception:
            continue
    return (name, False, "Failed")

with ThreadPoolExecutor(max_workers=10) as executor:
    results = list(executor.map(fetch_brand, list(companies.items())))

for r in results:
    status = "OK" if r[1] else "FAIL"
    print(f"[{status}] {r[0]} -> {r[2]}")

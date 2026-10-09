import os
import urllib.request
import json
from concurrent.futures import ThreadPoolExecutor

remaining = {
    "crowdstrike": ["https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/crowdstrike.svg", "https://cdn.jsdelivr.net/npm/simple-icons@v14/icons/crowdstrike.svg"],
    "deel": ["https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/deel.svg", "https://api.iconify.design/simple-icons:deel.svg"],
    "scale": ["https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/scaleai.svg", "https://api.iconify.design/simple-icons:scaleai.svg", "https://svgl.app/library/scaleai.svg"],
    "scaleai": ["https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/scaleai.svg", "https://api.iconify.design/simple-icons:scaleai.svg"],
    "affirm": ["https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/affirm.svg", "https://api.iconify.design/simple-icons:affirm.svg"],
    "ramp": ["https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/ramp.svg", "https://svgl.app/library/ramp.svg", "https://api.iconify.design/simple-icons:ramp.svg"],
    "cursor": ["https://svgl.app/library/cursor.svg", "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/cursor.svg", "https://api.iconify.design/simple-icons:cursor.svg"],
    "elevenlabs": ["https://svgl.app/library/elevenlabs.svg", "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/elevenlabs.svg"],
    "cohere": ["https://svgl.app/library/cohere.svg", "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/cohere.svg", "https://api.iconify.design/simple-icons:cohere.svg"],
    "wiz": ["https://svgl.app/library/wiz.svg", "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/wiz.svg"],
    "plaid": ["https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/plaid.svg", "https://api.iconify.design/simple-icons:plaid.svg"],
    "gusto": ["https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/gusto.svg", "https://api.iconify.design/simple-icons:gusto.svg"],
    "vanta": ["https://svgl.app/library/vanta.svg", "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/vanta.svg"],
    "chime": ["https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/chime.svg", "https://api.iconify.design/simple-icons:chime.svg"],
    "mercury": ["https://svgl.app/library/mercury.svg", "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/mercury.svg"],
    "benchling": ["https://svgl.app/library/benchling.svg", "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/benchling.svg"],
    "runway": ["https://svgl.app/library/runwayml.svg", "https://svgl.app/library/runway.svg", "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/runway.svg"],
    "remote": ["https://svgl.app/library/remote.svg", "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/remote.svg"],
    "amplitude": ["https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/amplitude.svg", "https://api.iconify.design/simple-icons:amplitude.svg"],
    "rippling": ["https://svgl.app/library/rippling.svg", "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/rippling.svg"],
    "segment": ["https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/segment.svg", "https://api.iconify.design/simple-icons:segment.svg"],
    "descript": ["https://svgl.app/library/descript.svg", "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/descript.svg"],
    "sourcegraph": ["https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/sourcegraph.svg", "https://api.iconify.design/simple-icons:sourcegraph.svg"],
    "huggingface": ["https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/huggingface.svg", "https://api.iconify.design/simple-icons:huggingface.svg"],
    "neon": ["https://svgl.app/library/neon.svg", "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/neon.svg"],
    "flydotio": ["https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/flydotio.svg", "https://api.iconify.design/simple-icons:flydotio.svg"]
}

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def fetch_multi(item):
    name, urls = item
    dest_svg = os.path.join("public/logos", f"{name}.svg")
    for u in urls:
        try:
            req = urllib.request.Request(u, headers=headers)
            with urllib.request.urlopen(req, timeout=5) as resp:
                content = resp.read().decode('utf-8')
                if "<svg" in content:
                    with open(dest_svg, 'w', encoding='utf-8') as f:
                        f.write(content)
                    return (name, True, u)
        except Exception:
            continue
    return (name, False, "None succeeded")

with ThreadPoolExecutor(max_workers=10) as executor:
    results = list(executor.map(fetch_multi, list(remaining.items())))

for r in results:
    status = "OK" if r[1] else "FAIL"
    print(f"[{status}] {r[0]} -> {r[2]}")

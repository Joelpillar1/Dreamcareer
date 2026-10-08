"""
Careerhut Main Runner
Start the Web App Dashboard or run the CLI directly.
"""

import sys
import argparse
from careerhut.server import run_server
from careerhut.cli import main as cli_main

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ["fetch", "list", "export", "crawl-all", "enrich"]:
        cli_main()
    else:
        print("🚀 Launching Careerhut Direct Company Job Fetcher Server...")
        print("🌐 Open http://127.0.0.1:8000 in your browser to view the dashboard.")
        run_server(host="127.0.0.1", port=8000)

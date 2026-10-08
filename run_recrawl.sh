#!/usr/bin/env bash
# Temporary runner: clean re-crawl of the career pages the user listed.
set -u
URLS=(
  "https://zapier.com/jobs#job-openings"
  "https://www.pinterestcareers.com/jobs/"
  "https://crowdstrike.wd5.myworkdayjobs.com/crowdstrikecareers"
  "https://www.mongodb.com/company/careers/see-jobs"
  "https://about.gitlab.com/jobs/all-jobs/"
  "https://www.docker.com/career-openings/"
  "https://wikimediafoundation.org/jobs/#section-1"
  "https://www.okta.com/company/careers/job-listing/"
  "https://www.postman.com/company/careers/open-positions/"
  "https://remote.com/openings"
  "https://www.lifeatspotify.com/jobs"
  "https://www.coinbase.com/careers/positions?country=NG&currency=NGN&mobile=false&japan_bespoke_content=false&logged_in=false&null="
  "https://www.deel.com/careers/"
)
for u in "${URLS[@]}"; do
  echo "=============================================================="
  echo "CRAWLING: $u"
  python main.py fetch "$u" --refresh --limit 2000 || echo "FAILED: $u"
done
echo "ALL DONE"

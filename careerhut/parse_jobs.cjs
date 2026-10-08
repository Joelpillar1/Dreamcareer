const fs = require('fs');

const data = JSON.parse(fs.readFileSync('careerhut/stripe_next_data.json', 'utf8'));
const filters = data.jobIndexData?.filters || {};
console.log('Filter keys:', Object.keys(filters));
console.log('Total locations:', filters.locations?.length);
console.log('Sample locations 0..10:', filters.locations?.slice(0, 10));
console.log('Sample locations 90..105:', filters.locations?.slice(90, 105));
console.log('Total teams:', filters.teams?.length);
console.log('Sample teams 0..10:', filters.teams?.slice(0, 10));

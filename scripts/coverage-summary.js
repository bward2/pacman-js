/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'coverage', 'index.html');
const outputPath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');

if (!fs.existsSync(htmlPath)) {
  console.error('coverage/index.html not found');
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');

const metrics = ['Statements', 'Branches', 'Functions', 'Lines'];
const summary = {};

metrics.forEach((metric) => {
  const regex = new RegExp(
    `<span class="quiet">${metric}<\\/span>[\\s\\S]*?<span class='fraction'>(\\d+)\\/(\\d+)<\\/span>`,
    'i',
  );

  const match = html.match(regex);

  if (!match) {
    console.warn(`Could not find ${metric} in coverage HTML`);
    return;
  }

  const covered = Number(match[1]);
  const total = Number(match[2]);

  summary[metric.toLowerCase()] = {
    covered,
    total,
    pct: total === 0 ? 100 : Math.round((covered / total) * 100),
  };
});

fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));

console.log('✅ Report summary ready at coverage/coverage-summary.json!');

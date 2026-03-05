const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = {
  'Облачная синхронизация: Активные': 'Облачная синхронизация: Активна',
};

for (const [eng, rus] of Object.entries(replacements)) {
  content = content.split(eng).join(rus);
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Translation 6 complete.');

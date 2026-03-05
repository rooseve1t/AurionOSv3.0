const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = {
  'файлов-baseline': 'items-baseline',
  'файлов-end': 'items-end',
  'файлов-start': 'items-start',
  'файлов-center': 'items-center',
};

for (const [eng, rus] of Object.entries(replacements)) {
  content = content.split(eng).join(rus);
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Translation 4 complete.');

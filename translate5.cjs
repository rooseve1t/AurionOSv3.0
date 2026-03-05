const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = {
  'Музыка,': 'Music,',
  'icon={Музыка}': 'icon={Music}',
  '<Музыка ': '<Music ',
  'icon: Музыка': 'icon: Music',
};

for (const [eng, rus] of Object.entries(replacements)) {
  content = content.split(eng).join(rus);
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Translation 5 complete.');

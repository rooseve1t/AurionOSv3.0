const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = {
  'icon={Пользователь}': 'icon={User}',
  '<Пользователь': '<User',
  'Пользователь,': 'User,',
  'Пользователь Profile': 'Профиль пользователя',
  'Пользователь reviewed Q4 analytics report': 'Пользователь просмотрел аналитический отчет за 4 квартал',
  'файлов-center': 'items-center', // items was replaced by файлов
  'items:': 'items:', // wait, items -> файлов?
};

for (const [eng, rus] of Object.entries(replacements)) {
  content = content.split(eng).join(rus);
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Translation 3 complete.');

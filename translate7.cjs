const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = {
  'Voice Interface · Intent Analysis': 'Голосовой интерфейс · Анализ намерений',
  "activeModule === 'security' ? 'Security'": "activeModule === 'security' ? 'Защита'",
  'Социальное & Cloud': 'Социальные сети и Облако',
  '{activeModule} Module': 'Модуль {activeModule}',
  'title="Summary"': 'title="Сводка"',
  'title="Notes"': 'title="Заметки"',
  'title="Daily Summary"': 'title="Дневная сводка"',
  'title="Memory Entries"': 'title="Записи памяти"',
  'title="Voice Stats"': 'title="Статистика голоса"',
  'title="Intent Classification"': 'title="Классификация намерений"',
  'title="Lighting"': 'title="Освещение"',
  'title="Climate"': 'title="Климат"',
  'title="Locks"': 'title="Замки"',
  'title="Активные Reminders"': 'title="Активные напоминания"',
  'Пульс Analysis': 'Анализ пульса',
  '24 Hour Monitoring': '24-часовой мониторинг',
  'Подборки ИИ for You': 'ИИ-подборки для вас',
  '3/3 Devices Активные': '3/3 устройств активны',
  'setАктивныеModule': 'setActiveModule', // Fix variable name
  'renderСоциальное': 'renderSocial', // Fix variable name
  'ТревогаTriangle': 'AlertTriangle', // Fix icon name
};

for (const [eng, rus] of Object.entries(replacements)) {
  content = content.split(eng).join(rus);
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Translation 7 complete.');

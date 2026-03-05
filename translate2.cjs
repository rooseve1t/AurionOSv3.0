const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = {
  'System Check': 'Проверка системы',
  "from: 'System'": "from: 'Система'",
  'DONE': 'ГОТОВО',
  '"Jarvis"': '"Джарвис"',
  'User': 'Пользователь',
  'Medical': 'Медицина',
  'Family': 'Семья',
  'Colleague': 'Коллега',
  'Friend': 'Друг',
  'ONLINE': 'В СЕТИ',
  'AWAY': 'НЕТ НА МЕСТЕ',
  'BUSY': 'ЗАНЯТ',
  'OFFLINE': 'НЕ В СЕТИ',
  'SYNCED': 'СИНХРОНИЗИРОВАНО',
  'INCOMING': 'ВХОДЯЩЕЕ',
  'SYSTEM': 'СИСТЕМА',
  'WORK': 'РАБОТА',
  'PERSONAL': 'ЛИЧНОЕ',
  'Google Drive': 'Google Диск',
  'iCloud': 'iCloud',
  'Dropbox': 'Dropbox',
  'AURION Cloud': 'AURION Cloud',
  'Dr. Aris': 'Д-р Арис',
  'Sarah Mercer': 'Сара Мерсер',
  'John Doe': 'Джон Доу',
  'Mike Ross': 'Майк Росс',
  'Digital Silence - AI Core': 'Цифровая тишина - ИИ Ядро',
  'Midnight Pulse - SynthWave': 'Полуночный пульс - Синтвейв',
  'Neural Drift - Ambient': 'Нейронный дрейф - Эмбиент',
  'Alex Mercer': 'Алекс Мерсер',
  'Medical reminders are ignored in 67% of cases. Suggesting time shift to 08:00 for better adherence.': 'Медицинские напоминания игнорируются в 67% случаев. Предлагаю перенести время на 08:00 для лучшего соблюдения.',
  'Critical Adherence Issue': 'Критическая проблема соблюдения',
  'Made with Manus': '© 2026 Aurion Industries',
  'Запрос обработан, сэр. Все системы функционируют в штатном режиме.': 'Запрос обработан, сэр. Все системы функционируют в штатном режиме.'
};

for (const [eng, rus] of Object.entries(replacements)) {
  content = content.split(eng).join(rus);
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Translation 2 complete.');

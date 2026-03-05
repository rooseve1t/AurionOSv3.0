import express from 'express';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  // WebSocket Server
  const wss = new WebSocketServer({ server, path: '/ws/chat' });

  wss.on('connection', (ws) => {
    console.log('AURION OS: WebSocket connection established.');
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        const text = message.text?.toLowerCase() || '';
        
        let responseText = "Я обрабатываю ваш запрос, сэр.";
        
        if (text.includes("статус")) {
          responseText = "Все системы функционируют в пределах нормы. Квантовое ядро стабильно на 99.9%.";
        } else if (text.includes("квант")) {
          responseText = "Квантовые вычислители IonQ и Rigetti онлайн. Готов к выполнению сложных вычислений.";
        } else if (text.includes("дом") || text.includes("свет")) {
          responseText = "Системы умного дома синхронизированы. Освещение и климат-контроль оптимизированы.";
        } else if (text.includes("кто ты") || text.includes("привет")) {
          responseText = "Я AURION OS, ваш персональный автономный интеллект. Чем могу помочь, сэр?";
        } else if (text.includes("баланс")) {
          responseText = "Ваш текущий баланс составляет 1,240,500 рублей. Квантовый анализ рынка завершен.";
        }

        // Add a bit of "Jarvis" flair
        const greetings = ["Доброе утро, сэр.", "Слушаю вас, сэр.", "К вашим услугам."];
        const closings = ["Чем еще я могу быть полезен?", "Система в режиме ожидания.", "Всегда рад помочь."];
        
        const finalResponse = `${greetings[Math.floor(Math.random() * greetings.length)]} ${responseText} ${closings[Math.floor(Math.random() * closings.length)]}`;

        ws.send(JSON.stringify({ response: finalResponse }));
      } catch (err) {
        console.error('WS Error:', err);
      }
    });
  });

  // API Routes
  app.get('/api/status', (req, res) => {
    res.json({ status: 'online', quantum: 'stable', version: '2.5.0' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`AURION OS: Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

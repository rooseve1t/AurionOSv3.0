import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { runQuantumCircuit } from './services/quantumService';
import { 
  Cpu, 
  Zap, 
  Shield, 
  Database, 
  Terminal, 
  Activity, 
  Mic,
  Settings,
  Bell,
  Home,
  Heart,
  Wallet,
  CheckSquare,
  Radio,
  Menu,
  X,
  Send,
  User,
  LayoutDashboard,
  Cloud,
  Lock,
  Smartphone,
  Maximize2,
  Minimize2,
  Power,
  RefreshCw,
  Eye,
  Volume2,
  Brain,
  Fingerprint,
  AlertTriangle,
  ChevronRight,
  Music,
  Share2,
  Clock,
  Search,
  CheckCircle2,
  Circle,
  Play,
  SkipForward,
  TrendingDown,
  TrendingUp,
  MessageSquare,
  Globe,
  Calendar
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type ModuleId = 
  | 'dashboard' 
  | 'core' 
  | 'voice' 
  | 'memory' 
  | 'security' 
  | 'home' 
  | 'health' 
  | 'reminder' 
  | 'twin' 
  | 'autonomy' 
  | 'social' 
  | 'media';

type Message = {
  id: string;
  role: 'user' | 'jarvis';
  text: string;
  timestamp: Date;
};

// --- Components ---

const HUDModule = ({ title, subtitle, icon: Icon, children, className = "" }: { title: string, subtitle?: string, icon: any, children: React.ReactNode, className?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("hud-panel flex flex-col group transition-all hover:border-aurion-cyan/30", className)}
  >
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.01]">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-aurion-cyan/10 border border-aurion-cyan/20">
          <Icon className="w-3.5 h-3.5 text-aurion-cyan" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-white/90">{title}</span>
          {subtitle && <span className="text-[8px] font-sans text-slate-500 uppercase tracking-widest">{subtitle}</span>}
        </div>
      </div>
      <div className="flex gap-1">
        <div className="w-1 h-1 rounded-full bg-aurion-cyan/20" />
        <div className="w-1 h-1 rounded-full bg-aurion-cyan/20" />
      </div>
    </div>
    <div className="flex-1 p-4 overflow-hidden">
      {children}
    </div>
  </motion.div>
);

const MetricWidget = ({ label, value, subValue, trend, color = "cyan" }: { label: string, value: string | number, subValue?: string, trend?: string, color?: string }) => {
  const colorMap: Record<string, string> = {
    cyan: "text-aurion-cyan",
    purple: "text-aurion-purple",
    green: "text-aurion-green",
    orange: "text-aurion-orange",
    red: "text-aurion-red"
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg flex flex-col gap-1 hover:border-white/10 transition-all">
      <span className="text-[8px] font-display font-bold uppercase tracking-widest text-slate-500">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className={cn("text-xl font-mono font-bold tracking-tight", colorMap[color])}>{value}</span>
        {subValue && <span className="text-[10px] text-slate-500 font-mono">{subValue}</span>}
      </div>
      {trend && (
        <div className="flex items-center gap-1">
          <Activity className={cn("w-2 h-2", trend.startsWith('+') ? "text-aurion-green" : "text-aurion-red")} />
          <span className={cn("text-[8px] font-mono font-bold", trend.startsWith('+') ? "text-aurion-green" : "text-aurion-red")}>{trend}</span>
        </div>
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [activeModule, setActiveModule] = useState<ModuleId>('core');
  const [time, setTime] = useState(new Date());
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Data Mocking ---
  const aiLoadData = useMemo(() => Array.from({ length: 20 }, (_, i) => ({ time: i, load: 30 + Math.random() * 10 })), []);
  const riskData = [
    { name: 'Physical', value: 15, color: '#10b981' },
    { name: 'Digital', value: 25, color: '#00d9ff' },
    { name: 'Health', value: 10, color: '#a855f7' },
    { name: 'Env', value: 5, color: '#f59e0b' },
  ];

  // --- Effects ---

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isBooting) {
      const interval = setInterval(() => {
        setBootProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsBooting(false), 800);
            return 100;
          }
          return prev + 1;
        });
      }, 20);
      return () => clearInterval(interval);
    }
  }, [isBooting]);

  const handleSendMessage = useCallback((text?: string | React.MouseEvent | React.KeyboardEvent) => {
    const msgText = typeof text === 'string' ? text : message;
    if (!msgText.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: msgText, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMsg]);
    if (typeof text !== 'string') setMessage("");
    
    // Jarvis logic
    setTimeout(() => {
      const jarvisMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'jarvis', 
        text: "Запрос обработан, сэр. Все системы функционируют в штатном режиме.", 
        timestamp: new Date() 
      };
      setChatHistory(prev => [...prev, jarvisMsg]);
    }, 800);
  }, [message]);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'ru-RU';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        // Use timeout to let state settle or just pass transcript directly
        setTimeout(() => {
          const userMsg: Message = { id: Date.now().toString(), role: 'user', text: transcript, timestamp: new Date() };
          setChatHistory(prev => [...prev, userMsg]);
          setTimeout(() => {
            const jarvisMsg: Message = { 
              id: (Date.now() + 1).toString(), 
              role: 'jarvis', 
              text: "Запрос обработан, сэр. Все системы функционируют в штатном режиме.", 
              timestamp: new Date() 
            };
            setChatHistory(prev => [...prev, jarvisMsg]);
          }, 800);
        }, 0);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
  };

  // --- Module Renderers ---

  const renderCore = () => (
    <div className="grid grid-cols-12 gap-4 h-full overflow-y-auto custom-scrollbar pr-2">
      <div className="col-span-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricWidget label="НАГРУЗКА ИИ" value="33%" subValue="В РЕАЛЬНОМ ВРЕМЕНИ" trend="+1.2%" color="cyan" />
        <MetricWidget label="ИНДЕКС РИСКА" value="12" subValue="/ 100" trend="-0.5%" color="green" />
        <MetricWidget label="АВТОНОМИЯ" value="72%" subValue="УРОВЕНЬ 4" color="purple" />
        <MetricWidget label="ИСПОЛЬЗОВАНИЕ ПАМЯТИ" value="45%" subValue="1.2 TB" color="orange" />
        <MetricWidget label="УВЕРЕННОСТЬ" value="88%" subValue="СТАБИЛЬНО" color="cyan" />
        <MetricWidget label="ЦЕЛОСТНОСТЬ" value="97%" subValue="БЕЗОПАСНО" color="green" />
      </div>

      <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        <HUDModule title="ИИ-Оркестратор" subtitle="Производительность модуля принятия решений" icon={Brain} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={aiLoadData}>
              <defs>
                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                itemStyle={{ color: '#00f2ff' }}
              />
              <Area type="monotone" dataKey="load" stroke="#00f2ff" fillOpacity={1} fill="url(#colorLoad)" />
            </AreaChart>
          </ResponsiveContainer>
        </HUDModule>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          <HUDModule title="Журнал модуля принятия решений" icon={Terminal} className="min-h-[300px]">
            <div className="space-y-2 font-mono text-[10px]">
              {[
                { time: '14:45', event: 'Запущен перерасчет рисков', status: 'НИЗКИЙ РИСК', conf: '94%' },
                { time: '14:42', event: 'Синхронизация квантового ядра', status: 'УСПЕШНО', conf: '99%' },
                { time: '14:38', event: 'Совпадение поведенческого паттерна', status: 'ПРОВЕРЕНО', conf: '91%' },
                { time: '14:35', event: 'Автономное действие: Климат', status: 'ВЫПОЛНЕНО', conf: '88%' },
                { time: '14:30', event: 'Обновление нейронного паттерна', status: 'ОЖИДАНИЕ', conf: '92%' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{log.time}</span>
                    <span className="text-white font-bold uppercase truncate max-w-[120px]">{log.event}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[8px] font-bold",
                      log.status === 'УСПЕШНО' || log.status === 'ВЫПОЛНЕНО' || log.status === 'ПРОВЕРЕНО' ? "bg-aurion-green/10 text-aurion-green" : "bg-aurion-orange/10 text-aurion-orange"
                    )}>{log.status}</span>
                    <span className="text-aurion-cyan">{log.conf}</span>
                  </div>
                </div>
              ))}
            </div>
          </HUDModule>

          <HUDModule title="Адаптивное обучение" icon={Zap} className="min-h-[300px]">
            <div className="space-y-6 py-2">
              {[
                { label: 'Распознавание паттернов', val: 87 },
                { label: 'Поведенческое моделирование', val: 74 },
                { label: 'Контекстная осведомленность', val: 91 },
                { label: 'Точность прогнозирования', val: 82 },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-display font-bold uppercase tracking-widest">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-aurion-cyan">{item.val}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.val}%` }}
                      className="h-full bg-aurion-cyan shadow-[0_0_10px_rgba(0,242,255,0.5)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </HUDModule>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <HUDModule title="Модуль анализа рисков" icon={Shield}>
          <div className="space-y-4">
            {[
              { label: 'Физическая безопасность', val: 8, color: 'green' },
              { label: 'Цифровые угрозы', val: 15, color: 'green' },
              { label: 'Риски для здоровья', val: 12, color: 'green' },
              { label: 'Окружающая среда', val: 5, color: 'green' },
            ].map((risk, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-[10px] font-display font-bold uppercase text-slate-400">{risk.label}</span>
                <div className="flex items-center gap-3">
                  <span className={cn("text-xs font-mono font-bold", risk.val > 50 ? "text-aurion-red" : risk.val > 20 ? "text-aurion-orange" : "text-aurion-green")}>
                    {risk.val}/100
                  </span>
                  <div className={cn("w-2 h-2 rounded-full", risk.val > 50 ? "bg-aurion-red" : risk.val > 20 ? "bg-aurion-orange" : "bg-aurion-green")} />
                </div>
              </div>
            ))}
          </div>
        </HUDModule>

        <HUDModule title="Поток активности" icon={Activity} className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-aurion-red pulsate" />
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-aurion-red">В эфире</span>
          </div>
          <div className="space-y-4">
            {[
              { time: '14:45', text: 'Проактивное предложение: Запланируйте время восстановления после периода высокого стресса', type: 'auto' },
              { time: '14:38', text: 'Пульс нормализован — показатели стресса снижаются', type: 'health' },
              { time: '14:22', text: 'Обнаружено движение у главного входа — подтверждена доставка', type: 'security' },
              { time: '14:15', text: 'Проверка целостности системы завершена: стабильность 97%', type: 'info' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 text-[10px]">
                <span className="text-slate-600 font-mono">{item.time}</span>
                <div className="flex flex-col gap-1">
                  <p className="text-slate-300 leading-tight font-sans">{item.text}</p>
                  <span className={cn(
                    "text-[7px] font-display font-bold uppercase tracking-widest",
                    item.type === 'security' ? "text-aurion-red" : item.type === 'auto' ? "text-aurion-purple" : item.type === 'health' ? "text-aurion-green" : "text-aurion-cyan"
                  )}>{item.type}</span>
                </div>
              </div>
            ))}
          </div>
        </HUDModule>
      </div>
    </div>
  );

  const VOICE_COLORS = ['#00d9ff', '#a855f7', '#ef4444', '#10b981'];
  const voiceIntentData = [
    { name: 'Запрос', value: 45 },
    { name: 'Команда', value: 30 },
    { name: 'Тревога', value: 15 },
    { name: 'Социальное', value: 10 },
  ];

  const renderVoice = () => (
    <div className="grid grid-cols-12 gap-4 h-full">
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        <HUDModule title="Jarvoice" subtitle={isListening ? "СЛУШАЮ..." : "ОЖИДАНИЕ - СКАЖИТЕ 'ПРИВЕТ AURION'"} icon={Mic} className="flex-1">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 p-2">
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <div className="w-24 h-24 rounded-full border border-dashed border-aurion-cyan animate-rotate-slow flex items-center justify-center mb-4">
                    <Mic className="w-8 h-8 text-aurion-cyan" />
                  </div>
                  <p className="text-xs font-display uppercase tracking-widest">Ожидание голосовой команды...</p>
                  <div className="mt-6 space-y-2">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Попробуйте сказать:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {["Показать статус системы", "Проверить безопасность", "Отчет о здоровье", "Статус умного дома", "Какие у меня напоминания?", "Активировать режим стража"].map((phrase, i) => (
                        <button key={i} onClick={() => setMessage(phrase)} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-aurion-cyan hover:bg-aurion-cyan/10 transition-all">
                          {phrase}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                chatHistory.map(msg => (
                  <div key={msg.id} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                    <div className="flex items-center gap-2 mb-1 px-2">
                      <span className="text-[8px] font-mono text-slate-500">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className={cn("text-[8px] font-bold uppercase tracking-widest", msg.role === 'user' ? "text-aurion-cyan" : "text-aurion-purple")}>
                        {msg.role === 'user' ? "Пользователь" : "Джарвис"}
                      </span>
                    </div>
                    <div className={cn(
                      "max-w-[80%] p-3 rounded-xl text-xs leading-relaxed",
                      msg.role === 'user' ? "bg-aurion-cyan/10 border border-aurion-cyan/20 text-white" : "bg-white/5 border border-white/10 text-slate-300"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="mt-4 flex items-center gap-3 bg-black/40 p-2 rounded-lg border border-white/10">
              <button onClick={toggleListening} className={cn("p-2 rounded-lg transition-all", isListening ? "bg-aurion-cyan text-aurion-bg animate-pulse" : "text-slate-500 hover:text-aurion-cyan")}>
                <Mic className="w-5 h-5" />
              </button>
              <input 
                type="text" 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Введите команду..." 
                className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-white placeholder:text-slate-700 font-sans"
              />
              <button onClick={() => handleSendMessage()} className="p-2 text-aurion-cyan hover:bg-aurion-cyan/10 rounded-lg transition-all">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </HUDModule>
      </div>
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <HUDModule title="Классификация намерений" icon={Brain}>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[
                  { name: 'Запрос', value: 45, color: '#00f2ff' },
                  { name: 'Команда', value: 30, color: '#b300ff' },
                  { name: 'Тревога', value: 15, color: '#ff3b3b' },
                  { name: 'Социальное', value: 10, color: '#00ff9d' },
                ]} dataKey="value" innerRadius={40} outerRadius={60} paddingAngle={5}>
                  {[0,1,2,3].map((_, i) => <Cell key={i} fill={['#00f2ff', '#b300ff', '#ff3b3b', '#00ff9d'][i]} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'Запрос', val: '45%', color: 'bg-aurion-cyan' },
              { name: 'Команда', val: '30%', color: 'bg-aurion-purple' },
              { name: 'Тревога', val: '15%', color: 'bg-aurion-red' },
              { name: 'Социальное', val: '10%', color: 'bg-aurion-green' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-1.5 rounded bg-white/5">
                <div className="flex items-center gap-2">
                  <div className={cn("w-1.5 h-1.5 rounded-full", item.color)} />
                  <span className="text-[8px] font-bold uppercase text-slate-500">{item.name}</span>
                </div>
                <span className="text-[8px] font-mono text-white">{item.val}</span>
              </div>
            ))}
          </div>
        </HUDModule>
        <HUDModule title="Статистика голоса" icon={Activity} className="flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="text-[8px] text-slate-500 uppercase block mb-1">Командаs Today</span>
              <span className="text-xl font-mono font-bold text-white">47</span>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="text-[8px] text-slate-500 uppercase block mb-1">Accuracy</span>
              <span className="text-xl font-mono font-bold text-aurion-green">96%</span>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="text-[8px] text-slate-500 uppercase block mb-1">Avg Response</span>
              <span className="text-xl font-mono font-bold text-aurion-cyan">0.8s</span>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="text-[8px] text-slate-500 uppercase block mb-1">Self-Initiated</span>
              <span className="text-xl font-mono font-bold text-aurion-purple">12</span>
            </div>
          </div>
        </HUDModule>
      </div>
    </div>
  );

  const renderMemory = () => (
    <div className="grid grid-cols-12 gap-4 h-full overflow-y-auto custom-scrollbar pr-2">
      <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricWidget label="Short-term" value="6" color="cyan" />
        <MetricWidget label="Long-term" value="247" color="green" />
        <MetricWidget label="Episodic" value="12" color="purple" />
        <MetricWidget label="Knowledge Index" value="12.4k" color="orange" />
      </div>

      <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        <HUDModule title="Записи памяти" icon={Database} className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { type: 'SHORT', text: 'Пользователь просмотрел аналитический отчет за 4 квартал', importance: 4, time: '14:30' },
              { type: 'EPISODIC', text: 'Stress spike during 15:00 meeting — resolved', importance: 5, time: '15:12' },
              { type: 'LONG', text: 'Primary security protocol updated to version 2.4.1', importance: 3, time: 'Yesterday' },
              { type: 'SHORT', text: 'Missed reminder: Call Dr. Petrov', importance: 2, time: '13:00' },
              { type: 'LONG', text: 'Archived user preferences for smart home climate', importance: 3, time: '2 days ago' },
              { type: 'EPISODIC', text: 'Evening walk pattern identified: 19:30 - 20:15', importance: 4, time: '12h ago' },
            ].map((mem, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02 }}
                className="bg-white/[0.03] border border-white/10 p-4 rounded-xl flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-[8px] font-bold px-1.5 py-0.5 rounded",
                    mem.type === 'SHORT' ? "bg-aurion-cyan/10 text-aurion-cyan" : 
                    mem.type === 'LONG' ? "bg-aurion-green/10 text-aurion-green" : "bg-aurion-purple/10 text-aurion-purple"
                  )}>{mem.type}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <span key={j} className={cn("text-[10px]", j < mem.importance ? "opacity-100" : "opacity-20")}>🔥</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">{mem.text}</p>
                <div className="mt-auto pt-2 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[8px] text-slate-500 uppercase font-mono">{mem.time}</span>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                </div>
              </motion.div>
            ))}
          </div>
        </HUDModule>
      </div>

      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <HUDModule title="Дневная сводка" icon={Activity}>
          <div className="p-4 rounded-lg bg-aurion-cyan/5 border border-aurion-cyan/20">
            <p className="text-[10px] text-slate-300 font-mono leading-relaxed">
              Today's Summary: 47 events indexed across all modules. Продуктивность peak at 09:00–12:00. Stress spike during 15:00 meeting — resolved. 1 missed reminder (Dr. Petrov). Smart home auto-adjusted 3 times. No security incidents.
            </p>
            <div className="mt-3 flex justify-between text-[8px] text-slate-500 font-bold uppercase">
              <span>Generated: 14:00</span>
              <span>Next: 22:00</span>
            </div>
          </div>
        </HUDModule>
        <HUDModule title="Заметки" icon={Terminal} className="flex-1">
          <div className="space-y-3">
            {[
              { type: 'SHORT', title: 'Call Dr. Petrov', text: 'Missed reminder: Call Dr. Petrov regarding test results.' },
              { type: 'LONG', title: 'Project Aurion', text: 'Neural pattern optimization research notes.' },
              { type: 'EPISODIC', title: 'Evening Walk', text: 'Pattern identified: 19:30 - 20:15.' },
            ].map((note, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-aurion-cyan/30 transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "text-[7px] font-bold px-1 rounded",
                    note.type === 'SHORT' ? "bg-aurion-cyan/10 text-aurion-cyan" : "bg-aurion-purple/10 text-aurion-purple"
                  )}>{note.type}</span>
                  <span className="text-[10px] font-bold text-white uppercase">{note.title}</span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-2 font-mono">{note.text}</p>
              </div>
            ))}
            <button className="w-full py-2 rounded-lg border border-dashed border-white/10 text-[10px] font-bold uppercase text-slate-600 hover:text-aurion-cyan hover:border-aurion-cyan/40 transition-all">
              + New Note
            </button>
          </div>
        </HUDModule>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="grid grid-cols-12 gap-4 h-full overflow-y-auto custom-scrollbar pr-2">
      <div className="col-span-12 flex gap-4 mb-2">
        {['HOME', 'НЕТ НА МЕСТЕ', 'NIGHT', 'FOCUS'].map(preset => (
          <button key={preset} className={cn(
            "px-6 py-2 rounded-lg text-[10px] font-display font-bold uppercase tracking-[0.2em] transition-all border",
            preset === 'HOME' ? "bg-aurion-cyan/20 border-aurion-cyan/40 text-aurion-cyan shadow-[0_0_15px_rgba(0,242,255,0.2)]" : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
          )}>
            {preset}
          </button>
        ))}
      </div>
      <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <HUDModule title="Освещение" subtitle="3/3 устройств активны" icon={Zap}>
          <div className="space-y-5">
            {[
              { room: "Гостиная", val: 70 },
              { room: "Спальня", val: 40 },
              { room: "Кабинет", val: 90 },
            ].map((l, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-display font-bold uppercase tracking-widest">
                  <span className="text-white">{l.room}</span>
                  <span className="text-aurion-cyan font-mono">{l.val}%</span>
                </div>
                <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${l.val}%` }}
                    className="h-full bg-aurion-cyan shadow-[0_0_10px_rgba(0,242,255,0.5)]"
                  />
                  <input 
                    type="range" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    value={l.val} 
                    onChange={() => {}} 
                  />
                </div>
              </div>
            ))}
          </div>
        </HUDModule>
        <HUDModule title="Климат" icon={Cloud}>
          <div className="flex flex-col items-center justify-center gap-6 py-4">
            <div className="flex flex-col items-center">
              <span className="text-5xl font-display font-bold text-white text-glow">23°C</span>
              <div className="flex gap-4 mt-2 text-[8px] font-bold uppercase tracking-widest text-slate-500">
                <span>Target: 23°C</span>
                <span>Outdoor: 8°C</span>
              </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                <span className="text-[8px] text-slate-500 uppercase block mb-1">Humidity</span>
                <span className="text-sm font-mono font-bold text-white">45%</span>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                <span className="text-[8px] text-slate-500 uppercase block mb-1">Air Quality</span>
                <span className="text-sm font-mono font-bold text-aurion-green">EXCELLENT</span>
              </div>
            </div>
          </div>
        </HUDModule>
        <HUDModule title="Замки" icon={Lock}>
          <div className="space-y-3">
            {[
              { name: "Главный вход", status: "LOCKED" },
              { name: "Back Door", status: "LOCKED" },
            ].map((lock, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-[10px] font-display font-bold uppercase text-slate-400">{lock.name}</span>
                <span className="text-[10px] font-mono font-bold text-aurion-green">{lock.status}</span>
              </div>
            ))}
          </div>
        </HUDModule>
        <HUDModule title="Энергия" icon={Zap}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 p-4 rounded-lg bg-aurion-green/5 border border-aurion-green/20 flex flex-col items-center">
              <span className="text-2xl font-mono font-bold text-aurion-green">1.8 kW</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest">Текущее использование</span>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
              <span className="text-[8px] text-slate-500 uppercase block mb-1">Today</span>
              <span className="text-sm font-mono font-bold text-white">12.4 kWh</span>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
              <span className="text-[8px] text-slate-500 uppercase block mb-1">Solar</span>
              <span className="text-sm font-mono font-bold text-aurion-cyan">3.2 kW</span>
            </div>
            <div className="col-span-2 flex items-center justify-center gap-2 text-[10px] font-bold text-aurion-green">
              <TrendingDown className="w-3 h-3" />
              <span>23% SAVINGS</span>
            </div>
          </div>
        </HUDModule>
      </div>
    </div>
  );

  const renderHealth = () => (
    <div className="grid grid-cols-12 gap-4 h-full overflow-y-auto custom-scrollbar pr-2">
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <HUDModule title="Аналитика здоровья" icon={Heart} className="items-center justify-center py-8">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 border-2 border-aurion-red/20 rounded-full"
            />
            <div className="flex flex-col items-center">
              <span className="text-5xl font-display font-bold text-white text-glow">84</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Индекс здоровья</span>
            </div>
          </div>
        </HUDModule>
        <div className="grid grid-cols-2 gap-4">
          <MetricWidget label="Пульс" value="72" subValue="УД/МИН" color="red" trend="+2" />
          <MetricWidget label="Sleep Score" value="88" subValue="/ 100" color="purple" />
          <MetricWidget label="Уровень стресса" value="Low" subValue="12%" color="cyan" />
          <MetricWidget label="Activity" value="76%" subValue="8.4k steps" color="green" />
        </div>
      </div>
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        <HUDModule title="Анализ пульса" subtitle="24-часовой мониторинг" icon={Activity} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={aiLoadData}>
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[40, 120]} />
              <Area type="monotone" dataKey="load" stroke="#ff3b3b" fill="url(#colorHealth)" strokeWidth={2} />
              <defs>
                <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff3b3b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff3b3b" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </HUDModule>
        <HUDModule title="Рекомендации ИИ" icon={Brain} className="flex-1">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-aurion-cyan/5 border border-aurion-cyan/20">
              <p className="text-xs text-slate-300 italic leading-relaxed font-mono">"Your stress levels spiked by 15% in the last 2 hours. I recommend a 5-minute breathing session. Your sleep quality was 8% higher than average last night."</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              {[
                { label: "Cardiovascular", val: 12, color: "text-aurion-green", stroke: "stroke-aurion-green" },
                { label: "Sleep Deficit", val: 45, color: "text-aurion-orange", stroke: "stroke-aurion-orange" },
                { label: "Sedentary", val: 28, color: "text-aurion-cyan", stroke: "stroke-aurion-cyan" },
              ].map((r, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="stroke-white/10"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <motion.path
                        className={r.stroke}
                        strokeWidth="3"
                        strokeDasharray={`${r.val}, 100`}
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        initial={{ strokeDasharray: "0, 100" }}
                        animate={{ strokeDasharray: `${r.val}, 100` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </svg>
                    <span className={cn("absolute text-[10px] font-mono font-bold", r.color)}>{r.val}%</span>
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">{r.label} Risk</span>
                </div>
              ))}
            </div>
          </div>
        </HUDModule>
      </div>
    </div>
  );

  const renderReminder = () => (
    <div className="grid grid-cols-12 gap-4 h-full overflow-y-auto custom-scrollbar pr-2">
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        <HUDModule title="Активные напоминания" icon={CheckSquare} className="flex-1">
          <div className="space-y-3">
            {[
              { time: '14:00', text: 'Take Vitamins', priority: 'ВЫСОКИЙ', status: 'ОЖИДАНИЕ' },
              { time: '16:30', text: 'Market Analysis', priority: 'СРЕДНИЙ', status: 'ОЖИДАНИЕ' },
              { time: '19:00', text: 'Workout Session', priority: 'НИЗКИЙ', status: 'ОЖИДАНИЕ' },
              { time: '10:00', text: 'Проверка системы', priority: 'ВЫСОКИЙ', status: 'ГОТОВО' },
            ].map((rem, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-aurion-cyan/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-1 h-10 rounded-full",
                    rem.priority === 'ВЫСОКИЙ' ? "bg-aurion-red shadow-[0_0_8px_rgba(255,59,59,0.4)]" : 
                    rem.priority === 'СРЕДНИЙ' ? "bg-aurion-orange shadow-[0_0_8px_rgba(255,159,10,0.4)]" : 
                    "bg-aurion-cyan shadow-[0_0_8px_rgba(0,242,255,0.4)]"
                  )} />
                  <div className="flex flex-col">
                    <span className="text-xs font-display font-bold text-white uppercase tracking-wider">{rem.text}</span>
                    <span className="text-[8px] text-slate-500 uppercase tracking-[0.2em] font-mono">{rem.time}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-widest",
                    rem.status === 'ГОТОВО' ? "bg-aurion-green/10 text-aurion-green border border-aurion-green/20" : "bg-white/5 text-slate-500 border border-white/10"
                  )}>{rem.status}</span>
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-aurion-cyan/20 text-slate-500 hover:text-aurion-cyan transition-all border border-white/10">
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </HUDModule>
      </div>
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <HUDModule title="Сводка" icon={Activity}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Всего', val: 12, color: 'white' },
              { label: 'Активные', val: 3, color: 'aurion-cyan' },
              { label: 'Завершенные', val: 8, color: 'aurion-green' },
              { label: 'Проигнорированные', val: 1, color: 'aurion-red' },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center">
                <span className="text-[8px] text-slate-500 uppercase tracking-widest block mb-1">{s.label}</span>
                <span className={cn("text-2xl font-mono font-bold", `text-${s.color}`)}>{s.val}</span>
              </div>
            ))}
          </div>
        </HUDModule>
        <HUDModule title="Анализ игнорирования" icon={AlertTriangle}>
          <div className="p-4 rounded-xl bg-aurion-red/5 border border-aurion-red/20">
            <p className="text-[10px] text-slate-300 font-mono leading-relaxed">
              Медицинские напоминания игнорируются в 67% случаев. Предлагаю перенести время на 08:00 для лучшего соблюдения.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[8px] font-bold text-aurion-red uppercase">
              <TrendingUp className="w-3 h-3" />
              <span>Критическая проблема соблюдения</span>
            </div>
          </div>
        </HUDModule>
      </div>
    </div>
  );

  const renderTwin = () => (
    <div className="grid grid-cols-12 gap-4 h-full overflow-y-auto custom-scrollbar pr-2">
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <HUDModule title="Алекс Мерсер" subtitle="Аналитический-Проактивный" icon={User} className="items-center py-8">
          <div className="w-32 h-32 rounded-full border-2 border-aurion-cyan/30 p-1 mb-4 relative">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border border-white/10">
              <User className="w-16 h-16 text-aurion-cyan/40" />
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              className="absolute inset-[-4px] border border-dashed border-aurion-cyan/40 rounded-full"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {["Основан на данных", "Эмоционально стабилен", "Высокая концентрация"].map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-bold text-slate-400 uppercase tracking-widest border border-white/5">
                {tag}
              </span>
            ))}
          </div>
        </HUDModule>
        <div className="grid grid-cols-2 gap-4">
          <MetricWidget label="Продуктивность" value="78" color="cyan" />
          <MetricWidget label="Индекс здоровья" value="84" color="green" />
          <MetricWidget label="Толерантность к риску" value="23" color="orange" />
          <MetricWidget label="Социальное Impact" value="65" color="purple" />
        </div>
      </div>
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        <HUDModule title="Влияние двойника" subtitle="Анализ влияния на модули" icon={Brain} className="flex-1">
          <div className="space-y-6 py-4">
            {[
              { module: 'Модуль принятия решений', impact: 85, desc: 'Высокое влияние на автономные решения.' },
              { module: 'Уровень автономии', impact: 72, desc: 'Умеренное влияние на уровни автоматизации.' },
              { module: 'Аналитика здоровья', impact: 94, desc: 'Критическое влияние на рекомендации по здоровью.' },
              { module: 'Социальные сети и Облако', impact: 45, desc: 'Низкое влияние на фильтрацию контактов.' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs font-display font-bold text-white uppercase tracking-widest">{item.module}</span>
                    <span className="text-[9px] text-slate-500 font-mono">{item.desc}</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-aurion-cyan">{item.impact}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.impact}%` }}
                    className="h-full bg-aurion-cyan shadow-[0_0_8px_rgba(0,242,255,0.4)]"
                  />
                </div>
              </div>
            ))}
          </div>
        </HUDModule>
      </div>
    </div>
  );

  const renderAutonomy = () => (
    <div className="grid grid-cols-12 gap-4 h-full overflow-y-auto custom-scrollbar pr-2">
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        <HUDModule title="Ожидающие предложения" icon={Zap} className="flex-1">
          <div className="space-y-3">
            {[
              { text: 'Оптимизировать энергопотребление на 15%', priority: 'ВЫСОКИЙ' },
              { text: 'Обновить протоколы безопасности умного дома', priority: 'СРЕДНИЙ' },
              { text: 'Запланировать встречу с финансовым аналитиком', priority: 'НИЗКИЙ' },
            ].map((sug, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-aurion-cyan/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-1 h-10 rounded-full",
                    sug.priority === 'ВЫСОКИЙ' ? "bg-aurion-red shadow-[0_0_8px_rgba(255,59,59,0.4)]" : 
                    sug.priority === 'СРЕДНИЙ' ? "bg-aurion-orange shadow-[0_0_8px_rgba(255,159,10,0.4)]" : 
                    "bg-aurion-cyan shadow-[0_0_8px_rgba(0,242,255,0.4)]"
                  )} />
                  <div className="flex flex-col">
                    <span className="text-xs font-display font-bold text-white uppercase tracking-wider">{sug.text}</span>
                    <span className="text-[8px] text-slate-500 uppercase tracking-[0.2em] font-mono">Приоритет: {sug.priority}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 rounded-lg bg-aurion-cyan/10 text-aurion-cyan text-[9px] font-bold uppercase hover:bg-aurion-cyan hover:text-aurion-bg transition-all border border-aurion-cyan/20">Принять</button>
                  <button className="px-4 py-2 rounded-lg bg-white/5 text-slate-500 text-[9px] font-bold uppercase hover:bg-white/10 transition-all border border-white/10">Отклонить</button>
                </div>
              </div>
            ))}
          </div>
        </HUDModule>
        <HUDModule title="Самостоятельные действия" icon={RefreshCw} className="flex-1">
          <div className="space-y-2 font-mono text-[10px]">
            {[
              { time: '10:45', action: 'Climate optimization in Гостиная', result: 'УСПЕШНО' },
              { time: '09:12', action: 'Сканирование внешнего периметра безопасности', result: 'УСПЕШНО' },
              { time: '08:30', action: 'Автоматическое резервное копирование в AURION Cloud', result: 'УСПЕШНО' },
            ].map((act, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.01] border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-slate-600">{act.time}</span>
                  <span className="text-slate-300">{act.action}</span>
                </div>
                <span className="text-aurion-green font-bold tracking-widest">{act.result}</span>
              </div>
            ))}
          </div>
        </HUDModule>
      </div>
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <HUDModule title="Уровень автономии" icon={Zap}>
          <div className="space-y-6 py-4">
            {[
              { level: 'ПАССИВНЫЙ', active: false },
              { level: 'РЕКОМЕНДАТЕЛЬНЫЙ', active: false },
              { level: 'ПОЛУАВТОМАТ.', active: false },
              { level: 'ПОЛНЫЙ АВТОМАТ', active: true },
              { level: 'СУВЕРЕННЫЙ', active: false },
            ].map((l, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={cn(
                  "w-3 h-3 rounded-full border-2 transition-all duration-500",
                  l.active ? "bg-aurion-cyan border-aurion-cyan shadow-[0_0_15px_rgba(0,242,255,0.8)]" : "border-white/10"
                )} />
                <span className={cn(
                  "text-[10px] font-display font-bold uppercase tracking-[0.2em] transition-all duration-500",
                  l.active ? "text-white text-glow" : "text-slate-600"
                )}>{l.level}</span>
              </div>
            ))}
          </div>
        </HUDModule>
        <HUDModule title="Нейроинтерфейс" icon={Eye}>
          <div className="space-y-4">
            {[
              { label: 'Отслеживание взгляда', active: true },
              { label: 'Управление жестами', active: false },
              { label: 'Нейроинтерфейс (BCI)', active: true },
              { label: 'Датчик приближения', active: true },
            ].map((set, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                <span className="text-[10px] font-display font-bold uppercase text-slate-400 tracking-widest">{set.label}</span>
                <button className={cn(
                  "w-10 h-5 rounded-full relative transition-all",
                  set.active ? "bg-aurion-cyan shadow-[0_0_10px_rgba(0,242,255,0.3)]" : "bg-slate-800"
                )}>
                  <motion.div 
                    animate={{ x: set.active ? 20 : 4 }}
                    className="absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>
            ))}
          </div>
        </HUDModule>
      </div>
    </div>
  );

  const renderSocial = () => (
    <div className="grid grid-cols-12 gap-4 h-full overflow-y-auto custom-scrollbar pr-2">
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <HUDModule title="Контакты" icon={User} className="flex-1">
          <div className="space-y-3">
            {[
              { name: 'Д-р Арис', cat: 'Медицина', initial: 'DA', status: 'В СЕТИ' },
              { name: 'Сара Мерсер', cat: 'Семья', initial: 'SM', status: 'НЕТ НА МЕСТЕ' },
              { name: 'Джон Доу', cat: 'Коллега', initial: 'JD', status: 'ЗАНЯТ' },
              { name: 'Майк Росс', cat: 'Друг', initial: 'MR', status: 'НЕ В СЕТИ' },
            ].map((contact, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-aurion-cyan/10 border border-aurion-cyan/20 flex items-center justify-center text-xs font-display font-bold text-aurion-cyan shadow-[0_0_10px_rgba(0,242,255,0.1)]">
                    {contact.initial}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-display font-bold text-white uppercase tracking-wider">{contact.name}</span>
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">{contact.cat}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    contact.status === 'В СЕТИ' ? "bg-aurion-green shadow-[0_0_8px_rgba(0,255,157,0.5)]" : 
                    contact.status === 'НЕТ НА МЕСТЕ' ? "bg-aurion-orange" : 
                    contact.status === 'ЗАНЯТ' ? "bg-aurion-red" : "bg-slate-700"
                  )} />
                  <span className="text-[7px] font-mono text-slate-600">{contact.status}</span>
                </div>
              </div>
            ))}
          </div>
        </HUDModule>
        <HUDModule title="Облачная синхронизация" icon={Cloud}>
          <div className="space-y-3">
            {[
              { name: 'Google Диск', status: 'СИНХРОНИЗИРОВАНО' },
              { name: 'iCloud', status: 'СИНХРОНИЗИРОВАНО' },
              { name: 'Dropbox', status: 'НЕ В СЕТИ' },
              { name: 'AURION Cloud', status: 'СИНХРОНИЗИРОВАНО' },
            ].map((cloud, i) => (
              <div key={i} className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
                <span className="text-slate-500">{cloud.name}</span>
                <span className={cloud.status === 'СИНХРОНИЗИРОВАНО' ? "text-aurion-green" : "text-slate-700"}>{cloud.status}</span>
              </div>
            ))}
          </div>
        </HUDModule>
      </div>
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        <HUDModule title="Поток коммуникаций" icon={MessageSquare} className="flex-1">
          <div className="space-y-4">
            {[
              { from: 'Д-р Арис', msg: 'Отчет о квантовой стабильности готов к проверке.', time: '10:30', type: 'ВХОДЯЩЕЕ' },
              { from: 'Система', msg: 'Еженедельный аудит безопасности завершен. Угроз не обнаружено.', time: '09:15', type: 'СИСТЕМА' },
              { from: 'Сара Мерсер', msg: 'Наши планы на ужин сегодня в силе?', time: '08:45', type: 'ВХОДЯЩЕЕ' },
            ].map((msg, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className={cn(
                    "text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                    msg.type === 'СИСТЕМА' ? "bg-aurion-purple/10 text-aurion-purple border border-aurion-purple/20" : "bg-aurion-cyan/10 text-aurion-cyan border border-aurion-cyan/20"
                  )}>{msg.from}</span>
                  <span className="text-[8px] font-mono text-slate-600">{msg.time}</span>
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">{msg.msg}</p>
              </div>
            ))}
          </div>
        </HUDModule>
        <HUDModule title="Календарь на сегодня" icon={Calendar}>
          <div className="space-y-3">
            {[
              { time: '09:00', title: 'Проверка квантовой синхронизации', type: 'РАБОТА' },
              { time: '13:00', title: 'Обед с Сарой', type: 'ЛИЧНОЕ' },
              { time: '15:30', title: 'Обслуживание системы', type: 'СИСТЕМА' },
              { time: '19:00', title: 'Ужин', type: 'ЛИЧНОЕ' },
            ].map((event, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-aurion-cyan/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-1 h-8 rounded-full",
                    event.type === 'РАБОТА' ? "bg-aurion-cyan shadow-[0_0_8px_rgba(0,242,255,0.4)]" : 
                    event.type === 'СИСТЕМА' ? "bg-aurion-purple shadow-[0_0_8px_rgba(179,0,255,0.4)]" : 
                    "bg-aurion-green shadow-[0_0_8px_rgba(0,255,157,0.4)]"
                  )} />
                  <div className="flex flex-col">
                    <span className="text-xs font-display font-bold text-white uppercase tracking-wider">{event.title}</span>
                    <span className="text-[8px] text-slate-500 uppercase tracking-[0.2em] font-mono">{event.time}</span>
                  </div>
                </div>
                <span className={cn(
                  "text-[7px] font-bold px-2 py-1 rounded-full uppercase tracking-widest",
                  event.type === 'РАБОТА' ? "bg-aurion-cyan/10 text-aurion-cyan border border-aurion-cyan/20" : 
                  event.type === 'СИСТЕМА' ? "bg-aurion-purple/10 text-aurion-purple border border-aurion-purple/20" : 
                  "bg-aurion-green/10 text-aurion-green border border-aurion-green/20"
                )}>{event.type}</span>
              </div>
            ))}
          </div>
        </HUDModule>
      </div>
    </div>
  );

  const renderMedia = () => (
    <div className="grid grid-cols-12 gap-4 h-full overflow-y-auto custom-scrollbar pr-2">
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        <HUDModule title="Сейчас играет" icon={Music} className="flex-1">
          <div className="flex flex-col md:flex-row gap-8 items-center py-6">
            <div className="w-48 h-48 rounded-2xl bg-slate-800 border border-white/10 overflow-hidden relative group shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <img src="https://picsum.photos/seed/music/400/400" alt="Album Art" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-12 h-12 rounded-full bg-aurion-cyan/20 backdrop-blur-md border border-aurion-cyan/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.3)]"
                >
                  <Music className="w-6 h-6 text-aurion-cyan" />
                </motion.div>
              </div>
            </div>
            <div className="flex-1 space-y-6 w-full">
              <div className="space-y-1">
                <h3 className="text-3xl font-display font-bold text-white tracking-tight text-glow">Квантовый резонанс</h3>
                <p className="text-aurion-cyan text-sm font-display font-bold uppercase tracking-[0.2em]">Нейронные ритмы ИИ</p>
              </div>
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '65%' }}
                    className="h-full bg-aurion-cyan shadow-[0_0_10px_rgba(0,242,255,0.5)]"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">
                  <span>02:14</span>
                  <span>03:45</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-8">
                <button className="text-slate-500 hover:text-white transition-all transform hover:scale-110"><RefreshCw className="w-5 h-5" /></button>
                <button className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-aurion-cyan hover:text-aurion-bg transition-all shadow-lg transform hover:scale-105">
                  <Play className="w-6 h-6 fill-current" />
                </button>
                <button className="text-slate-500 hover:text-white transition-all transform hover:scale-110"><SkipForward className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </HUDModule>
        <HUDModule title="ИИ-подборки для вас" icon={Brain} className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2 group cursor-pointer">
                <div className="aspect-square rounded-xl bg-white/5 border border-white/5 overflow-hidden relative">
                  <img src={`https://picsum.photos/seed/pick${i}/200/200`} alt="Pick" className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <Play className="w-4 h-4 text-aurion-cyan" />
                  </div>
                </div>
                <span className="text-[10px] font-display font-bold text-white block truncate uppercase tracking-widest group-hover:text-aurion-cyan transition-colors">Нейро-микс #{i}</span>
              </div>
            ))}
          </div>
        </HUDModule>
      </div>
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <HUDModule title="Статистика библиотеки" icon={Database}>
          <div className="space-y-4 py-2">
            {[
              { label: 'Музыка', val: '1,240 треков', icon: Music },
              { label: 'Фильмы', val: '42 фильмов', icon: Eye },
              { label: 'Фотографии', val: '12,400 файлов', icon: Database },
              { label: 'Подкасты', val: '15 серий', icon: Radio },
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-aurion-cyan/20 transition-all">
                <div className="flex items-center gap-3">
                  <stat.icon className="w-4 h-4 text-aurion-cyan" />
                  <span className="text-[10px] font-display font-bold uppercase text-slate-400 tracking-widest">{stat.label}</span>
                </div>
                <span className="text-xs font-mono font-bold text-white">{stat.val}</span>
              </div>
            ))}
          </div>
        </HUDModule>
        <HUDModule title="Очередь воспроизведения" icon={Terminal} className="flex-1">
          <div className="space-y-2">
            {[
              'Цифровая тишина - ИИ Ядро',
              'Полуночный пульс - Синтвейв',
              'Нейронный дрейф - Эмбиент',
            ].map((track, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-white/10">
                <span className="text-[10px] text-aurion-cyan font-mono font-bold">{i + 1}</span>
                <span className="text-[10px] font-display font-bold text-slate-400 group-hover:text-white truncate uppercase tracking-wider">{track}</span>
              </div>
            ))}
          </div>
        </HUDModule>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="grid grid-cols-12 gap-4 h-full overflow-y-auto custom-scrollbar pr-2">
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        <HUDModule title="Управление камерами" icon={Eye} className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Главный вход', status: 'АКТИВНО', feed: 'https://picsum.photos/seed/cam1/400/300' },
              { name: 'Гостиная', status: 'АКТИВНО', feed: 'https://picsum.photos/seed/cam2/400/300' },
              { name: 'Задний двор', status: 'АКТИВНО', feed: 'https://picsum.photos/seed/cam3/400/300' },
              { name: 'Гараж', status: 'НЕ В СЕТИ', feed: 'https://picsum.photos/seed/cam4/400/300' },
            ].map((cam, i) => (
              <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                <img src={cam.feed} alt={cam.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", cam.status === 'АКТИВНО' ? "bg-aurion-green shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-aurion-red shadow-[0_0_8px_rgba(255,59,59,0.8)]")} />
                  <span className="text-[10px] font-display font-bold text-white uppercase tracking-[0.2em]">{cam.name}</span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="text-[8px] font-mono font-bold text-white/60 uppercase tracking-widest">{cam.status}</span>
                </div>
                {cam.status === 'АКТИВНО' && (
                  <div className="absolute inset-0 border border-aurion-cyan/0 group-hover:border-aurion-cyan/50 transition-colors rounded-xl pointer-events-none" />
                )}
              </div>
            ))}
          </div>
        </HUDModule>
      </div>
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <HUDModule title="Обнаружение угроз" icon={Shield}>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-aurion-green/5 border border-aurion-green/20">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-aurion-green" />
                <span className="text-xs font-display font-bold text-white uppercase tracking-widest">No Активные Threats</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono leading-relaxed">Последнее сканирование периметра завершено 5 минут назад. Все системы в норме.</p>
            </div>
            <div className="space-y-2">
              <span className="text-[8px] font-bold uppercase text-slate-500 tracking-widest block mb-3">Протоколы безопасности</span>
              {[
                { label: 'Брандмауэр', active: true },
                { label: 'Обнаружение вторжений', active: true },
                { label: 'Шифрование данных', active: true },
                { label: 'Биометрическая аутентификация', active: true },
              ].map((p, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5 hover:border-aurion-cyan/20 transition-all">
                  <span className="text-[10px] font-display font-bold text-slate-300 uppercase tracking-widest">{p.label}</span>
                  <Lock className="w-3.5 h-3.5 text-aurion-cyan" />
                </div>
              ))}
            </div>
          </div>
        </HUDModule>
        <HUDModule title="Сетевой трафик" icon={Activity} className="flex-1">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aiLoadData}>
                <Area type="monotone" dataKey="load" stroke="#b300ff" fill="url(#colorTraffic)" strokeWidth={2} />
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b300ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#b300ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-between text-[10px] font-display font-bold uppercase tracking-widest">
            <span className="text-slate-500">Входящий</span>
            <span className="text-aurion-purple font-mono">1.2 GB/s</span>
          </div>
          <div className="flex justify-between text-[10px] font-display font-bold uppercase tracking-widest mt-2">
            <span className="text-slate-500">Исходящий</span>
            <span className="text-aurion-cyan font-mono">450 MB/s</span>
          </div>
        </HUDModule>
      </div>
    </div>
  );

  // --- Main Render ---

  if (isBooting) {
    return (
      <div className="h-screen w-screen bg-aurion-bg flex flex-col items-center justify-center p-10 overflow-hidden font-mono relative">
        <div className="scanline" />
        <div className="relative w-72 h-72 flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className="absolute inset-0 border-2 border-dashed border-aurion-cyan/20 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            className="absolute inset-4 border border-aurion-cyan/40 rounded-full border-t-transparent"
          />
          <div className="text-center z-10">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-4xl font-bold tracking-[0.6em] text-white text-glow"
            >
              AURION OC
            </motion.h1>
            <div className="mt-6 h-1 w-56 bg-white/5 rounded-full overflow-hidden mx-auto">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${bootProgress}%` }}
                className="h-full bg-aurion-cyan shadow-[0_0_20px_rgba(0,217,255,0.8)]"
              />
            </div>
            <p className="text-[10px] text-aurion-cyan mt-3 uppercase tracking-[0.3em] font-bold">
              АВТОНОМНАЯ ОПЕРАЦИОННАЯ СИСТЕМА V2.4.1
            </p>
            <p className="text-[8px] text-slate-500 mt-1 uppercase tracking-widest">
              Загрузка цифрового двойника: {bootProgress}%
            </p>
          </div>
        </div>
        <div className="mt-16 flex flex-col items-center gap-y-3 text-[10px] text-aurion-cyan/40 uppercase tracking-[0.3em] font-bold">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>{">"} ЯДРО AURION</motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>{">"} JARVOICE</motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>{">"} ПАМЯТЬ</motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>{">"} ЗАЩИТА</motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>{">"} УМНЫЙ ДОМ</motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>{">"} ЗДОРОВЬЕ</motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>{">"} ЦИФРОВОЙ ДВОЙНИК</motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>{">"} АВТОНОМИЯ</motion.div>
        </div>
        <div className="absolute bottom-8 text-[10px] text-slate-600 font-display font-bold tracking-[0.2em] uppercase text-center">
          © 2026 Aurion Industries<br/>
          CEO: Черников Максим Альгимантасович<br/>
          <a href="https://vk.ru/surprisemotherfuckr" target="_blank" className="hover:text-aurion-cyan">VK</a> | 
          <a href="https://t.me/sueturia" target="_blank" className="hover:text-aurion-cyan">TG</a> | 
          <a href="https://reddit.com/u/jarvoice" target="_blank" className="hover:text-aurion-cyan">Reddit</a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-aurion-bg text-slate-300 flex flex-col overflow-hidden font-sans relative selection:bg-aurion-cyan/30">
      <div className="scanline" />
      
      {/* --- Header --- */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-aurion-bg/40 backdrop-blur-xl z-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-aurion-cyan/10 border border-aurion-cyan/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,217,255,0.15)] group cursor-pointer">
              <Cpu className="w-5 h-5 text-aurion-cyan group-hover:rotate-90 transition-transform duration-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-display font-bold tracking-[0.4em] text-white uppercase text-glow">
                {activeModule === 'core' ? 'Aurion Core' : 
                 activeModule === 'voice' ? 'Jarvoice' :
                 activeModule === 'memory' ? 'Система памяти' :
                 activeModule === 'security' ? 'Защита' :
                 activeModule === 'home' ? 'Умный дом' :
                 activeModule === 'health' ? 'Аналитика здоровья' :
                 activeModule === 'reminder' ? 'Модуль напоминаний' :
                 activeModule === 'twin' ? 'Цифровой двойник' :
                 activeModule === 'autonomy' ? 'Уровень автономии' :
                 activeModule === 'social' ? 'Социальные сети и Облако' :
                 activeModule === 'media' ? 'Мультимедийное ядро' : 'Aurion OS'}
              </span>
              <span className="text-[9px] text-aurion-cyan/60 font-display uppercase tracking-[0.2em] font-bold">
                {activeModule === 'core' ? 'ИИ-Оркестратор · Модуль принятия решений · Модуль анализа рисков' : 
                 activeModule === 'voice' ? 'Голосовой интерфейс · Анализ намерений' :
                 activeModule === 'memory' ? 'Векторная БД · Эпизодическое хранилище' :
                 activeModule === 'security' ? 'Обнаружение угроз · Контроль периметра' :
                 activeModule === 'home' ? 'Сценарии · Управление энергией' :
                 activeModule === 'health' ? 'Жизненные показатели · Рекомендации ИИ' :
                 activeModule === 'reminder' ? 'Управление задачами · Очередь приоритетов' :
                 activeModule === 'twin' ? 'Профиль пользователя · Влияние на систему' :
                 activeModule === 'autonomy' ? 'Самостоятельные действия · Нейроинтерфейс' :
                 activeModule === 'social' ? 'Поток коммуникаций · Облачная синхронизация' :
                 activeModule === 'media' ? 'Управление воспроизведением · Подборки ИИ' : 'Системный модуль'}
              </span>
            </div>
          </div>
          
          <div className="h-8 w-px bg-white/5 hidden lg:block" />
          
          <div className="hidden xl:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[9px] text-emerald-500 font-display font-bold uppercase tracking-widest">Система стабильна</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-aurion-purple/10 border border-aurion-purple/20">
              <Zap className="w-3 h-3 text-aurion-purple" />
              <span className="text-[9px] text-aurion-purple font-display font-bold uppercase tracking-widest">Квантовая синхронизация: 94%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-lg font-mono font-bold text-white tracking-[0.2em] text-glow">
              {time.toLocaleTimeString([], { hour12: false })}
            </span>
            <span className="text-[10px] text-slate-500 font-display uppercase tracking-[0.3em] font-bold">
              {time.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl hover:bg-white/5 transition-all text-slate-500 hover:text-aurion-cyan border border-transparent hover:border-white/10 group">
              <Bell className="w-4 h-4 group-hover:animate-bounce" />
            </button>
            <button className="p-2.5 rounded-xl hover:bg-white/5 transition-all text-slate-500 hover:text-aurion-cyan border border-transparent hover:border-white/10 group">
              <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
            </button>
            <div className="w-10 h-10 rounded-xl border border-white/10 p-0.5 ml-2 cursor-pointer group hover:border-aurion-cyan/50 transition-colors">
              <div className="w-full h-full rounded-lg bg-slate-900 flex items-center justify-center overflow-hidden border border-white/5 relative">
                <User className="w-5 h-5 text-slate-500 group-hover:text-aurion-cyan transition-colors" />
                <div className="absolute inset-0 bg-aurion-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Navigation */}
        <aside className="w-20 lg:w-64 border-r border-white/5 flex flex-col bg-aurion-bg/20 backdrop-blur-md z-20">
          <div className="flex-1 py-6 px-3 lg:px-4 space-y-2 overflow-y-auto custom-scrollbar">
            {[
              { id: 'core', label: 'Ядро Aurion', icon: Cpu },
              { id: 'voice', label: 'Jarvoice', icon: Mic },
              { id: 'memory', label: 'Память', icon: Database },
              { id: 'security', label: 'Защита', icon: Shield },
              { id: 'home', label: 'Умный дом', icon: Home },
              { id: 'health', label: 'Здоровье', icon: Heart },
              { id: 'reminder', label: 'Напоминания', icon: CheckSquare },
              { id: 'twin', label: 'Цифровой двойник', icon: Fingerprint },
              { id: 'autonomy', label: 'Автономия', icon: Zap },
              { id: 'quantum', label: 'Квантовый', icon: Cpu },
              { id: 'social', label: 'Облако', icon: Share2 },
              { id: 'media', label: 'Мультимедиа', icon: Music },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveModule(item.id as ModuleId)}
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-xl transition-all border group relative overflow-hidden",
                  activeModule === item.id 
                    ? "bg-aurion-cyan/10 border-aurion-cyan/30 text-aurion-cyan shadow-[0_0_15px_rgba(0,217,255,0.1)]" 
                    : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110 relative z-10", activeModule === item.id ? "text-aurion-cyan" : "text-slate-500")} />
                <span className="hidden lg:block text-[11px] font-display font-bold uppercase tracking-widest relative z-10">{item.label}</span>
                {activeModule === item.id && (
                  <>
                    <motion.div layoutId="active-pill" className="absolute left-0 top-0 bottom-0 w-1 bg-aurion-cyan shadow-[0_0_10px_rgba(0,217,255,0.8)]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-aurion-cyan/10 to-transparent opacity-50" />
                  </>
                )}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-white/5">
            <button className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-aurion-red/10 border border-aurion-red/30 text-aurion-red hover:bg-aurion-red/20 transition-all group">
              <Power className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden lg:block text-[10px] font-display font-bold uppercase tracking-widest">Выключение</span>
            </button>
          </div>
        </aside>

        {/* Module Viewport */}
        <main className="flex-1 p-6 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeModule}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {activeModule === 'core' && renderCore()}
              {activeModule === 'voice' && renderVoice()}
              {activeModule === 'memory' && renderMemory()}
              {activeModule === 'home' && renderHome()}
              {activeModule === 'health' && renderHealth()}
              {activeModule === 'reminder' && renderReminder()}
              {activeModule === 'twin' && renderTwin()}
              {activeModule === 'autonomy' && renderAutonomy()}
              {activeModule === 'social' && renderSocial()}
              {activeModule === 'media' && renderMedia()}
              {activeModule === 'security' && renderSecurity()}
              {!['core', 'voice', 'memory', 'home', 'health', 'reminder', 'twin', 'autonomy', 'social', 'media', 'security'].includes(activeModule) && (
                <div className="h-full flex items-center justify-center opacity-20">
                  <div className="text-center">
                    <LayoutDashboard className="w-24 h-24 mx-auto mb-4 text-aurion-cyan" />
                    <h2 className="text-2xl font-bold uppercase tracking-[0.5em]">Модуль {activeModule}</h2>
                    <p className="mt-2 text-xs uppercase tracking-widest">Идет инициализация...</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* --- Footer Status Bar --- */}
      <footer className="h-10 border-t border-white/5 flex items-center justify-between px-6 bg-aurion-bg/60 backdrop-blur-xl z-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 group cursor-pointer">
            <Database className="w-3.5 h-3.5 text-aurion-cyan group-hover:text-white transition-colors" />
            <span className="text-[9px] font-display font-bold uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">Хранилище: 1.2 ТБ свободно</span>
          </div>
          <div className="flex items-center gap-2 group cursor-pointer">
            <Cloud className="w-3.5 h-3.5 text-aurion-cyan group-hover:text-white transition-colors" />
            <span className="text-[9px] font-display font-bold uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">Облачная синхронизация: Активна</span>
          </div>
          <div className="flex items-center gap-2 group cursor-pointer">
            <Smartphone className="w-3.5 h-3.5 text-aurion-cyan group-hover:text-white transition-colors" />
            <span className="text-[9px] font-display font-bold uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">Мобильная связь: Подключена</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-aurion-cyan animate-pulse shadow-[0_0_8px_rgba(0,242,255,0.8)]" />
            <span className="text-[9px] font-display font-bold uppercase tracking-widest text-slate-600">Aurion OS v2.4.1-Delta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-aurion-purple shadow-[0_0_8px_rgba(179,0,255,0.8)]" />
            <span className="text-[9px] font-display font-bold uppercase tracking-widest text-slate-600">Neural Engine: Активные</span>
          </div>
          <div className="flex items-center gap-2 ml-4 border-l border-white/10 pl-4">
            <span className="text-[9px] font-display font-bold uppercase tracking-widest text-slate-500">© 2026 Aurion Industries. CEO: Черников Максим Альгимантасович</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

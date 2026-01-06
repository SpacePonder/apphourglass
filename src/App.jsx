import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Infinity as InfinityIcon, Briefcase, Dog, Palette, Rocket, Dumbbell, PenTool, Gamepad2, Trash2, Plus, LayoutGrid, Folder, Monitor, Coffee, Music, Book, Code, Cpu, Globe, Database, Server, Wifi, Smartphone, Headphones, Camera, Video, Mic, Speaker, Sun, Moon, Star, Heart, Smile, Zap, Archive, Bike, Car, Cloud, DollarSign, Gift, Home, Key, Lock, Mail, MapPin, Phone, Printer, ShoppingCart, Wrench as Tool, Truck, Umbrella, User, Watch } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Hourglass } from '@/components/Hourglass';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  'Briefcase': Briefcase, 'Dog': Dog, 'Palette': Palette, 'Rocket': Rocket,
  'Dumbbell': Dumbbell, 'PenTool': PenTool, 'Gamepad': Gamepad2, 'Folder': Folder,
  'LayoutGrid': LayoutGrid, 'Monitor': Monitor, 'Coffee': Coffee, 'Music': Music,
  'Book': Book, 'Code': Code, 'Cpu': Cpu, 'Globe': Globe, 'Database': Database,
  'Server': Server, 'Wifi': Wifi, 'Smartphone': Smartphone, 'Headphones': Headphones,
  'Camera': Camera, 'Video': Video, 'Mic': Mic, 'Speaker': Speaker, 'Sun': Sun,
  'Moon': Moon, 'Star': Star, 'Heart': Heart, 'Smile': Smile, 'Zap': Zap,
  'Archive': Archive, 'Bike': Bike, 'Car': Car, 'Cloud': Cloud, 'DollarSign': DollarSign,
  'Gift': Gift, 'Home': Home, 'Key': Key, 'Lock': Lock, 'Mail': Mail,
  'MapPin': MapPin, 'Phone': Phone, 'Printer': Printer, 'ShoppingCart': ShoppingCart,
  'Tool': Tool, 'Truck': Truck, 'Umbrella': Umbrella, 'User': User, 'Watch': Watch
};

const DEFAULT_PROJECTS = [
  { id: 1, name: 'Administrative', icon: 'Briefcase' },
  { id: 2, name: 'Doggo Walking', icon: 'Dog' },
  { id: 3, name: 'Graphic Design', icon: 'Palette' },
  { id: 4, name: 'Space Science Lab', icon: 'Rocket' },
  { id: 5, name: 'Exercise', icon: 'Dumbbell' },
  { id: 6, name: 'Writing', icon: 'PenTool' },
  { id: 7, name: 'Gaming', icon: 'Gamepad' }
];

const POMODORO_DURATION = 25 * 60;

const generatePlaceholderLogs = () => {
  const logs = [];
  const now = new Date();
  const projects = DEFAULT_PROJECTS.map(p => p.name);
  for (let i = 0; i < 120; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const isPomo = Math.random() > 0.3;
    const durationSecs = isPomo ? 25 * 60 : Math.floor(Math.random() * 3000 + 600);
    const mins = Math.floor(durationSecs / 60);
    const secs = durationSecs % 60;
    const hour = Math.floor(Math.random() * 12) + 9;
    const minute = Math.floor(Math.random() * 60);
    logs.push({
      id: Date.now() - i * 10000,
      project: projects[Math.floor(Math.random() * projects.length)],
      type: isPomo ? 'Pomodoro session' : 'Infinite session',
      startTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      duration: `${mins}:${secs.toString().padStart(2, '0')}`,
      date: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      timestamp: date.getTime(),
      notes: Math.random() > 0.7 ? "Session notes placeholder..." : ""
    });
  }
  return logs.sort((a, b) => b.timestamp - a.timestamp);
};

const TomatoIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 5c-5.5 0-10 3.6-10 8 0 4.4 4.5 8 10 8s10-3.6 10-8c0-4.4-4.5-8-10-8z" />
    <path d="M12 5V2" /><path d="M12 5c0 0 1-2 4-3" /><path d="M12 5c0 0-1-2-4-3" />
  </svg>
);

function App() {
  const [activeTab, setActiveTab] = useState('timer');
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [selectedProject, setSelectedProject] = useState('Gaming');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectIcon, setNewProjectIcon] = useState('Folder');
  const jetBrainsStyle = { fontFamily: "'JetBrains Mono', monospace" };
  const [notes, setNotes] = useState('');
  const [sessionType, setSessionType] = useState('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [logs, setLogs] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const savedProjects = localStorage.getItem('pomodoroProjects');
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) setProjects(parsed);
      } catch (e) { localStorage.setItem('pomodoroProjects', JSON.stringify(DEFAULT_PROJECTS)); }
    }
    const savedLogs = localStorage.getItem('pomodoroLogs');
    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs);
        if (Array.isArray(parsed)) setLogs(parsed);
      } catch (e) { setLogs(generatePlaceholderLogs()); }
    } else { setLogs(generatePlaceholderLogs()); }
  }, []);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft(prev => sessionType === 'pomodoro' ? (prev > 0 ? prev - 1 : 0) : prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, sessionType]);

  useEffect(() => {
    if (isRunning && sessionType === 'pomodoro' && timeLeft === 0) handleTimerComplete();
  }, [timeLeft, isRunning, sessionType]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    saveLog();
    setTimeLeft(sessionType === 'pomodoro' ? POMODORO_DURATION : 0);
    setSessionStartTime(null);
    showNotification("SESSION COMPLETE");
  };

  const deleteLog = (logId) => {
    const updatedLogs = logs.filter(log => log.id !== logId);
    setLogs(updatedLogs);
    localStorage.setItem('pomodoroLogs', JSON.stringify(updatedLogs));
    showNotification("LOG DELETED");
  };

  const logsWithStreaks = useMemo(() => {
    if (!logs.length) return [];
    const sortedAsc = [...logs].sort((a, b) => a.timestamp - b.timestamp);
    let currentStreak = 0;
    let lastPomoDate = null;
    const streakMap = {};
    sortedAsc.forEach(log => {
      if (log.type !== 'Pomodoro session') { streakMap[log.id] = 0; return; }
      const logDate = new Date(log.timestamp);
      logDate.setHours(0,0,0,0);
      if (!lastPomoDate) { currentStreak = 1; } 
      else {
        const diff = (logDate - lastPomoDate) / (1000 * 60 * 60 * 24);
        currentStreak = diff <= 1 ? currentStreak + 1 : 1;
      }
      lastPomoDate = logDate;
      streakMap[log.id] = currentStreak;
    });
    return logs.map(log => ({ ...log, streak: streakMap[log.id] || 0 })).sort((a, b) => b.timestamp - a.timestamp);
  }, [logs]);

  const handleHourglassClick = () => {
    if (isRunning) handleTimerComplete();
    else {
      if (!sessionStartTime) setSessionStartTime(new Date());
      setIsRunning(true);
    }
  };

  const handlePomodoro = () => {
    if (isRunning) handleTimerComplete();
    setSessionType('pomodoro');
    setIsRunning(false);
    setTimeLeft(POMODORO_DURATION);
  };

  const handleInfinite = () => {
    if (isRunning) handleTimerComplete();
    setSessionType('infinite');
    setIsRunning(false);
    setTimeLeft(0);
  };

  const saveLog = () => {
    if (sessionStartTime) {
      const durationSecs = sessionType === 'infinite' ? timeLeft : POMODORO_DURATION - timeLeft;
      if (durationSecs >= 10) {
        const newLog = {
          id: Date.now(),
          project: selectedProject,
          type: sessionType === 'pomodoro' ? 'Pomodoro session' : 'Infinite session',
          startTime: sessionStartTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          duration: formatTime(durationSecs),
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          timestamp: Date.now(),
          notes: notes
        };
        const updatedLogs = [newLog, ...logs];
        setLogs(updatedLogs);
        localStorage.setItem('pomodoroLogs', JSON.stringify(updatedLogs));
        setNotes('');
      }
    }
  };

  const addProject = () => {
    if (!newProjectName.trim()) return;
    const newP = { id: Date.now(), name: newProjectName, icon: newProjectIcon };
    const updated = [...projects, newP];
    setProjects(updated);
    localStorage.setItem('pomodoroProjects', JSON.stringify(updated));
    setNewProjectName('');
  };

  const deleteProject = id => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('pomodoroProjects', JSON.stringify(updated));
  };

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentProjectObj = projects.find(p => p.name === selectedProject) || projects[0] || {};
  const CurrentProjectIcon = ICON_MAP[currentProjectObj.icon] || Folder;

  const groupedLogs = logsWithStreaks.reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = [];
    acc[log.date].push(log);
    return acc;
  }, {});

  return (
    <>
      <Helmet><title>POMODORO OS</title></Helmet>
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-4 font-mono overflow-hidden">
        <div className="w-full max-w-[360px] aspect-[9/16] border-4 border-black bg-white flex flex-col relative overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-3 bg-transparent border-b-2 border-black h-14 shrink-0">
              {['timer', 'logs', 'projects'].map(tab => (
                <TabsTrigger 
                  key={tab} 
                  value={tab} 
                  style={jetBrainsStyle} 
                  className="h-full uppercase font-bold text-sm data-[state=active]:bg-black data-[state=active]:text-white rounded-none border-r-2 last:border-r-0 border-black"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-hidden relative">
              <TabsContent value="timer" className="h-full m-0 p-6 flex flex-col gap-4">
                <div className="border-2 border-black p-3 shrink-0">
                  <label style={jetBrainsStyle} className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Target Protocol</label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="w-full h-10 border-2 border-black rounded-none shadow-none focus:ring-0">
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-black text-white"><CurrentProjectIcon className="w-3 h-3" /></div>
                        <span style={jetBrainsStyle} className="font-bold text-sm uppercase truncate">{currentProjectObj.name}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="border-2 border-black rounded-none shadow-none bg-white max-h-[300px] z-[100]">
                      {projects.map(p => {
                        const Icon = ICON_MAP[p.icon] || Folder;
                        return (
                          <SelectItem key={p.id} value={p.name} className="uppercase font-bold">
                            <div className="flex items-center gap-2"><Icon className="w-4 h-4" /><span style={jetBrainsStyle}>{p.name}</span></div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-2 border-black p-3 flex flex-col shrink-0">
                  <label style={jetBrainsStyle} className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Session Data</label>
                  <Textarea 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    style={jetBrainsStyle}
                    className="w-full border-2 border-black rounded-none resize-none text-xs h-24 p-2 focus-visible:ring-0 shadow-none" 
                    placeholder="[INSERT NOTES]" 
                  />
                </div>

                <div className="border-2 border-black flex items-center shrink-0 h-14">
                  <Hourglass isRunning={isRunning} onClick={handleHourglassClick} className="w-14 h-full border-r-2 border-black" />
                  <Button onClick={handlePomodoro} variant="ghost" className={cn("w-14 h-full border-r-2 border-black rounded-none", sessionType === 'pomodoro' ? "bg-black text-white" : "bg-white")}>
                    <TomatoIcon className="w-6 h-6" />
                  </Button>
                  <Button onClick={handleInfinite} variant="ghost" className={cn("w-14 h-full border-r-2 border-black rounded-none", sessionType === 'infinite' ? "bg-black text-white" : "bg-white")}>
                    <InfinityIcon className="w-6 h-6" />
                  </Button>
                  <div style={jetBrainsStyle} className="flex-1 flex items-center justify-center font-bold text-3xl tracking-widest">
                    {formatTime(timeLeft)}
                  </div>
                </div>

                <div className="text-center h-8 shrink-0 flex items-center justify-center">
                  {notification && <span style={jetBrainsStyle} className="text-xs font-bold uppercase bg-black text-white px-3 py-1">{notification}</span>}
                </div>
              </TabsContent>

              <TabsContent value="projects" className="h-full overflow-y-auto p-6 absolute inset-0">
                <div className="border-b-4 border-black pb-2 mb-4">
                  <h2 style={jetBrainsStyle} className="text-2xl font-bold uppercase tracking-tighter">Project Database</h2>
                </div>
                <div className="flex gap-2 mb-4">
                  <Input 
                    value={newProjectName} 
                    onChange={e => setNewProjectName(e.target.value)} 
                    style={jetBrainsStyle}
                    placeholder="NEW PROJECT..." 
                    className="border-2 border-black rounded-none font-bold" 
                  />
                  <Button onClick={addProject} className="bg-black text-white rounded-none"><Plus /></Button>
                </div>
                <div className="space-y-2">
                  {projects.map(p => {
                    const Icon = ICON_MAP[p.icon] || Folder;
                    return (
                      <div key={p.id} className="border-2 border-black p-3 flex justify-between items-center font-bold uppercase">
                        <div className="flex items-center gap-4">
                          <Icon className="w-5 h-5" />
                          <span style={jetBrainsStyle}>{p.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteProject(p.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="logs" className="h-full overflow-y-auto p-6 absolute inset-0">
                <div className="border-b-4 border-black pb-2 mb-4">
                  <h2 style={jetBrainsStyle} className="text-2xl font-bold uppercase tracking-tighter">Session Logs</h2>
                </div>
                <div className="space-y-4">
                  {Object.entries(groupedLogs).map(([date, dateLogs]) => (
                    <div key={date}>
                      <div style={jetBrainsStyle} className="bg-black text-white text-[10px] font-bold px-2 py-1 mb-2 inline-block uppercase">{date}</div>
                      {dateLogs.map(log => (
                        <div key={log.id} className="border-2 border-black p-2 mb-2 bg-white relative group">
                          <div className="flex justify-between font-bold text-sm uppercase">
                            <span style={jetBrainsStyle}>{log.project}</span>
                            <span style={jetBrainsStyle}>{log.duration}</span>
                          </div>
                          <div style={jetBrainsStyle} className="text-[10px] text-gray-500 uppercase">{log.startTime} | {log.type}</div>
                          <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 bg-white border border-black rounded-full opacity-0 group-hover:opacity-100 h-6 w-6" onClick={() => deleteLog(log.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        <Toaster />
      </div>
    </>
  );
}

export default App;
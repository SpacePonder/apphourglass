
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

// Icon mapping for projects
const ICON_MAP = {
  'Briefcase': Briefcase,
  'Dog': Dog,
  'Palette': Palette,
  'Rocket': Rocket,
  'Dumbbell': Dumbbell,
  'PenTool': PenTool,
  'Gamepad': Gamepad2,
  'Folder': Folder,
  'LayoutGrid': LayoutGrid,
  'Monitor': Monitor,
  'Coffee': Coffee,
  'Music': Music,
  'Book': Book,
  'Code': Code,
  'Cpu': Cpu,
  'Globe': Globe,
  'Database': Database,
  'Server': Server,
  'Wifi': Wifi,
  'Smartphone': Smartphone,
  'Headphones': Headphones,
  'Camera': Camera,
  'Video': Video,
  'Mic': Mic,
  'Speaker': Speaker,
  'Sun': Sun,
  'Moon': Moon,
  'Star': Star,
  'Heart': Heart,
  'Smile': Smile,
  'Zap': Zap,
  'Archive': Archive,
  'Bike': Bike,
  'Car': Car,
  'Cloud': Cloud,
  'DollarSign': DollarSign,
  'Gift': Gift,
  'Home': Home,
  'Key': Key,
  'Lock': Lock,
  'Mail': Mail,
  'MapPin': MapPin,
  'Phone': Phone,
  'Printer': Printer,
  'ShoppingCart': ShoppingCart,
  'Tool': Tool,
  'Truck': Truck,
  'Umbrella': Umbrella,
  'User': User,
  'Watch': Watch
};
const DEFAULT_PROJECTS = [{
  id: 1,
  name: 'Administrative',
  icon: 'Briefcase'
}, {
  id: 2,
  name: 'Doggo Walking',
  icon: 'Dog'
}, {
  id: 3,
  name: 'Graphic Design',
  icon: 'Palette'
}, {
  id: 4,
  name: 'Space Science Lab',
  icon: 'Rocket'
}, {
  id: 5,
  name: 'Exercise',
  icon: 'Dumbbell'
}, {
  id: 6,
  name: 'Writing',
  icon: 'PenTool'
}, {
  id: 7,
  name: 'Gaming',
  icon: 'Gamepad'
}];
const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds

// Helper to generate varied logs
const generatePlaceholderLogs = () => {
  const logs = [];
  const now = new Date();
  const projects = DEFAULT_PROJECTS.map(p => p.name);

  // Generate logs for past 60 days
  for (let i = 0; i < 120; i++) {
    // Approx 2 logs per day average
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const isPomo = Math.random() > 0.3; // 70% chance of pomodoro
    const durationSecs = isPomo ? 25 * 60 : Math.floor(Math.random() * 3000 + 600);
    const mins = Math.floor(durationSecs / 60);
    const secs = durationSecs % 60;

    // Random time of day
    const hour = Math.floor(Math.random() * 12) + 9; // 9am to 9pm
    const minute = Math.floor(Math.random() * 60);
    logs.push({
      id: Date.now() - i * 10000,
      // unique-ish ids
      project: projects[Math.floor(Math.random() * projects.length)],
      type: isPomo ? 'Pomodoro session' : 'Infinite session',
      startTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      duration: `${mins}:${secs.toString().padStart(2, '0')}`,
      date: date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      timestamp: date.getTime(),
      notes: Math.random() > 0.7 ? "Session notes placeholder..." : ""
    });
  }
  return logs.sort((a, b) => b.timestamp - a.timestamp);
};

// Custom Monochrome Tomato Icon
const TomatoIcon = ({
  className
}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 5c-5.5 0-10 3.6-10 8 0 4.4 4.5 8 10 8s10-3.6 10-8c0-4.4-4.5-8-10-8z" />
    <path d="M12 5V2" />
    <path d="M12 5c0 0 1-2 4-3" />
    <path d="M12 5c0 0-1-2-4-3" />
  </svg>;

function App() {
  const [activeTab, setActiveTab] = useState('timer');
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [selectedProject, setSelectedProject] = useState('Gaming');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectIcon, setNewProjectIcon] = useState('Folder');
  const [notes, setNotes] = useState('');
  const [sessionType, setSessionType] = useState('pomodoro'); // 'pomodoro' or 'infinite'
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [logs, setLogs] = useState([]);
  const [notification, setNotification] = useState(null);

  // Load and Restore Data Logic
  useEffect(() => {
    // 1. Projects Restoration
    const savedProjects = localStorage.getItem('pomodoroProjects');
    let loadedProjects = DEFAULT_PROJECTS;
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedProjects = parsed;
        } else {
          localStorage.setItem('pomodoroProjects', JSON.stringify(DEFAULT_PROJECTS));
        }
      } catch (e) {
        localStorage.setItem('pomodoroProjects', JSON.stringify(DEFAULT_PROJECTS));
      }
    } else {
      localStorage.setItem('pomodoroProjects', JSON.stringify(DEFAULT_PROJECTS));
    }
    setProjects(loadedProjects);

    // 2. Logs Restoration
    const savedLogs = localStorage.getItem('pomodoroLogs');
    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLogs(parsed);
        } else {
          const sampleLogs = generatePlaceholderLogs();
          setLogs(sampleLogs);
          localStorage.setItem('pomodoroLogs', JSON.stringify(sampleLogs));
        }
      } catch (e) {
        const sampleLogs = generatePlaceholderLogs();
        setLogs(sampleLogs);
        localStorage.setItem('pomodoroLogs', JSON.stringify(sampleLogs));
      }
    } else {
      const sampleLogs = generatePlaceholderLogs();
      setLogs(sampleLogs);
      localStorage.setItem('pomodoroLogs', JSON.stringify(sampleLogs));
    }
  }, []);

  // Timer Interval
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (sessionType === 'pomodoro') {
            // Prevent going below 0
            return prev > 0 ? prev - 1 : 0;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, sessionType]);

  // Check for timer completion
  useEffect(() => {
    if (isRunning && sessionType === 'pomodoro' && timeLeft === 0) {
      handleTimerComplete();
    }
  }, [timeLeft, isRunning, sessionType]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    saveLog();
    
    // Reset timer state after completion
    if (sessionType === 'pomodoro') {
      setTimeLeft(POMODORO_DURATION);
    } else {
      setTimeLeft(0);
    }
    setSessionStartTime(null);
    
    showNotification("SESSION COMPLETE");
  };

  const deleteLog = (logId) => {
    const updatedLogs = logs.filter(log => log.id !== logId);
    setLogs(updatedLogs);
    localStorage.setItem('pomodoroLogs', JSON.stringify(updatedLogs));
    showNotification("LOG DELETED");
  };

  // Calculate streaks per log entry for display
  const logsWithStreaks = useMemo(() => {
    if (!Array.isArray(logs) || logs.length === 0) return [];

    // Safe sort
    const sortedAsc = [...logs].sort((a, b) => {
      try {
        const [dA, mA, yA] = (a.date || '').split('/');
        const [dB, mB, yB] = (b.date || '').split('/');
        const dateA = new Date(`${yA}-${mA}-${dA}T${a.startTime || '00:00'}`);
        const dateB = new Date(`${yB}-${mB}-${dB}T${b.startTime || '00:00'}`);
        return dateA - dateB;
      } catch (e) {
        return 0;
      }
    });
    let currentStreak = 0;
    let lastPomoDate = null;
    const streakMap = {};
    sortedAsc.forEach(log => {
      if (log.type !== 'Pomodoro session') {
        streakMap[log.id] = 0;
        return;
      }
      try {
        const [d, m, y] = (log.date || '').split('/');
        const logDate = new Date(`${y}-${m}-${d}`);
        if (isNaN(logDate.getTime())) {
          streakMap[log.id] = 0;
          return;
        }
        if (!lastPomoDate) {
          currentStreak = 1;
          lastPomoDate = logDate;
        } else {
          const diffTime = Math.abs(logDate - lastPomoDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays <= 1) {
            currentStreak++;
          } else {
            currentStreak = 1;
          }
          lastPomoDate = logDate;
        }
        streakMap[log.id] = currentStreak;
      } catch (e) {
        streakMap[log.id] = 0;
      }
    });

    // Return descending
    return logs.map(log => ({
      ...log,
      streak: streakMap[log.id] || 0
    })).sort((a, b) => {
      try {
        const [dA, mA, yA] = (a.date || '').split('/');
        const [dB, mB, yB] = (b.date || '').split('/');
        const dateA = new Date(`${yA}-${mA}-${dA}T${a.startTime || '00:00'}`);
        const dateB = new Date(`${yB}-${mB}-${dB}T${b.startTime || '00:00'}`);
        return dateB - dateA;
      } catch (e) {
        return 0;
      }
    });
  }, [logs]);

  // Main Action Handler (Start/Finish)
  const handleHourglassClick = () => {
    if (isRunning) {
      // If running, clicking means FINISH (Complete & Reset)
      handleTimerComplete();
    } else {
      // If not running, Start
      if (!sessionStartTime) setSessionStartTime(new Date());
      setIsRunning(true);
    }
  };

  const handlePomodoro = () => {
    // If running, save current progress before switch
    if (isRunning && sessionStartTime) {
      handleTimerComplete();
    }
    
    setSessionType('pomodoro');
    setIsRunning(false);
    setTimeLeft(POMODORO_DURATION);
    setSessionStartTime(null);
  };

  const handleInfinite = () => {
    // If running, save current progress before switch
    if (isRunning && sessionStartTime) {
      handleTimerComplete();
    }
    
    setSessionType('infinite');
    setIsRunning(false);
    setTimeLeft(0);
    setSessionStartTime(null);
  };

  const saveLog = () => {
    if (sessionStartTime) {
      // For infinite, duration is just timeLeft (count up)
      // For pomodoro, it's (Duration - timeLeft)
      let durationSecs = 0;
      
      if (sessionType === 'infinite') {
        durationSecs = timeLeft;
      } else {
        durationSecs = POMODORO_DURATION - timeLeft;
      }

      // Only save if duration > 10 seconds to avoid accidental clicks
      if (durationSecs >= 10) {
        const newLog = {
          id: Date.now(),
          project: selectedProject,
          type: sessionType === 'pomodoro' ? 'Pomodoro session' : 'Infinite session',
          startTime: sessionStartTime.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          duration: formatTime(durationSecs),
          date: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          timestamp: Date.now(),
          notes: notes
        };
        const updatedLogs = [newLog, ...logs];
        setLogs(updatedLogs);
        localStorage.setItem('pomodoroLogs', JSON.stringify(updatedLogs));
        setNotes(''); // Clear notes after save
      }
    }
  };

  const addProject = () => {
    if (!newProjectName.trim()) return;
    const newProject = {
      id: Date.now(),
      name: newProjectName,
      icon: newProjectIcon
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem('pomodoroProjects', JSON.stringify(updatedProjects));
    setNewProjectName('');
    setNewProjectIcon('Folder');
    showNotification("PROJECT ADDED");
  };

  const deleteProject = id => {
    const updatedProjects = projects.filter(p => p.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem('pomodoroProjects', JSON.stringify(updatedProjects));
    if (projects.find(p => p.id === id)?.name === selectedProject) {
      setSelectedProject(updatedProjects[0]?.name || '');
    }
  };

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const groupedLogs = logsWithStreaks.reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = [];
    acc[log.date].push(log);
    return acc;
  }, {});
  
  const totalFocusTime = (groupedLogs[new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })] || []).reduce((total, log) => {
    const [mins] = log.duration.split(':');
    return total + parseInt(mins || 0);
  }, 0);

  // Helper to find current project object
  const currentProjectObj = projects.find(p => p.name === selectedProject) || projects[0] || {};
  const CurrentProjectIcon = ICON_MAP[currentProjectObj.icon] || Folder;

  return <>
      <Helmet>
        <title>POMODORO OS</title>
        <meta name="description" content="Minimalist productivity timer" />
      </Helmet>
      
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-4 font-mono overflow-hidden">
        {/* Main Container: 9:16 Aspect Ratio, Max Width 360px (Mobile size) */}
        <div className="w-full max-w-[360px] aspect-[9/16] border-4 border-black bg-white shadow-none flex flex-col relative overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 gap-0 border-b-2 border-black rounded-none shrink-0 h-14">
              {['timer', 'logs', 'projects'].map(tab => <TabsTrigger key={tab} value={tab} className={cn("h-full rounded-none border-black -mb-[2px] text-sm font-bold uppercase tracking-wider transition-all data-[state=active]:ring-0 data-[state=active]:ring-offset-0", "data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-none", "data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-gray-50", tab === 'timer' && "border-r-2", tab === 'logs' && "border-r-2")}>
                  {tab}
                </TabsTrigger>)}
            </TabsList>

            <div className="flex-1 overflow-hidden relative bg-white">
              <TabsContent value="timer" className="h-full flex flex-col mt-0">
                <div className="p-6 flex flex-col h-full gap-4">
                  
                  {/* Project Selector (Fixed Height) */}
                  <div className="border-2 border-black p-3 shrink-0">
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Target Protocol</label>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger className="w-full h-10 border-2 border-black rounded-none bg-white hover:bg-gray-50 focus:ring-0 focus:ring-offset-0 shadow-none">
                        <div className="flex items-center gap-3">
                          <div className="p-1 bg-black text-white">
                            <CurrentProjectIcon className="w-3 h-3" />
                          </div>
                          <span className="font-bold text-sm uppercase tracking-tight truncate">{currentProjectObj.name}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black rounded-none shadow-none bg-white max-h-[300px] z-[100]">
                        {projects.map(project => {
                        const Icon = ICON_MAP[project.icon] || Folder;
                        return <SelectItem key={project.id} value={project.name} className="rounded-none focus:bg-gray-100 focus:text-black uppercase cursor-pointer py-2 border-b border-gray-100 last:border-0">
                              <div className="flex items-center gap-3">
                                <Icon className="w-4 h-4" />
                                <span className="font-bold">{project.name}</span>
                              </div>
                            </SelectItem>;
                      })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes (Flexible Height - Fills remaining space) */}
                  <div className="border-2 border-black p-3 flex flex-col flex-1 min-h-0">
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Session Data</label>
                    <Textarea 
                      value={notes} 
                      onChange={e => setNotes(e.target.value)} 
                      className="w-full border-2 border-black rounded-none resize-none focus-visible:ring-0 text-xs shadow-none placeholder:text-gray-400 flex-1 p-2 h-full" 
                      placeholder="[INSERT NOTES]" 
                    />
                  </div>

                  {/* Main Controls & Timer Display (Unified Row, Fixed Height) */}
                  <div className="border-2 border-black flex items-center shrink-0 h-14">
                     
                     {/* Hourglass (Start/Finish) */}
                     <Hourglass 
                       isRunning={isRunning} 
                       onClick={handleHourglassClick} 
                       className="w-14 h-full border-r-2 border-black" 
                     />
                     
                     {/* Mode Toggles */}
                     <Button 
                        onClick={handlePomodoro} 
                        variant="ghost" 
                        className={cn(
                          "rounded-none w-14 h-full border-r-2 border-black p-0 flex items-center justify-center transition-all", 
                          sessionType === 'pomodoro' ? "bg-black text-white hover:bg-black hover:text-white" : "bg-white text-black hover:bg-gray-100"
                        )}
                        title="Pomodoro Mode"
                      >
                        <TomatoIcon className="w-6 h-6" />
                      </Button>

                      <Button 
                        onClick={handleInfinite} 
                        variant="ghost" 
                        className={cn(
                          "rounded-none w-14 h-full border-r-2 border-black p-0 flex items-center justify-center transition-all", 
                          sessionType === 'infinite' ? "bg-black text-white hover:bg-black hover:text-white" : "bg-white text-black hover:bg-gray-100"
                        )}
                        title="Infinite Mode"
                      >
                        <InfinityIcon className="w-6 h-6" />
                      </Button>

                     {/* Timer Display */}
                     <div className="flex-1 flex items-center justify-center font-mono font-bold text-3xl tracking-widest">
                        {formatTime(timeLeft)}
                     </div>
                  </div>

                  {/* Notification Area (Fixed Height, Bottom) */}
                  <div className="text-center h-8 shrink-0 flex items-center justify-center overflow-hidden">
                     {notification && (
                       <span className="text-xs font-bold uppercase tracking-widest bg-black text-white px-3 py-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                         {notification}
                       </span>
                     )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="projects" className="h-full overflow-y-auto p-6 space-y-6 mt-0 bg-white absolute inset-0">
                <div className="border-b-4 border-black pb-4">
                  <h2 className="text-3xl font-bold uppercase tracking-tighter">Project Database</h2>
                  <p className="text-xs uppercase tracking-widest mt-1 text-gray-500">Configure active projects here
                </p>
                </div>

                <div className="flex flex-col gap-2 border-2 border-black p-4 bg-gray-50">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">New Project Entry</label>
                  <div className="flex gap-2">
                     <Select value={newProjectIcon} onValueChange={setNewProjectIcon}>
                      <SelectTrigger className="w-[80px] h-12 rounded-none border-2 border-black bg-white focus:ring-0">
                         {(() => {
                        const Icon = ICON_MAP[newProjectIcon] || Folder;
                        return <Icon className="w-5 h-5" />;
                      })()}
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black rounded-none bg-white z-[100] max-h-[300px]">
                        <div className="grid grid-cols-5 gap-1 p-2">
                           {Object.entries(ICON_MAP).map(([name, Icon]) => <div key={name} onClick={() => setNewProjectIcon(name)} className={cn("p-2 cursor-pointer hover:bg-gray-100 flex justify-center items-center border border-transparent", newProjectIcon === name && "bg-black text-white")} title={name}>
                               <Icon className="w-5 h-5" />
                             </div>)}
                        </div>
                      </SelectContent>
                    </Select>
                    
                    <Input placeholder="DESIGNATION..." value={newProjectName} onChange={e => setNewProjectName(e.target.value)} className="rounded-none border-2 border-black focus-visible:ring-0 uppercase placeholder:normal-case h-12 text-lg font-bold flex-1" />
                    <Button onClick={addProject} className="rounded-none bg-black text-white hover:bg-gray-800 w-16 h-12 border-2 border-black">
                      <Plus className="w-6 h-6" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {projects.map(project => {
                  const Icon = ICON_MAP[project.icon] || Folder;
                  const isActive = project.name === selectedProject;
                  return <div key={project.id} className={cn("flex items-center justify-between p-4 border-2 transition-all cursor-pointer", isActive ? "border-black bg-black text-white" : "border-gray-200 hover:border-black text-black bg-white")} onClick={() => setSelectedProject(project.name)}>
                        <div className="flex items-center gap-4">
                          <Icon className="w-5 h-5" />
                          <span className="font-bold uppercase tracking-tight">{project.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           {isActive && <span className="text-[10px] font-bold uppercase bg-white text-black px-2 py-1 tracking-widest">Selected</span>}
                           <Button variant="ghost" size="icon" onClick={e => {
                        e.stopPropagation();
                        deleteProject(project.id);
                      }} className={cn("h-8 w-8 rounded-none", isActive ? "hover:bg-gray-800 text-white" : "hover:bg-red-50 hover:text-red-600")}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>;
                })}
                </div>
              </TabsContent>

              <TabsContent value="logs" className="h-full overflow-y-auto p-6 space-y-6 mt-0 bg-white absolute inset-0">
                <div className="border-b-4 border-black pb-4 flex justify-between items-end sticky top-0 bg-white z-10 pt-2">
                  <div>
                    <h2 className="text-3xl font-bold uppercase tracking-tighter">Session Logs</h2>
                    <p className="text-xs uppercase tracking-widest mt-1 text-gray-500">Total Focus: {totalFocusTime} MIN</p>
                  </div>
                </div>

                <div className="space-y-8 pb-8">
                  {Object.entries(groupedLogs).sort((a, b) => {
                  try {
                    const [dA, mA, yA] = (a[0] || '').split('/');
                    const [dB, mB, yB] = (b[0] || '').split('/');
                    const dateA = new Date(`${yA}-${mA}-${dA}`);
                    const dateB = new Date(`${yB}-${mB}-${dB}`);
                    return dateB - dateA;
                  } catch (e) {
                    return 0;
                  }
                }).map(([date, dateLogs]) => <div key={date}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-0.5 bg-black flex-1"></div>
                        <span className="text-xs font-bold uppercase tracking-widest bg-black text-white px-3 py-1">{date}</span>
                        <div className="h-0.5 bg-black flex-1"></div>
                      </div>
                      
                      <div className="space-y-3">
                        {dateLogs.map(log => {
                      const project = projects.find(p => p.name === log.project);
                      const Icon = project ? ICON_MAP[project.icon] || Folder : Folder;
                      const hasStreak = log.streak > 1;
                      const isInfinite = log.type === 'Infinite session';
                      return <div key={log.id} className="border-2 border-black p-3 bg-white relative group hover:bg-gray-50 transition-colors">
                              {/* Delete Button - Positioned absolutely in top-right, overlays content slightly on hover but ensures clean layout otherwise */}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteLog(log.id);
                                }}
                                className="absolute -top-3 -right-3 h-8 w-8 bg-white border-2 border-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-50 hover:text-red-600 shadow-sm"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>

                              <div className="flex flex-col gap-2">
                                {/* Header Row: Project Name + Stats + Duration */}
                                <div className="flex justify-between items-center gap-2">
                                  {/* Left: Icon + Name + Streak */}
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span className="font-bold uppercase text-sm truncate">{log.project}</span>
                                    {hasStreak && (
                                      <div className="flex items-center gap-1 bg-gray-100 border border-black px-1.5 py-0.5 shrink-0" title={`${log.streak} consecutive sessions`}>
                                        <TomatoIcon className="w-3 h-3 text-black" />
                                        <span className="text-[10px] font-bold text-black leading-none mt-[1px]">x{log.streak}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Right: Duration Box */}
                                  <span className="text-sm font-mono font-bold bg-black text-white px-2 py-1 shrink-0 ml-1">{log.duration}</span>
                                </div>

                                {/* Meta Row: Type + Time */}
                                <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                  <div className="flex items-center gap-2">
                                    {isInfinite ? <InfinityIcon className="w-3 h-3" /> : <span>POMO</span>}
                                    <span className="opacity-50">|</span>
                                    <span>{log.startTime}</span>
                                  </div>
                                </div>
                                
                                {/* Notes */}
                                {log.notes && (
                                  <div className="text-xs text-gray-600 border-t border-gray-100 pt-2 font-sans italic truncate">
                                    "{log.notes}"
                                  </div>
                                )}
                              </div>
                            </div>;
                    })}
                      </div>
                    </div>)}
                  {logs.length === 0 && <div className="text-center py-16 border-2 border-dashed border-gray-300">
                      <LayoutGrid className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="font-bold text-gray-400 uppercase tracking-widest">No Data Recorded</p>
                    </div>}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        <Toaster />
      </div>
    </>;
}
export default App;

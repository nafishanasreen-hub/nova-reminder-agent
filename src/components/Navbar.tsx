import React, { useEffect, useState } from 'react';
import { Bot, BookOpen, Activity, Bell, Calendar, RotateCcw, Sparkles } from 'lucide-react';
import { ReminderItem } from '../types/agent';

interface NavbarProps {
  activeTab: 'assistant' | 'academy' | 'inspector';
  setActiveTab: (tab: 'assistant' | 'academy' | 'inspector') => void;
  activeReminders: ReminderItem[];
  onResetData: () => void;
  onOpenQuickPlanner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeReminders,
  onResetData,
  onOpenQuickPlanner,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const pendingRemindersCount = activeReminders.filter((r) => r.status === 'active').length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Bot className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                Nova <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">Agent</span>
              </h1>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-indigo-400 border border-indigo-500/20">
                Personal AI & Dev Studio
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">
              Reminders • Scheduling • Daily Planning • Task Workflows
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'assistant'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Assistant Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab('academy')}
            className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'academy'
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Agent Dev Academy</span>
            <span className="rounded-full bg-cyan-400/20 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300">
              Guide
            </span>
          </button>

          <button
            onClick={() => setActiveTab('inspector')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'inspector'
                ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-md shadow-violet-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Live Inspector</span>
          </button>
        </div>

        {/* Right side: Clock, Reminders Badge, Quick Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Clock */}
          <div className="hidden items-center gap-2 rounded-lg border border-slate-800/80 bg-slate-900/60 px-2.5 py-1 text-right lg:flex">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <div>
              <div className="text-[11px] font-semibold text-slate-200 font-mono">{currentTime}</div>
              <div className="text-[9px] text-slate-400">{currentDate}</div>
            </div>
          </div>

          {/* Pending Reminders Pill */}
          <div
            title={`${pendingRemindersCount} active reminders`}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs text-slate-300"
          >
            <Bell className={`h-3.5 w-3.5 ${pendingRemindersCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="font-semibold text-slate-200">{pendingRemindersCount}</span>
            <span className="hidden text-[10px] text-slate-400 sm:inline">due</span>
          </div>

          {/* Quick Plan button */}
          <button
            onClick={onOpenQuickPlanner}
            className="hidden sm:flex items-center gap-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-2.5 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-600/30 hover:text-white transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Plan My Day</span>
          </button>

          {/* Reset Demo button */}
          <button
            onClick={onResetData}
            title="Reset sample data"
            className="flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

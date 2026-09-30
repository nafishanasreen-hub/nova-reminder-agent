import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  Volume2,
  AlertTriangle,
  RotateCw,
  Sparkles,
  Calendar
} from 'lucide-react';
import { ReminderItem, PriorityLevel } from '../types/agent';
import { sound } from '../utils/audio';

interface RemindersPanelProps {
  reminders: ReminderItem[];
  onAddReminder: (reminder: Omit<ReminderItem, 'id' | 'createdAt'>) => void;
  onToggleStatus: (id: string, newStatus: 'completed' | 'active' | 'dismissed') => void;
  onSnooze: (id: string, minutes: number) => void;
  onDeleteReminder: (id: string) => void;
  onAskAgentToRemind: () => void;
}

export const RemindersPanel: React.FC<RemindersPanelProps> = ({
  reminders,
  onAddReminder,
  onToggleStatus,
  onSnooze,
  onDeleteReminder,
  onAskAgentToRemind,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('14:00');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'weekdays'>('none');
  const [category, setCategory] = useState<'general' | 'health' | 'work' | 'meeting' | 'personal'>('health');
  const [notes, setNotes] = useState('');

  const filteredReminders = reminders.filter((r) => {
    if (filter === 'active') return r.status === 'active' || r.status === 'snoozed';
    if (filter === 'completed') return r.status === 'completed' || r.status === 'dismissed';
    return true;
  });

  // Find next upcoming reminder
  const activeReminders = reminders.filter((r) => r.status === 'active' || r.status === 'snoozed');
  const nextReminder = activeReminders.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))[0];

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time) return;

    onAddReminder({
      title: title.trim(),
      time,
      date,
      priority,
      recurrence,
      category,
      status: 'active',
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setNotes('');
    setShowAddForm(false);
    sound.playSuccess();
  };

  const getPriorityColor = (p: PriorityLevel) => {
    switch (p) {
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'low':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-4 py-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
              Smart Reminders
              <span className="rounded-full bg-amber-500/20 px-2 py-0.2 text-[10px] font-bold text-amber-300">
                {activeReminders.length}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Timely alarms, health nudges & recurring routines</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Chime Test */}
          <button
            onClick={() => sound.playChime()}
            title="Test Alarm Chime"
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-400 hover:text-amber-300 hover:border-amber-500/30 transition-all"
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-[11px]">Test Chime</span>
          </button>

          {/* Add Reminder Toggle */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 text-slate-950 font-medium px-3 py-1 text-xs hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Reminder</span>
          </button>
        </div>
      </div>

      {/* Next Upcoming Highlight Card */}
      {nextReminder && (
        <div className="m-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 animate-pulse">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                  Next Scheduled Reminder
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded border ${getPriorityColor(nextReminder.priority)}`}>
                  {nextReminder.priority}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-white mt-0.5">{nextReminder.title}</h4>
              <p className="text-[11px] text-slate-400">
                Scheduled for <span className="font-mono text-amber-300">{nextReminder.time}</span> ({nextReminder.date})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleStatus(nextReminder.id, 'completed')}
              className="rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-medium text-emerald-300 transition-all"
            >
              Done
            </button>
            <button
              onClick={() => onSnooze(nextReminder.id, 15)}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] text-slate-300 transition-all"
            >
              +15m
            </button>
          </div>
        </div>
      )}

      {/* Add Reminder Modal / Form */}
      {showAddForm && (
        <form onSubmit={handleCreateReminder} className="m-3 p-3.5 rounded-xl border border-slate-700 bg-slate-950 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Create Custom Reminder
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Cancel
            </button>
          </div>

          <input
            type="text"
            placeholder="What should Nova remind you about?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Time (24h)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 capitalize"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Recurrence</label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as any)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 capitalize"
              >
                <option value="none">Once</option>
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 capitalize"
              >
                <option value="health">Health</option>
                <option value="work">Work</option>
                <option value="meeting">Meeting</option>
                <option value="personal">Personal</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <input
            type="text"
            placeholder="Optional notes or checklist details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition-all"
            >
              Save Reminder
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-slate-950/40 text-xs">
        <div className="flex items-center gap-1">
          {(['active', 'completed', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-2.5 py-1 capitalize text-[11px] transition-all ${
                filter === f
                  ? 'bg-slate-800 text-white font-medium border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f} ({reminders.filter((r) => (f === 'active' ? r.status === 'active' : f === 'completed' ? r.status === 'completed' : true)).length})
            </button>
          ))}
        </div>

        <button
          onClick={onAskAgentToRemind}
          className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
        >
          <Sparkles className="h-3 w-3" />
          <span>Ask Agent</span>
        </button>
      </div>

      {/* Reminders List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredReminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <Bell className="h-8 w-8 text-slate-600 mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium text-slate-400">No {filter} reminders found</p>
            <p className="text-[11px] mt-1 text-slate-500">
              Tell Nova: "Remind me to call John at 4pm" or click "New Reminder".
            </p>
          </div>
        ) : (
          filteredReminders.map((rem) => {
            const isCompleted = rem.status === 'completed' || rem.status === 'dismissed';
            return (
              <div
                key={rem.id}
                className={`group flex items-start justify-between rounded-xl border p-3 transition-all ${
                  isCompleted
                    ? 'border-slate-800/60 bg-slate-950/40 opacity-60'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Status Toggle Checkbox */}
                  <button
                    onClick={() => {
                      onToggleStatus(rem.id, isCompleted ? 'active' : 'completed');
                      if (!isCompleted) sound.playSuccess();
                    }}
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      isCompleted
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-600 hover:border-amber-400'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                        {rem.title}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${getPriorityColor(rem.priority)}`}>
                        {rem.priority}
                      </span>
                      {rem.recurrence !== 'none' && (
                        <span className="flex items-center gap-0.5 text-[10px] text-cyan-400 font-mono">
                          <RotateCw className="h-2.5 w-2.5" />
                          {rem.recurrence}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-amber-300/90">
                        <Clock className="h-3 w-3" />
                        {rem.time}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {rem.date}
                      </span>
                      <span>•</span>
                      <span className="capitalize text-slate-500">{rem.category}</span>
                    </div>

                    {rem.notes && (
                      <p className="text-[11px] text-slate-400 pl-1 border-l-2 border-slate-700 mt-1">
                        {rem.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  {!isCompleted && (
                    <button
                      onClick={() => onSnooze(rem.id, 15)}
                      title="Snooze 15 minutes"
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[10px] text-slate-300 font-mono transition-colors"
                    >
                      +15m
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteReminder(rem.id)}
                    title="Delete reminder"
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-950/40 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

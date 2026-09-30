import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  AlertTriangle,
  Sparkles,
  Trash2,
  CheckCircle2,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { ScheduleEvent } from '../types/agent';
import { getTodayString } from '../utils/storage';
import { sound } from '../utils/audio';

interface SchedulePlannerProps {
  events: ScheduleEvent[];
  onAddEvent: (event: Omit<ScheduleEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  onAskAgentToPlan: () => void;
  onResolveConflict: (conflictDesc: string) => void;
}

export const SchedulePlanner: React.FC<SchedulePlannerProps> = ({
  events,
  onAddEvent,
  onDeleteEvent,
  onAskAgentToPlan,
  onResolveConflict,
}) => {
  const [selectedDate, setSelectedDate] = useState(() => getTodayString());
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentMinutes, setCurrentMinutes] = useState(0);

  // Form State
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [category, setCategory] = useState<ScheduleEvent['category']>('work');
  const [description, setDescription] = useState('');
  const [isFixed, setIsFixed] = useState(false);

  // Update current time indicator
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const dayEvents = events.filter((e) => e.date === selectedDate);

  // Conflict Detection Algorithm
  const detectConflicts = (evts: ScheduleEvent[]) => {
    const conflicts: { eventA: ScheduleEvent; eventB: ScheduleEvent }[] = [];
    const sorted = [...evts].sort((a, b) => a.startTime.localeCompare(b.startTime));

    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const a = sorted[i];
        const b = sorted[j];
        // Overlap: A starts before B ends AND B starts before A ends
        if (a.startTime < b.endTime && b.startTime < a.endTime) {
          conflicts.push({ eventA: a, eventB: b });
        }
      }
    }
    return conflicts;
  };

  const conflicts = detectConflicts(dayEvents);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;

    onAddEvent({
      title: title.trim(),
      date: selectedDate,
      startTime,
      endTime,
      category,
      description: description.trim() || undefined,
      isFixed,
    });

    setTitle('');
    setDescription('');
    setShowAddModal(false);
    sound.playSuccess();
  };

  const getCategoryStyles = (cat: ScheduleEvent['category']) => {
    switch (cat) {
      case 'focus':
        return 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30';
      case 'meeting':
        return 'bg-cyan-600/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-600/30';
      case 'work':
        return 'bg-violet-600/20 text-violet-300 border-violet-500/40 hover:bg-violet-600/30';
      case 'health':
        return 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30';
      case 'break':
        return 'bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600/30';
      case 'personal':
        return 'bg-rose-600/20 text-rose-300 border-rose-500/40 hover:bg-rose-600/30';
      default:
        return 'bg-slate-700/30 text-slate-300 border-slate-600/40 hover:bg-slate-700/40';
    }
  };

  // Convert HH:MM to minutes from 07:00 (7 AM)
  const START_HOUR = 7;
  const END_HOUR = 22;
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const PIXELS_PER_HOUR = 64; // height in pixels per hour

  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h - START_HOUR) * 60 + m;
  };

  const isToday = selectedDate === getTodayString();
  const currentIndicatorTop = ((currentMinutes - START_HOUR * 60) / 60) * PIXELS_PER_HOUR;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-4 py-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <CalendarIcon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
              Day Schedule & Time-Blocking
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.2 text-[10px] font-bold text-indigo-300">
                {dayEvents.length} blocks
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Dynamic calendar with conflict detection & AI planning</p>
          </div>
        </div>

        {/* Date Selector & Add Block */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 px-2 py-1 text-xs">
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-200">
              {isToday ? 'Today' : selectedDate}
            </span>
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={onAskAgentToPlan}
            className="hidden sm:flex items-center gap-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 px-2.5 py-1 text-xs font-medium text-indigo-300 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Day Plan</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 text-white font-medium px-3 py-1 text-xs hover:bg-indigo-500 transition-all shadow-md shadow-indigo-500/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Conflict Warning Banner */}
      {conflicts.length > 0 && (
        <div className="m-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 animate-pulse" />
            <div>
              <span className="font-semibold text-rose-400">Schedule Conflict Detected: </span>
              <span>
                "{conflicts[0].eventA.title}" ({conflicts[0].eventA.startTime}-{conflicts[0].eventA.endTime}) overlaps with "{conflicts[0].eventB.title}" ({conflicts[0].eventB.startTime}-{conflicts[0].eventB.endTime})
              </span>
            </div>
          </div>
          <button
            onClick={() => onResolveConflict(`Resolve calendar overlap between "${conflicts[0].eventA.title}" and "${conflicts[0].eventB.title}" on ${selectedDate}`)}
            className="shrink-0 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium px-2.5 py-1 text-[11px] shadow transition-all ml-2"
          >
            Resolve with AI
          </button>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <form onSubmit={handleCreateEvent} className="m-3 p-3.5 rounded-xl border border-slate-700 bg-slate-950 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Block Time on Schedule
            </h3>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Cancel
            </button>
          </div>

          <input
            type="text"
            placeholder="Event title (e.g. Deep Work: System Architecture, Client Demo)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Start Time (24h)</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">End Time (24h)</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 capitalize"
              >
                <option value="focus">Deep Focus</option>
                <option value="work">Work Session</option>
                <option value="meeting">Meeting</option>
                <option value="health">Health / Workout</option>
                <option value="break">Break / Lunch</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="isFixedCheck"
                checked={isFixed}
                onChange={(e) => setIsFixed(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isFixedCheck" className="text-xs text-slate-300">
                Fixed (Non-negotiable)
              </label>
            </div>
          </div>

          <input
            type="text"
            placeholder="Description or agenda notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition-all"
            >
              Add to Schedule
            </button>
          </div>
        </form>
      )}

      {/* Visual Timeline Schedule Container */}
      <div className="relative flex-1 overflow-y-auto p-4">
        <div className="relative min-w-[320px]" style={{ height: `${TOTAL_HOURS * PIXELS_PER_HOUR}px` }}>
          {/* Hour markers grid */}
          {Array.from({ length: TOTAL_HOURS + 1 }).map((_, index) => {
            const hour = START_HOUR + index;
            const hourFormatted = `${hour.toString().padStart(2, '0')}:00`;
            const topPos = index * PIXELS_PER_HOUR;

            return (
              <div
                key={hour}
                className="absolute left-0 right-0 flex items-center border-t border-slate-800/60"
                style={{ top: `${topPos}px` }}
              >
                <span className="w-12 pr-2 text-right font-mono text-[10px] text-slate-500 select-none">
                  {hourFormatted}
                </span>
                <div className="flex-1 border-t border-slate-800/30"></div>
              </div>
            );
          })}

          {/* Current Live Time Red Line (if today) */}
          {isToday && currentIndicatorTop >= 0 && currentIndicatorTop <= TOTAL_HOURS * PIXELS_PER_HOUR && (
            <div
              className="absolute left-10 right-0 z-20 flex items-center pointer-events-none"
              style={{ top: `${currentIndicatorTop}px` }}
            >
              <div className="h-2 w-2 rounded-full bg-rose-500 shadow-md shadow-rose-500/50 animate-ping"></div>
              <div className="h-0.5 flex-1 bg-rose-500 shadow-sm shadow-rose-500/50"></div>
              <span className="rounded bg-rose-600 px-1 py-0.2 text-[9px] font-bold text-white shadow ml-1">
                Now
              </span>
            </div>
          )}

          {/* Render Schedule Events */}
          <div className="absolute left-14 right-2 top-0 bottom-0">
            {dayEvents.map((evt) => {
              const startMinutes = timeToMinutes(evt.startTime);
              const endMinutes = timeToMinutes(evt.endTime);
              const durationMinutes = Math.max(30, endMinutes - startMinutes);

              const top = (startMinutes / 60) * PIXELS_PER_HOUR;
              const height = (durationMinutes / 60) * PIXELS_PER_HOUR;

              // Check if this event is involved in a conflict
              const isConflicted = conflicts.some(
                (c) => c.eventA.id === evt.id || c.eventB.id === evt.id
              );

              return (
                <div
                  key={evt.id}
                  style={{ top: `${top}px`, height: `${height - 4}px` }}
                  className={`absolute left-0 right-0 rounded-xl border p-2.5 transition-all shadow-md group ${getCategoryStyles(
                    evt.category
                  )} ${isConflicted ? 'ring-2 ring-rose-500/80 animate-pulse' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-white truncate">
                          {evt.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-900/60 font-mono">
                          {evt.category}
                        </span>
                        {evt.isFixed && (
                          <span className="flex items-center gap-0.5 text-[9px] text-amber-300 font-mono">
                            <ShieldCheck className="h-2.5 w-2.5" />
                            Fixed
                          </span>
                        )}
                        {isConflicted && (
                          <span className="rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-bold px-1">
                            OVERLAP
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-300 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {evt.startTime} - {evt.endTime} ({durationMinutes}m)
                        </span>
                      </div>

                      {evt.description && (
                        <p className="text-[10px] text-slate-300 truncate opacity-80 mt-0.5">
                          {evt.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteEvent(evt.id)}
                      title="Delete event"
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity rounded bg-slate-950/60"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Bell, Clock, CheckCircle2, RotateCw, X } from 'lucide-react';
import { ReminderItem } from '../types/agent';

interface ReminderModalProps {
  reminder: ReminderItem | null;
  onClose: () => void;
  onComplete: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  reminder,
  onClose,
  onComplete,
  onSnooze,
}) => {
  if (!reminder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-amber-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl shadow-amber-500/20 text-center space-y-4">
        {/* Glow indicator */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/30 animate-bounce">
          <Bell className="h-8 w-8" />
        </div>

        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400 font-mono">
            Reminder Alarm Triggered
          </span>
          <h3 className="text-lg font-bold text-white mt-1">{reminder.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Scheduled for <span className="font-mono text-amber-300 font-bold">{reminder.time}</span>
          </p>
        </div>

        {reminder.notes && (
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs text-slate-300 text-left">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Notes:</span>
            {reminder.notes}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => onSnooze(reminder.id, 15)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all"
          >
            <RotateCw className="h-3.5 w-3.5 text-slate-400" />
            <span>Snooze (+15m)</span>
          </button>

          <button
            onClick={() => onComplete(reminder.id)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:opacity-90 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/25 transition-all"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Done / Dismiss</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

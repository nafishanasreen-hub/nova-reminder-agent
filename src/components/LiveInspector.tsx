import React, { useState } from 'react';
import {
  Activity,
  Wrench,
  Cpu,
  Layers,
  CheckCircle2,
  Clock,
  Terminal,
  Database,
  Code2,
  ChevronRight,
  Filter
} from 'lucide-react';
import { AgentToolCall, ReminderItem, ScheduleEvent, TaskItem } from '../types/agent';

interface LiveInspectorProps {
  toolCallsHistory: AgentToolCall[];
  reminders: ReminderItem[];
  events: ScheduleEvent[];
  tasks: TaskItem[];
  currentTone: string;
}

export const LiveInspector: React.FC<LiveInspectorProps> = ({
  toolCallsHistory,
  reminders,
  events,
  tasks,
  currentTone,
}) => {
  const [selectedToolIndex, setSelectedToolIndex] = useState<number>(0);
  const [inspectorSubTab, setInspectorSubTab] = useState<'tools' | 'trace' | 'context'>('trace');

  const REGISTERED_TOOLS = [
    { name: 'createReminder', category: 'Reminders', desc: 'Sets alarms & timed notifications with recurrence & priority' },
    { name: 'manageReminder', category: 'Reminders', desc: 'Updates, snoozes (+15m), or dismisses active reminders' },
    { name: 'createScheduleEvent', category: 'Calendar', desc: 'Time-blocks 24h day calendar with category & fixed status' },
    { name: 'manageScheduleEvent', category: 'Calendar', desc: 'Reschedules or deletes calendar events' },
    { name: 'createTask', category: 'Tasks', desc: 'Creates everyday tasks with subtask checklist & Eisenhower quadrant' },
    { name: 'manageTask', category: 'Tasks', desc: 'Toggles task status, completion, and subtasks' },
    { name: 'batchPlanDay', category: 'Planning', desc: 'Formulates an entire day: events, prioritized tasks, and reminders' },
  ];

  const currentToolCall = toolCallsHistory[selectedToolIndex] || toolCallsHistory[0];

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-6 py-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Agent Live Inspector & DevTools
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            </h2>
            <p className="text-xs text-slate-400">
              Inspect model inferences, tool call payloads, and real-time state mutations
            </p>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setInspectorSubTab('trace')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              inspectorSubTab === 'trace'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tool Invocations ({toolCallsHistory.length})
          </button>
          <button
            onClick={() => setInspectorSubTab('tools')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              inspectorSubTab === 'tools'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Registered Tools ({REGISTERED_TOOLS.length})
          </button>
          <button
            onClick={() => setInspectorSubTab('context')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              inspectorSubTab === 'context'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Perception Context Window
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* TAB 1: Tool Execution Trace */}
        {inspectorSubTab === 'trace' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* List of Recent Calls */}
            <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2 flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-1">
                Execution Audit Log
              </span>
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {toolCallsHistory.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No tools invoked yet. Type a request in the Assistant Workspace (e.g. "Remind me to drink water") to trigger tools!
                  </div>
                ) : (
                  toolCallsHistory.map((call, idx) => (
                    <button
                      key={call.id || idx}
                      onClick={() => setSelectedToolIndex(idx)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all ${
                        selectedToolIndex === idx
                          ? 'border-violet-500/60 bg-violet-950/40 text-white shadow-sm'
                          : 'border-slate-800/80 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <div className="space-y-0.5 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <Wrench className="h-3 w-3 text-violet-400 shrink-0" />
                          <span className="font-mono font-semibold truncate text-[11px]">{call.name}()</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block truncate">
                          {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Selected Tool JSON Inspector */}
            <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-violet-400 font-mono flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Invocation Details: {currentToolCall ? currentToolCall.name : 'None selected'}
                </span>
                {currentToolCall && (
                  <span className="text-[10px] rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 font-mono">
                    STATUS: {currentToolCall.status.toUpperCase()}
                  </span>
                )}
              </div>

              {currentToolCall ? (
                <div className="flex-1 overflow-y-auto space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block mb-1">
                      Arguments Output by Gemini 3.8 Flash (JSON Payload)
                    </span>
                    <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 font-mono text-xs text-cyan-300 overflow-x-auto">
                      <pre>{JSON.stringify(currentToolCall.args, null, 2)}</pre>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block mb-1">
                      Execution Metadata
                    </span>
                    <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 font-mono text-xs text-slate-300 space-y-1">
                      <div><strong className="text-slate-500">Call ID:</strong> {currentToolCall.id}</div>
                      <div><strong className="text-slate-500">Timestamp:</strong> {currentToolCall.timestamp}</div>
                      <div><strong className="text-slate-500">Target Function:</strong> {currentToolCall.name}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                  Select a tool call from the audit log to view arguments payload.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Registered Tools */}
        {inspectorSubTab === 'tools' && (
          <div className="space-y-4 max-w-4xl">
            <p className="text-xs text-slate-400">
              The agent is configured with these 7 function declarations passed into Gemini's <code className="text-cyan-300 font-mono">tools: [{`{ functionDeclarations: [...] }`}]</code> configuration:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {REGISTERED_TOOLS.map((t) => (
                <div key={t.name} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-violet-400">{t.name}()</span>
                    <span className="text-[10px] font-mono rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-slate-400">
                      {t.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Perception Context Window */}
        {inspectorSubTab === 'context' && (
          <div className="space-y-4 max-w-4xl">
            <p className="text-xs text-slate-400">
              On every conversational turn, the server injects this dynamic temporal and state context into the system prompt:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Temporal Anchor</span>
                <div className="text-sm font-bold text-white font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="text-[11px] text-slate-400">{new Date().toISOString().split('T')[0]}</div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Active Reminders In State</span>
                <div className="text-sm font-bold text-amber-400 font-mono">{reminders.filter(r => r.status === 'active').length}</div>
                <div className="text-[11px] text-slate-400">{reminders.length} total stored</div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Schedule & Task State</span>
                <div className="text-sm font-bold text-cyan-400 font-mono">{events.length} Events • {tasks.length} Tasks</div>
                <div className="text-[11px] text-slate-400">Persona tone: {currentTone}</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300">
              <span className="text-slate-500 block mb-2">// Injected State Representation:</span>
              <pre className="text-emerald-400 overflow-x-auto text-[11px]">
{`CURRENT USER STATE:
- Existing Schedule Events Today (${events.length}):
${events.map(e => `  * [${e.startTime} - ${e.endTime}] ${e.title} (${e.category})`).join('\n') || '  (None)'}

- Active Reminders (${reminders.filter(r => r.status === 'active').length}):
${reminders.filter(r => r.status === 'active').map(r => `  * [${r.date} ${r.time}] ${r.title} (priority: ${r.priority})`).join('\n') || '  (None)'}

- Open Tasks (${tasks.filter(t => t.status !== 'completed').length}):
${tasks.filter(t => t.status !== 'completed').map(t => `  * [${t.status}] ${t.title} (priority: ${t.priority})`).join('\n') || '  (None)'}`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bot,
  Calendar,
  Bell,
  CheckSquare,
  Sparkles,
  BookOpen,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { AgentChat } from './components/AgentChat';
import { RemindersPanel } from './components/RemindersPanel';
import { SchedulePlanner } from './components/SchedulePlanner';
import { TaskManager } from './components/TaskManager';
import { DevAcademy } from './components/DevAcademy';
import { LiveInspector } from './components/LiveInspector';
import { ReminderModal } from './components/ReminderModal';
import {
  ReminderItem,
  ScheduleEvent,
  TaskItem,
  AgentMessage,
  AgentToolCall
} from './types/agent';
import {
  loadStoredData,
  saveStoredData,
  resetToSeedData,
  getTodayString,
  getCurrentTimeString
} from './utils/storage';
import { sound } from './utils/audio';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'assistant' | 'academy' | 'inspector'>('assistant');
  const [assistantSubTab, setAssistantSubTab] = useState<'schedule' | 'reminders' | 'tasks'>('schedule');

  // Core Agent Data State
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [tone, setTone] = useState<'balanced' | 'executive' | 'friendly' | 'drill_sergeant'>('balanced');
  const [toolCallsHistory, setToolCallsHistory] = useState<AgentToolCall[]>([]);

  // Interaction State
  const [isProcessing, setIsProcessing] = useState(false);
  const [decomposingTaskId, setDecomposingTaskId] = useState<string | null>(null);
  const [triggeredReminder, setTriggeredReminder] = useState<ReminderItem | null>(null);

  // Initialize data from localStorage or seed
  useEffect(() => {
    const data = loadStoredData();
    setReminders(data.reminders);
    setEvents(data.events);
    setTasks(data.tasks);
    setMessages(data.messages);
    if (['balanced', 'executive', 'friendly', 'drill_sergeant'].includes(data.tone)) {
      setTone(data.tone as any);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    saveStoredData({ reminders, events, tasks, messages, tone });
  }, [reminders, events, tasks, messages, tone]);

  // Real-time Reminder Alarm Watcher
  useEffect(() => {
    const checkReminders = () => {
      const today = getTodayString();
      const nowTime = getCurrentTimeString();

      const due = reminders.find(
        (r) =>
          r.status === 'active' &&
          r.date === today &&
          r.time === nowTime
      );

      if (due && (!triggeredReminder || triggeredReminder.id !== due.id)) {
        setTriggeredReminder(due);
        sound.playChime();
      }
    };

    const interval = setInterval(checkReminders, 15000);
    return () => clearInterval(interval);
  }, [reminders, triggeredReminder]);

  // Tool Calls Dispatcher: processes tools returned from the Gemini Agent
  const dispatchToolCalls = useCallback((toolCalls: AgentToolCall[]) => {
    if (!toolCalls || toolCalls.length === 0) return;

    sound.playSuccess();
    setToolCallsHistory((prev) => [...toolCalls, ...prev]);

    for (const call of toolCalls) {
      const args = call.args || {};

      if (call.name === 'createReminder') {
        const newReminder: ReminderItem = {
          id: 'rem_' + Math.random().toString(36).substring(2, 9),
          title: args.title || 'New Reminder',
          date: args.date || getTodayString(),
          time: args.time || '12:00',
          priority: args.priority || 'medium',
          recurrence: args.recurrence || 'none',
          category: args.category || 'general',
          status: 'active',
          notes: args.notes,
          createdAt: new Date().toISOString(),
        };
        setReminders((prev) => [newReminder, ...prev]);
        setAssistantSubTab('reminders');
      } else if (call.name === 'manageReminder') {
        const action = args.action;
        const targetId = args.reminderId;
        const targetTitle = args.reminderTitle?.toLowerCase();

        setReminders((prev) =>
          prev
            .map((r) => {
              const match = r.id === targetId || (targetTitle && r.title.toLowerCase().includes(targetTitle));
              if (!match) return r;

              if (action === 'complete') return { ...r, status: 'completed' as const };
              if (action === 'snooze') {
                const [h, m] = r.time.split(':').map(Number);
                const snoozeMin = args.snoozeMinutes || 15;
                const newTotalMin = h * 60 + m + snoozeMin;
                const newH = Math.floor(newTotalMin / 60) % 24;
                const newM = newTotalMin % 60;
                return {
                  ...r,
                  time: `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`,
                  status: 'active' as const,
                };
              }
              return r;
            })
            .filter((r) => {
              if (action === 'delete') {
                const match = r.id === targetId || (targetTitle && r.title.toLowerCase().includes(targetTitle));
                return !match;
              }
              return true;
            })
        );
      } else if (call.name === 'createScheduleEvent') {
        const newEvent: ScheduleEvent = {
          id: 'evt_' + Math.random().toString(36).substring(2, 9),
          title: args.title || 'New Event',
          date: args.date || getTodayString(),
          startTime: args.startTime || '10:00',
          endTime: args.endTime || '11:00',
          category: args.category || 'work',
          description: args.description,
          isFixed: Boolean(args.isFixed),
        };
        setEvents((prev) => [...prev, newEvent]);
        setAssistantSubTab('schedule');
      } else if (call.name === 'manageScheduleEvent') {
        const action = args.action;
        const targetId = args.eventId;
        const targetTitle = args.eventTitle?.toLowerCase();

        setEvents((prev) =>
          prev
            .map((e) => {
              const match = e.id === targetId || (targetTitle && e.title.toLowerCase().includes(targetTitle));
              if (!match) return e;

              if (action === 'reschedule') {
                return {
                  ...e,
                  startTime: args.newStartTime || e.startTime,
                  endTime: args.newEndTime || e.endTime,
                  date: args.newDate || e.date,
                };
              }
              return e;
            })
            .filter((e) => {
              if (action === 'delete') {
                const match = e.id === targetId || (targetTitle && e.title.toLowerCase().includes(targetTitle));
                return !match;
              }
              return true;
            })
        );
      } else if (call.name === 'createTask') {
        const subtasks = Array.isArray(args.subtasks)
          ? args.subtasks.map((st: string) => ({
              id: 'sub_' + Math.random().toString(36).substring(2, 7),
              title: st,
              completed: false,
            }))
          : [];

        const newTask: TaskItem = {
          id: 'tsk_' + Math.random().toString(36).substring(2, 9),
          title: args.title || 'New Task',
          priority: args.priority || 'medium',
          quadrant: args.quadrant || (args.priority === 'high' ? 'urgent_important' : 'important_not_urgent'),
          status: 'todo',
          category: args.category || 'work',
          dueDate: args.dueDate || getTodayString(),
          dueTime: args.dueTime,
          estimatedMinutes: args.estimatedMinutes || 30,
          subtasks,
          createdAt: new Date().toISOString(),
        };
        setTasks((prev) => [newTask, ...prev]);
        setAssistantSubTab('tasks');
      } else if (call.name === 'batchPlanDay') {
        const targetDate = args.date || getTodayString();

        if (Array.isArray(args.events)) {
          const newEvents: ScheduleEvent[] = args.events.map((e: any) => ({
            id: 'evt_' + Math.random().toString(36).substring(2, 9),
            title: e.title,
            date: targetDate,
            startTime: e.startTime,
            endTime: e.endTime,
            category: e.category || 'work',
            description: e.description,
          }));
          setEvents((prev) => [...prev.filter((ev) => ev.date !== targetDate), ...newEvents]);
        }

        if (Array.isArray(args.tasks)) {
          const newTasks: TaskItem[] = args.tasks.map((t: any) => ({
            id: 'tsk_' + Math.random().toString(36).substring(2, 9),
            title: t.title,
            priority: t.priority || 'medium',
            status: 'todo',
            category: t.category || 'work',
            dueDate: targetDate,
            estimatedMinutes: t.estimatedMinutes || 45,
            subtasks: Array.isArray(t.subtasks)
              ? t.subtasks.map((st: string) => ({
                  id: 'sub_' + Math.random().toString(36).substring(2, 7),
                  title: st,
                  completed: false,
                }))
              : [],
            createdAt: new Date().toISOString(),
          }));
          setTasks((prev) => [...newTasks, ...prev]);
        }

        if (Array.isArray(args.reminders)) {
          const newReminders: ReminderItem[] = args.reminders.map((r: any) => ({
            id: 'rem_' + Math.random().toString(36).substring(2, 9),
            title: r.title,
            date: targetDate,
            time: r.time,
            priority: r.priority || 'medium',
            recurrence: 'none',
            category: 'general',
            status: 'active',
            createdAt: new Date().toISOString(),
          }));
          setReminders((prev) => [...newReminders, ...prev]);
        }

        setAssistantSubTab('schedule');
      }
    }
  }, []);

  // Send message to Agent via backend endpoint /api/agent/chat
  const handleSendMessage = async (text: string) => {
    const userMsg: AgentMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          tone,
          context: {
            currentDate: getTodayString(),
            currentTime: getCurrentTimeString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            reminders,
            events,
            tasks,
          },
          history: messages.slice(-6),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const agentMsg: AgentMessage = {
        id: 'agt_' + Date.now(),
        sender: 'agent',
        text: data.text || 'I have completed your request.',
        timestamp: new Date().toISOString(),
        reasoning: data.reasoning,
        toolCalls: data.toolCalls,
        appliedActionsSummary: data.appliedActionsSummary,
        suggestions: data.suggestions,
      };

      setMessages((prev) => [...prev, agentMsg]);

      // Execute dispatched tool calls on local state
      if (data.toolCalls && data.toolCalls.length > 0) {
        dispatchToolCalls(data.toolCalls);
      }
    } catch (err: any) {
      console.error('Failed to communicate with agent endpoint:', err);
      // Fallback message
      const errorMsg: AgentMessage = {
        id: 'err_' + Date.now(),
        sender: 'agent',
        text: "I experienced a temporary communication glitch, but your workspace remains active! You can still manage reminders and time blocks directly.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // AI Task Decomposition
  const handleDecomposeTask = async (taskId: string, title: string, category: string) => {
    setDecomposingTaskId(taskId);
    try {
      const response = await fetch('/api/agent/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle: title, taskCategory: category }),
      });

      if (response.ok) {
        const data = await response.json();
        const subtasks = Array.isArray(data.subtasks)
          ? data.subtasks.map((st: string) => ({
              id: 'sub_' + Math.random().toString(36).substring(2, 7),
              title: st,
              completed: false,
            }))
          : [];

        setTasks((prev) =>
          prev.map((t) => {
            if (t.id === taskId) {
              return {
                ...t,
                subtasks,
                estimatedMinutes: data.estimatedMinutes || t.estimatedMinutes,
              };
            }
            return t;
          })
        );
        sound.playSuccess();
      }
    } catch (e) {
      console.error('Decompose task failed', e);
    } finally {
      setDecomposingTaskId(null);
    }
  };

  // Manual CRUD Handlers
  const handleAddReminder = (reminderData: Omit<ReminderItem, 'id' | 'createdAt'>) => {
    const newRem: ReminderItem = {
      ...reminderData,
      id: 'rem_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [newRem, ...prev]);
  };

  const handleToggleReminderStatus = (id: string, newStatus: 'completed' | 'active' | 'dismissed') => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const handleSnoozeReminder = (id: string, minutes: number) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const [h, m] = r.time.split(':').map(Number);
        const newTotal = h * 60 + m + minutes;
        const newH = Math.floor(newTotal / 60) % 24;
        const newM = newTotal % 60;
        return {
          ...r,
          time: `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`,
          status: 'active',
        };
      })
    );
    if (triggeredReminder?.id === id) {
      setTriggeredReminder(null);
    }
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddEvent = (eventData: Omit<ScheduleEvent, 'id'>) => {
    const newEvt: ScheduleEvent = {
      ...eventData,
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
    };
    setEvents((prev) => [...prev, newEvt]);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddTask = (taskData: Omit<TaskItem, 'id' | 'createdAt'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: 'tsk_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTaskStatus = (id: string, status: TaskItem['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubs = t.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        return { ...t, subtasks: updatedSubs };
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-950 font-sans text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeReminders={reminders}
        onResetData={resetToSeedData}
        onOpenQuickPlanner={() => {
          setActiveTab('assistant');
          handleSendMessage('Plan my day today with focused work blocks, meetings, lunch, and a health break.');
        }}
      />

      {/* Main View Area */}
      <main className="flex-1 overflow-hidden p-3 sm:p-5">
        <div className="mx-auto h-full max-w-7xl">
          {/* TAB 1: Assistant Workspace */}
          {activeTab === 'assistant' && (
            <div className="grid h-full grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Conversational AI Agent Chat */}
              <div className="h-full lg:col-span-5 flex flex-col min-h-0">
                <AgentChat
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isProcessing={isProcessing}
                  onClearHistory={() => setMessages([])}
                  tone={tone}
                  onToneChange={setTone}
                  onSelectToolCall={() => {
                    setActiveTab('inspector');
                  }}
                />
              </div>

              {/* Right Column: Interactive Workspace (Schedule / Reminders / Tasks) */}
              <div className="h-full lg:col-span-7 flex flex-col min-h-0">
                {/* Workspace subtab pills */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800">
                    <button
                      onClick={() => setAssistantSubTab('schedule')}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        assistantSubTab === 'schedule'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Calendar & Schedule</span>
                    </button>

                    <button
                      onClick={() => setAssistantSubTab('reminders')}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        assistantSubTab === 'reminders'
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Bell className="h-3.5 w-3.5" />
                      <span>Reminders ({reminders.filter((r) => r.status === 'active').length})</span>
                    </button>

                    <button
                      onClick={() => setAssistantSubTab('tasks')}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        assistantSubTab === 'tasks'
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <CheckSquare className="h-3.5 w-3.5" />
                      <span>Everyday Tasks ({tasks.filter((t) => t.status !== 'completed').length})</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveTab('academy')}
                    className="hidden sm:flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>How to build this agent →</span>
                  </button>
                </div>

                {/* Subtab View */}
                <div className="flex-1 min-h-0">
                  {assistantSubTab === 'schedule' && (
                    <SchedulePlanner
                      events={events}
                      onAddEvent={handleAddEvent}
                      onDeleteEvent={handleDeleteEvent}
                      onAskAgentToPlan={() =>
                        handleSendMessage('Plan my day today with focused work blocks, meetings, lunch, and a health break.')
                      }
                      onResolveConflict={(conflictPrompt) => handleSendMessage(conflictPrompt)}
                    />
                  )}

                  {assistantSubTab === 'reminders' && (
                    <RemindersPanel
                      reminders={reminders}
                      onAddReminder={handleAddReminder}
                      onToggleStatus={handleToggleReminderStatus}
                      onSnooze={handleSnoozeReminder}
                      onDeleteReminder={handleDeleteReminder}
                      onAskAgentToRemind={() =>
                        handleSendMessage('Remind me to review today\'s priorities at 4 PM')
                      }
                    />
                  )}

                  {assistantSubTab === 'tasks' && (
                    <TaskManager
                      tasks={tasks}
                      onAddTask={handleAddTask}
                      onUpdateTaskStatus={handleUpdateTaskStatus}
                      onToggleSubtask={handleToggleSubtask}
                      onDeleteTask={handleDeleteTask}
                      onDecomposeTask={handleDecomposeTask}
                      decomposingTaskId={decomposingTaskId}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Agent Dev Academy */}
          {activeTab === 'academy' && (
            <DevAcademy
              onTestPromptInChat={(prompt) => {
                setActiveTab('assistant');
                handleSendMessage(prompt);
              }}
            />
          )}

          {/* TAB 3: Live Inspector */}
          {activeTab === 'inspector' && (
            <LiveInspector
              toolCallsHistory={toolCallsHistory}
              reminders={reminders}
              events={events}
              tasks={tasks}
              currentTone={tone}
            />
          )}
        </div>
      </main>

      {/* Triggered Alarm / Reminder Popup Modal */}
      <ReminderModal
        reminder={triggeredReminder}
        onClose={() => setTriggeredReminder(null)}
        onComplete={(id) => {
          handleToggleReminderStatus(id, 'completed');
          setTriggeredReminder(null);
        }}
        onSnooze={(id, min) => {
          handleSnoozeReminder(id, min);
          setTriggeredReminder(null);
        }}
      />
    </div>
  );
}

import { ReminderItem, ScheduleEvent, TaskItem, AgentMessage } from '../types/agent';

const STORAGE_KEYS = {
  REMINDERS: 'nova_reminders_v1',
  EVENTS: 'nova_events_v1',
  TASKS: 'nova_tasks_v1',
  MESSAGES: 'nova_messages_v1',
  TONE: 'nova_tone_v1',
  TUTORIAL_STEP: 'nova_tutorial_step_v1',
};

export function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function getCurrentTimeString(): string {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function getDefaultSeedData() {
  const today = getTodayString();
  const [currentH, currentM] = getCurrentTimeString().split(':').map(Number);

  // Time in 15 mins for upcoming reminder demo
  const nextHour = (currentH + 1) % 24;
  const nextReminderTime = `${nextHour.toString().padStart(2, '0')}:00`;

  const seedReminders: ReminderItem[] = [
    {
      id: 'rem_1',
      title: 'Hydrate & drink 500ml water',
      date: today,
      time: nextReminderTime,
      priority: 'medium',
      recurrence: 'daily',
      category: 'health',
      status: 'active',
      notes: 'Maintain energy and focus during afternoon work',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rem_2',
      title: 'Review team pull requests and task priorities',
      date: today,
      time: '16:30',
      priority: 'high',
      recurrence: 'none',
      category: 'work',
      status: 'active',
      notes: 'Unblock frontend and API branches',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rem_3',
      title: 'Evening gym workout & 15-min stretch',
      date: today,
      time: '18:45',
      priority: 'medium',
      recurrence: 'weekdays',
      category: 'health',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ];

  const seedEvents: ScheduleEvent[] = [
    {
      id: 'evt_1',
      title: 'Morning Focus: Agent System Architecture',
      date: today,
      startTime: '09:00',
      endTime: '11:00',
      category: 'focus',
      description: 'Deep work time-block: design tool definitions and state loops',
      isFixed: true,
      color: '#6366f1',
    },
    {
      id: 'evt_2',
      title: 'Engineering Standup & Daily Sync',
      date: today,
      startTime: '11:15',
      endTime: '11:45',
      category: 'meeting',
      description: 'Review sprints, blockers, and agent feature rollout',
      isFixed: true,
      color: '#06b6d4',
    },
    {
      id: 'evt_3',
      title: 'Lunch & Screen-Free Recharge',
      date: today,
      startTime: '12:00',
      endTime: '13:00',
      category: 'break',
      description: 'Healthy meal and quick outdoor walk',
      isFixed: false,
      color: '#10b981',
    },
    {
      id: 'evt_4',
      title: 'Agent Tooling & Testing Lab',
      date: today,
      startTime: '14:00',
      endTime: '16:00',
      category: 'work',
      description: 'Implement reminder notifications and calendar sync tools',
      isFixed: false,
      color: '#8b5cf6',
    },
  ];

  const seedTasks: TaskItem[] = [
    {
      id: 'tsk_1',
      title: 'Build Autonomous Personal Assistant Agent',
      description: 'Complete core tools: reminders, daily planner, and task decomposition',
      priority: 'high',
      quadrant: 'urgent_important',
      status: 'in_progress',
      dueDate: today,
      estimatedMinutes: 90,
      category: 'work',
      subtasks: [
        { id: 'sub_1', title: 'Define tool schemas for reminders, schedule, and tasks', completed: true },
        { id: 'sub_2', title: 'Connect Gemini 3.8 Flash model with system instructions', completed: true },
        { id: 'sub_3', title: 'Create interactive agent dev academy for beginners', completed: true },
        { id: 'sub_4', title: 'Test natural language scheduling & conflict detection', completed: false },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tsk_2',
      title: 'Review quarterly financial budget & cloud expenses',
      description: 'Check Google Cloud and AI Studio usage quotas',
      priority: 'medium',
      quadrant: 'important_not_urgent',
      status: 'todo',
      dueDate: today,
      estimatedMinutes: 45,
      category: 'personal',
      subtasks: [
        { id: 'sub_21', title: 'Export bill summary CSV', completed: false },
        { id: 'sub_22', title: 'Audit model token expenditures', completed: false },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tsk_3',
      title: 'Pick up healthy groceries for dinner',
      priority: 'low',
      quadrant: 'urgent_not_important',
      status: 'todo',
      dueDate: today,
      estimatedMinutes: 30,
      category: 'errand',
      subtasks: [
        { id: 'sub_31', title: 'Fresh vegetables and fruits', completed: false },
        { id: 'sub_32', title: 'Greek yogurt & nuts', completed: false },
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  const seedMessages: AgentMessage[] = [
    {
      id: 'msg_welcome',
      sender: 'agent',
      text: `Hello! I'm **Nova**, your autonomous Personal Assistant Agent.

I'm ready to manage your **reminders**, organize your **calendar schedule**, and break down your **everyday tasks**.

Here is what you can ask me:
• *"Plan my day with 2 deep work blocks, lunch, and a workout"*
• *"Remind me to call the dentist tomorrow at 2 PM"*
• *"Add an urgent task to prepare quarterly slides and break it into subtasks"*
• *"Check if I have any schedule conflicts today"*

You can also switch to the **Agent Dev Academy** tab above anytime to learn step-by-step how I was built!`,
      timestamp: new Date().toISOString(),
      reasoning: 'System initialized. Loaded temporal context and user preferences.',
      suggestions: [
        'Plan my day for maximum productivity',
        'Set a reminder to drink water every 2 hours',
        'Break down a task into actionable subtasks',
      ],
    },
  ];

  return { seedReminders, seedEvents, seedTasks, seedMessages };
}

export function loadStoredData() {
  const { seedReminders, seedEvents, seedTasks, seedMessages } = getDefaultSeedData();

  let reminders = seedReminders;
  let events = seedEvents;
  let tasks = seedTasks;
  let messages = seedMessages;
  let tone = 'balanced';
  let tutorialStep = 1;

  if (typeof window !== 'undefined') {
    try {
      const storedR = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (storedR) reminders = JSON.parse(storedR);

      const storedE = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (storedE) events = JSON.parse(storedE);

      const storedT = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (storedT) tasks = JSON.parse(storedT);

      const storedM = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (storedM) messages = JSON.parse(storedM);

      const storedTone = localStorage.getItem(STORAGE_KEYS.TONE);
      if (storedTone) tone = storedTone;

      const storedStep = localStorage.getItem(STORAGE_KEYS.TUTORIAL_STEP);
      if (storedStep) tutorialStep = parseInt(storedStep, 10);
    } catch (e) {
      console.error('Failed reading from localStorage', e);
    }
  }

  return { reminders, events, tasks, messages, tone, tutorialStep };
}

export function saveStoredData(data: {
  reminders?: ReminderItem[];
  events?: ScheduleEvent[];
  tasks?: TaskItem[];
  messages?: AgentMessage[];
  tone?: string;
  tutorialStep?: number;
}) {
  if (typeof window === 'undefined') return;
  try {
    if (data.reminders) localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(data.reminders));
    if (data.events) localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data.events));
    if (data.tasks) localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks));
    if (data.messages) localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(data.messages));
    if (data.tone) localStorage.setItem(STORAGE_KEYS.TONE, data.tone);
    if (data.tutorialStep) localStorage.setItem(STORAGE_KEYS.TUTORIAL_STEP, data.tutorialStep.toString());
  } catch (e) {
    console.error('Failed saving to localStorage', e);
  }
}

export function resetToSeedData() {
  if (typeof window === 'undefined') return;
  const { seedReminders, seedEvents, seedTasks, seedMessages } = getDefaultSeedData();
  saveStoredData({
    reminders: seedReminders,
    events: seedEvents,
    tasks: seedTasks,
    messages: seedMessages,
    tone: 'balanced',
    tutorialStep: 1,
  });
  window.location.reload();
}

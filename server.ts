import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, type FunctionDeclaration } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Function Declarations for Agent Tools
const reminderTool: FunctionDeclaration = {
  name: 'createReminder',
  description: 'Create a reminder or alarm for the user with target date, time, recurrence, and priority.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'What to remind the user about (e.g. "Take vitamin D", "Client check-in call")' },
      time: { type: Type.STRING, description: '24-hour time string in HH:MM format (e.g. "14:30", "09:00")' },
      date: { type: Type.STRING, description: 'Date in YYYY-MM-DD format, or relative ("today", "tomorrow")' },
      priority: { type: Type.STRING, description: 'Priority level: "high", "medium", or "low"' },
      recurrence: { type: Type.STRING, description: 'Recurrence: "none", "daily", "weekly", "weekdays", or "monthly"' },
      category: { type: Type.STRING, description: 'Category: "health", "work", "meeting", "personal", or "general"' },
      notes: { type: Type.STRING, description: 'Optional additional notes or checklist details' },
    },
    required: ['title', 'time'],
  },
};

const manageReminderTool: FunctionDeclaration = {
  name: 'manageReminder',
  description: 'Update, complete, snooze, or delete an existing reminder.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      reminderId: { type: Type.STRING, description: 'The ID of the reminder if known' },
      reminderTitle: { type: Type.STRING, description: 'The title/phrase matching the reminder if ID is unknown' },
      action: { type: Type.STRING, description: 'Action to perform: "complete", "delete", "snooze"' },
      snoozeMinutes: { type: Type.NUMBER, description: 'Number of minutes to snooze (e.g. 15, 30, 60)' },
    },
    required: ['action'],
  },
};

const scheduleTool: FunctionDeclaration = {
  name: 'createScheduleEvent',
  description: 'Schedule a time-blocked event or calendar appointment on the user schedule.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Event title (e.g. "Deep Work: API Architecture", "Team Sync")' },
      date: { type: Type.STRING, description: 'Date in YYYY-MM-DD format, or "today", "tomorrow"' },
      startTime: { type: Type.STRING, description: 'Start time in 24h format HH:MM (e.g. "10:00")' },
      endTime: { type: Type.STRING, description: 'End time in 24h format HH:MM (e.g. "11:30")' },
      category: { type: Type.STRING, description: 'Event type: "work", "focus", "meeting", "health", "break", "personal"' },
      description: { type: Type.STRING, description: 'Description or notes for the calendar event' },
      isFixed: { type: Type.BOOLEAN, description: 'Whether this event cannot be easily moved (e.g. external meeting)' },
    },
    required: ['title', 'startTime', 'endTime'],
  },
};

const manageScheduleTool: FunctionDeclaration = {
  name: 'manageScheduleEvent',
  description: 'Modify, reschedule, or cancel a calendar schedule event.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      eventId: { type: Type.STRING, description: 'Event ID if known' },
      eventTitle: { type: Type.STRING, description: 'Event title match if ID not known' },
      action: { type: Type.STRING, description: 'Action: "reschedule", "delete", "complete"' },
      newStartTime: { type: Type.STRING, description: 'Updated start time in HH:MM' },
      newEndTime: { type: Type.STRING, description: 'Updated end time in HH:MM' },
      newDate: { type: Type.STRING, description: 'Updated date in YYYY-MM-DD format' },
    },
    required: ['action'],
  },
};

const taskTool: FunctionDeclaration = {
  name: 'createTask',
  description: 'Add a new task or action item with priority, due date, category, and subtasks.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Task title (e.g. "Draft Q3 engineering roadmap")' },
      priority: { type: Type.STRING, description: 'Priority: "high", "medium", or "low"' },
      category: { type: Type.STRING, description: 'Category: "work", "personal", "health", "learning", "errand"' },
      dueDate: { type: Type.STRING, description: 'Due date in YYYY-MM-DD or "today", "tomorrow"' },
      dueTime: { type: Type.STRING, description: 'Due time in HH:MM if applicable' },
      estimatedMinutes: { type: Type.NUMBER, description: 'Estimated time to complete in minutes' },
      subtasks: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'List of step-by-step subtasks breakdown',
      },
      quadrant: {
        type: Type.STRING,
        description: 'Eisenhower quadrant: "urgent_important", "important_not_urgent", "urgent_not_important", "neither"',
      },
    },
    required: ['title'],
  },
};

const manageTaskTool: FunctionDeclaration = {
  name: 'manageTask',
  description: 'Update status, mark complete, delete, or append subtasks to a task.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      taskId: { type: Type.STRING, description: 'Task ID if available' },
      taskTitle: { type: Type.STRING, description: 'Task title or keyword match' },
      action: { type: Type.STRING, description: 'Action: "complete", "in_progress", "todo", "delete", "add_subtask"' },
      newSubtask: { type: Type.STRING, description: 'New subtask title if adding subtask' },
    },
    required: ['action'],
  },
};

const batchPlanDayTool: FunctionDeclaration = {
  name: 'batchPlanDay',
  description: 'Generate or overhaul an entire day plan: time-blocked events, key tasks, and timed reminders simultaneously.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      date: { type: Type.STRING, description: 'Target date YYYY-MM-DD' },
      planSummary: { type: Type.STRING, description: 'High-level synthesis and strategy for the day' },
      events: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            startTime: { type: Type.STRING },
            endTime: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ['title', 'startTime', 'endTime'],
        },
        description: 'Time-blocked calendar entries for the day',
      },
      tasks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            priority: { type: Type.STRING },
            estimatedMinutes: { type: Type.NUMBER },
            category: { type: Type.STRING },
            subtasks: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['title'],
        },
        description: 'Tasks scheduled or prioritized for today',
      },
      reminders: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            time: { type: Type.STRING },
            priority: { type: Type.STRING },
          },
          required: ['title', 'time'],
        },
        description: 'Timed alarms or reminders to keep the user on track',
      },
    },
    required: ['planSummary'],
  },
};

const allTools = [
  {
    functionDeclarations: [
      reminderTool,
      manageReminderTool,
      scheduleTool,
      manageScheduleTool,
      taskTool,
      manageTaskTool,
      batchPlanDayTool,
    ],
  },
];

// Health & Status Check
app.get('/api/agent/status', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
    toolsCount: 7,
  });
});

// Helper for relative date conversions
function resolveRelativeDate(dateStr?: string, referenceDateStr?: string): string {
  const ref = referenceDateStr ? new Date(referenceDateStr) : new Date();
  if (!dateStr || dateStr.toLowerCase() === 'today') {
    return ref.toISOString().split('T')[0];
  }
  if (dateStr.toLowerCase() === 'tomorrow') {
    const tomorrow = new Date(ref);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  return dateStr;
}

// Main Agent Chat & Tool-Calling Endpoint
app.post('/api/agent/chat', async (req, res) => {
  try {
    const {
      message,
      context,
      history = [],
      tone = 'balanced',
    } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const currentDate = context?.currentDate || new Date().toISOString().split('T')[0];
    const currentTime = context?.currentTime || new Date().toTimeString().slice(0, 5);
    const timezone = context?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    const toneInstructions = {
      balanced: 'Polite, proactive, organized, and focused on clear execution.',
      executive: 'Concise, high-efficiency, crisp bullet points, zero fluff.',
      friendly: 'Warm, encouraging, motivating, and empathetic.',
      drill_sergeant: 'Hyper-focused, strict discipline, urging immediate action and zero procrastination.',
    }[tone as 'balanced' | 'executive' | 'friendly' | 'drill_sergeant'] || 'Polite, organized, and proactive.';

    const systemInstruction = `You are "Nova", an autonomous, high-caliber Personal Assistant Agent.
You handle:
1. Timely reminders & alarms (health, habits, meetings, urgent alerts).
2. Time-blocking calendar scheduling & daily planning (resolving overlaps, carving deep work, pacing breaks).
3. Everyday tasks & workflows (action breakdown, subtasks, prioritization).

CURRENT TEMPORAL CONTEXT:
- Today's Date: ${currentDate}
- Current Local Time: ${currentTime}
- Timezone: ${timezone}

CURRENT USER STATE:
- Existing Schedule Events Today (${context?.events?.length || 0}):
${(context?.events || []).map((e: any) => `  * [${e.startTime} - ${e.endTime}] ${e.title} (${e.category}) [ID: ${e.id}]`).join('\n') || '  (None)'}

- Active Reminders (${context?.reminders?.length || 0}):
${(context?.reminders || []).map((r: any) => `  * [${r.date} ${r.time}] ${r.title} (priority: ${r.priority}, status: ${r.status}) [ID: ${r.id}]`).join('\n') || '  (None)'}

- Open Tasks (${context?.tasks?.length || 0}):
${(context?.tasks || []).map((t: any) => `  * [${t.status}] ${t.title} (priority: ${t.priority}, due: ${t.dueDate || 'none'}) [ID: ${t.id}]`).join('\n') || '  (None)'}

AGENT OPERATIONAL PRINCIPLES:
1. ALWAYS use the appropriate tool function (createReminder, createScheduleEvent, createTask, batchPlanDay, etc.) when the user intends to schedule, remind, or task something.
2. If the user asks you to plan a day, schedule their morning, or reorganize their afternoon, call 'batchPlanDay' or multiple 'createScheduleEvent'/'createTask' calls with non-conflicting time slots!
3. Check for schedule overlaps: if the user asks to schedule something during an existing event, mention the conflict politely and adjust or ask.
4. Always provide an encouraging, helpful assistant summary explaining what you did, the rationale behind time selections, and upcoming next actions.
5. Tone: ${toneInstructions}`;

    // If Gemini API is available, call the real SDK
    if (ai) {
      try {
        // Construct conversation contents
        const contents: any[] = [];

        // Include recent history for conversational memory
        for (const h of history.slice(-6)) {
          if (h.sender === 'user') {
            contents.push({ role: 'user', parts: [{ text: h.text }] });
          } else if (h.sender === 'agent') {
            contents.push({ role: 'model', parts: [{ text: h.text }] });
          }
        }

        // Add current user message
        contents.push({ role: 'user', parts: [{ text: message }] });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.4,
            tools: allTools,
          },
        });

        const rawText = response.text || '';
        const functionCalls = response.functionCalls || [];

        // Normalize function calls and prepare action payloads for frontend execution
        const executedTools: any[] = [];
        const appliedActionsSummary: string[] = [];

        for (const fc of functionCalls) {
          const args = { ...fc.args } as Record<string, any>;

          // Normalize relative dates
          if (args.date) {
            args.date = resolveRelativeDate(args.date, currentDate);
          }
          if (args.dueDate) {
            args.dueDate = resolveRelativeDate(args.dueDate, currentDate);
          }
          if (args.newDate) {
            args.newDate = resolveRelativeDate(args.newDate, currentDate);
          }

          // Build human-friendly summary
          if (fc.name === 'createReminder') {
            appliedActionsSummary.push(`Set reminder "${args.title}" for ${args.time || 'today'}`);
          } else if (fc.name === 'createScheduleEvent') {
            appliedActionsSummary.push(`Scheduled "${args.title}" at ${args.startTime} - ${args.endTime}`);
          } else if (fc.name === 'createTask') {
            appliedActionsSummary.push(`Created task "${args.title}" with priority ${args.priority || 'medium'}`);
          } else if (fc.name === 'batchPlanDay') {
            appliedActionsSummary.push(`Generated comprehensive day plan for ${args.date || 'today'}`);
          } else if (fc.name === 'manageReminder') {
            appliedActionsSummary.push(`${args.action} reminder ${args.reminderTitle || args.reminderId || ''}`);
          } else if (fc.name === 'manageTask') {
            appliedActionsSummary.push(`${args.action} task ${args.taskTitle || args.taskId || ''}`);
          } else if (fc.name === 'manageScheduleEvent') {
            appliedActionsSummary.push(`${args.action} event ${args.eventTitle || args.eventId || ''}`);
          }

          executedTools.push({
            id: 'call_' + Math.random().toString(36).substring(2, 9),
            name: fc.name,
            args,
            status: 'success',
            timestamp: new Date().toISOString(),
          });
        }

        let agentReply = rawText.trim();
        if (!agentReply && executedTools.length > 0) {
          agentReply = `I've handled that for you! Here is what was updated:\n` +
            appliedActionsSummary.map((s) => `• ${s}`).join('\n');
        } else if (!agentReply) {
          agentReply = "I'm ready to help you organize your reminders, day planning, and tasks. What would you like to plan?";
        }

        res.json({
          text: agentReply,
          reasoning: `Analyzed query against current time (${currentTime}) and agenda. Detected ${executedTools.length} autonomous tool invocations.`,
          toolCalls: executedTools,
          appliedActionsSummary,
          suggestions: generateSmartFollowups(message, executedTools),
        });
        return;
      } catch (geminiError: any) {
        console.error('Gemini API call failed, falling back to heuristic engine:', geminiError?.message || geminiError);
        // Fall back gracefully to local heuristic assistant engine
      }
    }

    // Heuristic Engine Fallback (ensures 100% functionality even when offline or before API key setup)
    const fallbackResult = runHeuristicAgent(message, currentDate, currentTime, context);
    res.json(fallbackResult);
  } catch (err: any) {
    console.error('Agent chat endpoint error:', err);
    res.status(500).json({ error: 'Failed to process agent request', details: err?.message });
  }
});

// Task Decomposition endpoint
app.post('/api/agent/decompose', async (req, res) => {
  try {
    const { taskTitle, taskCategory = 'work' } = req.body;
    if (!taskTitle) {
      res.status(400).json({ error: 'taskTitle is required' });
      return;
    }

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Break down this task into 3 to 5 clear, actionable sequential subtasks. Return ONLY a JSON object with:
{
  "subtasks": ["subtask 1", "subtask 2", "subtask 3"],
  "estimatedMinutes": 60,
  "recommendedPriority": "medium"
}
Task: "${taskTitle}" (Category: ${taskCategory})`,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        res.json(parsed);
        return;
      } catch (err) {
        console.error('Decompose API error, falling back:', err);
      }
    }

    // Heuristic breakdown
    res.json({
      subtasks: [
        `Outline goals & requirements for ${taskTitle}`,
        `Draft core execution steps & resources`,
        `Review, test, and finalize deliverables`,
        `Follow up or archive results`,
      ],
      estimatedMinutes: 45,
      recommendedPriority: 'medium',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Smart Follow-up Suggestions
function generateSmartFollowups(userMessage: string, tools: any[]): string[] {
  const lower = userMessage.toLowerCase();
  if (lower.includes('remind') || tools.some((t) => t.name === 'createReminder')) {
    return [
      'Show my active reminders',
      'Plan a 30-minute break after that',
      'Remind me again in 2 hours',
    ];
  }
  if (lower.includes('schedule') || lower.includes('plan') || tools.some((t) => t.name === 'batchPlanDay')) {
    return [
      'Check for calendar overlaps',
      'Block 1 hour for deep work this afternoon',
      'Add a reminder 10 minutes before each meeting',
    ];
  }
  if (lower.includes('task')) {
    return [
      'Break this task down into subtasks',
      'Schedule a focus block for this task today',
      'Show urgent tasks',
    ];
  }
  return [
    'Plan my day for maximum productivity',
    'Set a water reminder every 2 hours',
    'Add an urgent task to finish client proposal',
  ];
}

// Fallback Heuristic Agent for offline / sandbox testing
function runHeuristicAgent(message: string, currentDate: string, currentTime: string, context: any) {
  const lower = message.toLowerCase();
  const executedTools: any[] = [];
  const appliedActionsSummary: string[] = [];
  let reply = '';

  // Time detection regex (e.g. 14:00, 2pm, 9:30 am, 10 am)
  const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  let resolvedTime = '10:00';
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? timeMatch[2] : '00';
    const modifier = timeMatch[3] ? timeMatch[3].toLowerCase() : null;
    if (modifier === 'pm' && hour < 12) hour += 12;
    if (modifier === 'am' && hour === 12) hour = 0;
    resolvedTime = `${hour.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
  }

  // 1. Reminder Intent
  if (lower.includes('remind') || lower.includes('alarm') || lower.includes('notify me')) {
    let title = message
      .replace(/remind me to/i, '')
      .replace(/remind me/i, '')
      .replace(/at \d{1,2}(?::\d{2})?\s*(am|pm)?/i, '')
      .replace(/tomorrow/i, '')
      .replace(/today/i, '')
      .trim();
    if (!title) title = 'Important Reminder';

    const isTomorrow = lower.includes('tomorrow');
    const targetDate = resolveRelativeDate(isTomorrow ? 'tomorrow' : 'today', currentDate);

    executedTools.push({
      id: 'h_rem_' + Date.now(),
      name: 'createReminder',
      args: {
        title: title.charAt(0).toUpperCase() + title.slice(1),
        time: resolvedTime,
        date: targetDate,
        priority: lower.includes('urgent') || lower.includes('important') ? 'high' : 'medium',
        recurrence: lower.includes('every day') || lower.includes('daily') ? 'daily' : 'none',
        category: lower.includes('health') || lower.includes('water') || lower.includes('medicine') ? 'health' : 'general',
      },
      status: 'success',
      timestamp: new Date().toISOString(),
    });
    appliedActionsSummary.push(`Set reminder "${title}" for ${targetDate} at ${resolvedTime}`);
    reply = `I have set a reminder for you: **"${title}"** scheduled for **${targetDate} at ${resolvedTime}**. I'll make sure you don't miss it!`;
  }
  // 2. Schedule Event Intent
  else if (lower.includes('schedule') || lower.includes('meeting') || lower.includes('block') || lower.includes('appointment')) {
    let eventTitle = message
      .replace(/schedule (a |an )?/i, '')
      .replace(/at \d{1,2}(?::\d{2})?\s*(am|pm)?/i, '')
      .trim();
    if (!eventTitle) eventTitle = 'Focus Block';

    const [h, m] = resolvedTime.split(':').map(Number);
    const endHour = (h + 1).toString().padStart(2, '0');
    const endTime = `${endHour}:${m.toString().padStart(2, '0')}`;

    executedTools.push({
      id: 'h_sch_' + Date.now(),
      name: 'createScheduleEvent',
      args: {
        title: eventTitle.charAt(0).toUpperCase() + eventTitle.slice(1),
        date: currentDate,
        startTime: resolvedTime,
        endTime,
        category: lower.includes('gym') || lower.includes('workout') ? 'health' : lower.includes('meet') ? 'meeting' : 'work',
        description: 'Scheduled via Nova assistant agent',
      },
      status: 'success',
      timestamp: new Date().toISOString(),
    });
    appliedActionsSummary.push(`Scheduled "${eventTitle}" from ${resolvedTime} to ${endTime}`);
    reply = `I've added **"${eventTitle}"** to your calendar schedule today from **${resolvedTime} to ${endTime}**.`;
  }
  // 3. Batch Plan Day Intent
  else if (lower.includes('plan my day') || lower.includes('daily plan') || lower.includes('plan today')) {
    executedTools.push({
      id: 'h_plan_' + Date.now(),
      name: 'batchPlanDay',
      args: {
        date: currentDate,
        planSummary: 'Optimal balanced day with deep work blocks, recovery breaks, and key goal progression.',
        events: [
          { title: 'Morning Focus & Deep Work', startTime: '09:00', endTime: '11:00', category: 'focus', description: 'Tackle top priority initiative' },
          { title: 'Team Sync & Communications', startTime: '11:15', endTime: '12:00', category: 'meeting', description: 'Inbox zero and client replies' },
          { title: 'Healthy Lunch & Walk', startTime: '12:00', endTime: '13:00', category: 'health', description: 'Rest and recharge' },
          { title: 'Afternoon Execution & Build', startTime: '13:30', endTime: '15:30', category: 'work', description: 'Implementation and deliverables' },
          { title: 'Day Wrap-Up & Reflection', startTime: '16:30', endTime: '17:00', category: 'personal', description: 'Review finished tasks and plan tomorrow' },
        ],
        tasks: [
          { title: 'Complete highest-impact project task', priority: 'high', estimatedMinutes: 90, category: 'work' },
          { title: 'Review outstanding messages and emails', priority: 'medium', estimatedMinutes: 30, category: 'work' },
          { title: 'Daily workout or 20-min cardio', priority: 'high', estimatedMinutes: 45, category: 'health' },
        ],
        reminders: [
          { title: 'Hydrate & drink water', time: '10:30', priority: 'medium' },
          { title: 'Take afternoon stretch break', time: '14:30', priority: 'medium' },
        ],
      },
      status: 'success',
      timestamp: new Date().toISOString(),
    });
    appliedActionsSummary.push(`Formulated full day plan for ${currentDate} with 5 time blocks, 3 tasks, and 2 reminders`);
    reply = `I have structured your day with a focused, high-energy schedule! You have designated deep work blocks, scheduled breaks for mental stamina, and prioritized tasks.`;
  }
  // 4. Task Intent
  else if (lower.includes('task') || lower.includes('todo') || lower.includes('to do') || lower.includes('add ')) {
    let taskTitle = message
      .replace(/add task/i, '')
      .replace(/add a task to/i, '')
      .replace(/add /i, '')
      .trim();
    if (!taskTitle) taskTitle = 'New Everyday Task';

    executedTools.push({
      id: 'h_tsk_' + Date.now(),
      name: 'createTask',
      args: {
        title: taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1),
        priority: lower.includes('urgent') ? 'high' : 'medium',
        dueDate: currentDate,
        category: lower.includes('buy') || lower.includes('grocery') ? 'errand' : 'work',
        estimatedMinutes: 30,
        subtasks: ['Clarify requirements', 'Execute core work', 'Verify completion'],
      },
      status: 'success',
      timestamp: new Date().toISOString(),
    });
    appliedActionsSummary.push(`Added task "${taskTitle}" with subtasks`);
    reply = `Added **"${taskTitle}"** to your task list with step-by-step subtasks and priority tracking.`;
  }
  // Default conversational response
  else {
    reply = `Hello! I am **Nova**, your personal assistant agent. I can manage your reminders, block your calendar, prioritize everyday tasks, or design a complete day plan. You can tell me things like:
• *"Remind me to drink water at 11 AM"*
• *"Schedule a 1-hour project review at 2 PM"*
• *"Plan my day for maximum productivity"*
• *"Add a task to prepare the quarterly report with subtasks"*`;
  }

  return {
    text: reply,
    reasoning: 'Autonomous heuristic engine parsed intent, parameters, and time entities.',
    toolCalls: executedTools,
    appliedActionsSummary,
    suggestions: generateSmartFollowups(message, executedTools),
  };
}

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

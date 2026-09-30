import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  ArrowRight,
  Sparkles,
  Wrench,
  Terminal,
  Copy,
  Check,
  Play,
  Lightbulb,
  FileCode,
  ShieldAlert,
  Clock,
  Layers
} from 'lucide-react';
import { sound } from '../utils/audio';

interface DevAcademyProps {
  onTestPromptInChat: (prompt: string) => void;
}

export const DevAcademy: React.FC<DevAcademyProps> = ({ onTestPromptInChat }) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedToolDoc, setSelectedToolDoc] = useState<'reminder' | 'schedule' | 'task'>('reminder');

  const copyBlueprint = () => {
    navigator.clipboard.writeText(MINIMAL_AGENT_CODE);
    setCopiedCode(true);
    sound.playSuccess();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const STEPS = [
    { id: 1, title: 'Core Mental Model', subtitle: 'Chatbot vs Autonomous Agent' },
    { id: 2, title: 'Defining Tools (Schemas)', subtitle: 'Giving the LLM hands & feet' },
    { id: 3, title: 'System Prompt & Context', subtitle: 'Temporal anchoring & state injection' },
    { id: 4, title: 'The Execution Loop', subtitle: 'Dispatching tool calls in code' },
    { id: 5, title: 'Conflict & Reasoning', subtitle: 'Smart scheduling & subtasks' },
    { id: 6, title: 'Complete Code Blueprint', subtitle: 'Run your own agent in 5 mins' },
  ];

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-xl">
      {/* Header */}
      <div className="border-b border-slate-800/80 bg-slate-900/90 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Agent Development Academy
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-500/30">
                  Zero to Hero Guide
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Step-by-step masterclass: learn how to architect, prompt, and code an autonomous AI Agent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Step {activeStep} of 6:</span>
            <span className="font-semibold text-cyan-400">{STEPS[activeStep - 1].title}</span>
          </div>
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
          {STEPS.map((step) => {
            const isCurrent = activeStep === step.id;
            const isPassed = activeStep > step.id;

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`flex flex-col text-left p-2 rounded-xl border transition-all text-xs ${
                  isCurrent
                    ? 'border-cyan-500/60 bg-cyan-950/40 text-cyan-200 shadow-md shadow-cyan-500/10'
                    : isPassed
                    ? 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                    : 'border-slate-800/60 bg-slate-950/40 text-slate-500 hover:text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold">0{step.id}</span>
                  {isPassed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                  ) : isCurrent ? (
                    <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></div>
                  ) : null}
                </div>
                <span className="font-semibold truncate mt-1 text-[11px]">{step.title}</span>
                <span className="text-[10px] opacity-70 truncate">{step.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* STEP 1: The Core Mental Model */}
        {activeStep === 1 && (
          <div className="space-y-6 max-w-4xl">
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-slate-900 to-slate-950 p-5 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 font-mono">
                Fundamental Concept
              </span>
              <h3 className="text-lg font-bold text-white">
                What is the difference between a Simple Chatbot and an AI Agent?
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                A simple chatbot just replies with text: you say <em>"Remind me to drink water"</em>, and it responds <em>"Sure, I'll remind you!"</em> but nothing actually happens. No timer starts, no notification is set, and no database is changed.
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                An <strong className="text-cyan-300">AI Agent</strong> is an autonomous system that uses an LLM as its reasoning engine to <strong>perceive its environment</strong>, <strong>decide on actions</strong>, and <strong>call real code tools</strong> to modify the real world (e.g. database, reminders, calendars).
              </p>
            </div>

            {/* The 5 Pillars of an Agent */}
            <div>
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                The 5 Pillars of Every AI Agent Architecture
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                    <Clock className="h-4 w-4" />
                    <span>1. Perception (Context Injection)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    The agent must know what time it is right now, today's date, what tasks currently exist, and user preferences. Without perception, it cannot tell if "tomorrow at 3 PM" is Friday or Monday.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                    <Cpu className="h-4 w-4" />
                    <span>2. The Brain (Reasoning LLM)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    A modern multimodal reasoning model like <code className="text-cyan-300">gemini-3.8-flash</code> that interprets the user's intent, identifies dependencies, and chooses which tool to invoke.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold">
                    <Wrench className="h-4 w-4" />
                    <span>3. Tools / Hands (Function Declarations)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Predefined capabilities exposed as JSON schemas: <code className="text-amber-300">createReminder()</code>, <code className="text-amber-300">createScheduleEvent()</code>, <code className="text-amber-300">createTask()</code>.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Database className="h-4 w-4" />
                    <span>4. Memory & State</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Working state (reminders list, calendar events) and conversational history. Changes made by tools update the state store immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Flow Diagram */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                The Autonomous Agent Loop (How It Operates in Real Time)
              </h4>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs pt-2">
                <div className="flex-1 w-full rounded-xl bg-slate-900 border border-slate-700/80 p-3 text-center space-y-1">
                  <span className="font-bold text-indigo-400">1. User Request</span>
                  <p className="text-[10px] text-slate-400">"Remind me to drink water at 2pm"</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 shrink-0 rotate-90 sm:rotate-0" />

                <div className="flex-1 w-full rounded-xl bg-slate-900 border border-slate-700/80 p-3 text-center space-y-1">
                  <span className="font-bold text-cyan-400">2. Context + Prompt</span>
                  <p className="text-[10px] text-slate-400">Injects current time + active reminders</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 shrink-0 rotate-90 sm:rotate-0" />

                <div className="flex-1 w-full rounded-xl bg-slate-900 border border-slate-700/80 p-3 text-center space-y-1">
                  <span className="font-bold text-amber-400">3. Tool Call Output</span>
                  <p className="text-[10px] text-slate-400">Gemini outputs createReminder(14:00)</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 shrink-0 rotate-90 sm:rotate-0" />

                <div className="flex-1 w-full rounded-xl bg-slate-900 border border-slate-700/80 p-3 text-center space-y-1">
                  <span className="font-bold text-emerald-400">4. Execution & UI</span>
                  <p className="text-[10px] text-slate-400">Timer saved, chime plays, user alerted</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveStep(2)}
                className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-2 text-xs shadow-md shadow-cyan-500/20 transition-all"
              >
                <span>Continue to Step 2: Defining Tools</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Defining Tools (Schemas) */}
        {activeStep === 2 && (
          <div className="space-y-6 max-w-4xl">
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-950 p-5 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 font-mono">
                Function Calling Mechanics
              </span>
              <h3 className="text-lg font-bold text-white">
                How does the AI actually "call a function"?
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                A common misconception is that the LLM executes JavaScript or Python code directly. It does <strong>not</strong>!
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                Instead, you tell the model: <em>"Here is a function named <code className="text-amber-300">createReminder</code> that takes <code className="text-amber-300">title</code> and <code className="text-amber-300">time</code>."</em> When the user asks for a reminder, Gemini emits a structured JSON object with those arguments. <strong>Your server or frontend executes the actual code!</strong>
              </p>
            </div>

            {/* Interactive Schema Selector */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Inspect Real Agent Tool Declarations (SDK Syntax)
                </h4>
                <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs">
                  {(['reminder', 'schedule', 'task'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedToolDoc(t)}
                      className={`px-3 py-1 rounded-md capitalize font-mono text-[11px] transition-all ${
                        selectedToolDoc === t
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t}Tool
                    </button>
                  ))}
                </div>
              </div>

              {/* Code display of selected tool */}
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 font-mono text-xs overflow-x-auto">
                <pre className="text-slate-200 leading-relaxed">
                  {selectedToolDoc === 'reminder' && `const reminderTool: FunctionDeclaration = {
  name: 'createReminder',
  description: 'Create a timed reminder or alarm for the user.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'What to remind the user about' },
      time: { type: Type.STRING, description: '24-hour time HH:MM (e.g. 14:30)' },
      date: { type: Type.STRING, description: 'YYYY-MM-DD, or "today", "tomorrow"' },
      priority: { type: Type.STRING, description: '"high" | "medium" | "low"' },
      recurrence: { type: Type.STRING, description: '"none" | "daily" | "weekly"' }
    },
    required: ['title', 'time']
  }
};`}
                  {selectedToolDoc === 'schedule' && `const scheduleTool: FunctionDeclaration = {
  name: 'createScheduleEvent',
  description: 'Schedule a time-blocked event or calendar appointment.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Event title (e.g. Deep Work)' },
      startTime: { type: Type.STRING, description: 'Start time in 24h format HH:MM' },
      endTime: { type: Type.STRING, description: 'End time in 24h format HH:MM' },
      category: { type: Type.STRING, description: '"focus"|"meeting"|"work"|"break"' },
      isFixed: { type: Type.BOOLEAN, description: 'Whether event cannot be moved' }
    },
    required: ['title', 'startTime', 'endTime']
  }
};`}
                  {selectedToolDoc === 'task' && `const taskTool: FunctionDeclaration = {
  name: 'createTask',
  description: 'Add a new task or action item with priority and subtasks.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Action item title' },
      priority: { type: Type.STRING, description: '"high" | "medium" | "low"' },
      estimatedMinutes: { type: Type.NUMBER, description: 'Duration in minutes' },
      subtasks: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Sequential subtask checklist'
      }
    },
    required: ['title']
  }
};`}
                </pre>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                <Lightbulb className="h-4 w-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Developer Tip:</strong> Write clear, descriptive <code className="text-amber-300">description</code> fields. The LLM reads your descriptions to decide which tool to pick and how to format the arguments!
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setActiveStep(1)}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2"
              >
                ← Back
              </button>
              <button
                onClick={() => setActiveStep(3)}
                className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 text-xs shadow-md shadow-amber-500/20 transition-all"
              >
                <span>Continue to Step 3: System Prompt</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: System Prompt & Context */}
        {activeStep === 3 && (
          <div className="space-y-6 max-w-4xl">
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-slate-900 to-slate-950 p-5 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 font-mono">
                System Prompt Engineering
              </span>
              <h3 className="text-lg font-bold text-white">
                Temporal Anchoring & Dynamic Context Injection
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                By default, an LLM has no clock. If a user asks <em>"What do I have next?"</em> or <em>"Remind me in 30 minutes"</em>, the LLM will fail unless you anchor it with the current date, time, and active calendar state.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                How Nova's System Prompt is Dynamically Constructed
              </h4>

              <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 font-mono text-xs text-slate-300 space-y-3">
                <div className="text-indigo-400 font-bold">// 1. Role & Identity Definition</div>
                <div className="pl-4 text-slate-400">
                  You are "Nova", an autonomous Personal Assistant Agent.<br/>
                  You handle reminders, time-blocking calendars, and tasks.
                </div>

                <div className="text-indigo-400 font-bold">// 2. Dynamic Temporal Anchor (Injected on every request!)</div>
                <div className="pl-4 text-emerald-400">
                  CURRENT TEMPORAL CONTEXT:<br/>
                  - Today's Date: {new Date().toISOString().split('T')[0]}<br/>
                  - Current Local Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br/>
                  - Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </div>

                <div className="text-indigo-400 font-bold">// 3. Working Memory & State</div>
                <div className="pl-4 text-cyan-300">
                  EXISTING SCHEDULE BLOCKS:<br/>
                  - [09:00 - 11:00] Deep Work: System Architecture<br/>
                  - [11:15 - 11:45] Engineering Standup<br/>
                  <br/>
                  ACTIVE REMINDERS:<br/>
                  - [14:00] Hydrate & drink 500ml water
                </div>

                <div className="text-indigo-400 font-bold">// 4. Operational Directives</div>
                <div className="pl-4 text-slate-400">
                  - Check for schedule overlaps before creating an event.<br/>
                  - Always invoke the corresponding tool function.<br/>
                  - Provide clear rationale for time allocation.
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => onTestPromptInChat('What does my schedule look like today and what is my next reminder?')}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 px-3 py-1.5 text-xs font-medium text-indigo-300 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Test Temporal Prompt in Chat</span>
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setActiveStep(2)}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2"
              >
                ← Back
              </button>
              <button
                onClick={() => setActiveStep(4)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 text-xs shadow-md shadow-indigo-500/20 transition-all"
              >
                <span>Continue to Step 4: The Execution Loop</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: The Execution Loop */}
        {activeStep === 4 && (
          <div className="space-y-6 max-w-4xl">
            <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/20 via-slate-900 to-slate-950 p-5 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 font-mono">
                Server-Side Dispatch Architecture
              </span>
              <h3 className="text-lg font-bold text-white">
                How the Dispatcher Processes Tool Calls
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                When Gemini finishes reasoning, <code className="text-violet-300">response.functionCalls</code> will contain any tools the model decided to invoke. Here is the exact TypeScript dispatch pattern:
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 font-mono text-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-400 border-b border-slate-800 pb-2">
                <Terminal className="h-4 w-4 text-violet-400" />
                <span>server.ts (Dispatch Pattern)</span>
              </div>
              <pre className="text-slate-300 leading-relaxed overflow-x-auto">
{`const response = await ai.models.generateContent({
  model: 'gemini-3.8-flash',
  contents: userMessage,
  config: {
    systemInstruction,
    tools: allTools, // Your function declarations array
  }
});

// Check if the agent decided to invoke any tools
const functionCalls = response.functionCalls || [];

for (const call of functionCalls) {
  if (call.name === 'createReminder') {
    // 1. Extract arguments returned by the model
    const { title, time, priority } = call.args;
    
    // 2. Execute local code or save to database
    database.saveReminder({ title, time, priority });
    
  } else if (call.name === 'createScheduleEvent') {
    const { title, startTime, endTime } = call.args;
    database.saveEvent({ title, startTime, endTime });
  }
}

// 3. Return the natural language answer + tool confirmation to client
res.json({
  text: response.text,
  toolCalls: functionCalls
});`}
              </pre>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setActiveStep(3)}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2"
              >
                ← Back
              </button>
              <button
                onClick={() => setActiveStep(5)}
                className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 py-2 text-xs shadow-md shadow-violet-500/20 transition-all"
              >
                <span>Continue to Step 5: Conflict & Reasoning</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Conflict Detection & Reasoning */}
        {activeStep === 5 && (
          <div className="space-y-6 max-w-4xl">
            <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-slate-900 to-slate-950 p-5 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 font-mono">
                Advanced Agent Logic
              </span>
              <h3 className="text-lg font-bold text-white">
                Conflict Resolution & Task Decomposition
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                A great personal assistant doesn't blindly create meetings over existing meetings. It evaluates temporal overlap and breaks overwhelming goals into subtasks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <span className="font-bold text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" />
                  1. The Overlap Detection Formula
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Two time intervals [A_start, A_end] and [B_start, B_end] overlap if and only if:
                </p>
                <div className="rounded-lg bg-slate-900 p-2.5 font-mono text-[11px] text-cyan-300 border border-slate-800">
                  A_start &lt; B_end && B_start &lt; A_end
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Nova runs this check on every schedule change. If an overlap occurs, Nova flags it in red and offers to shift non-fixed meetings.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  2. Automated Task Decomposition
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Humans procrastinate on vague tasks like <em>"File taxes"</em> or <em>"Launch app"</em>.
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  When you give Nova a task, it invokes the decomposition endpoint to generate 3 to 5 micro-steps with estimated time, converting hesitation into momentum!
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setActiveStep(4)}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2"
              >
                ← Back
              </button>
              <button
                onClick={() => setActiveStep(6)}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 text-xs shadow-md shadow-emerald-500/20 transition-all"
              >
                <span>Continue to Step 6: Runnable Code Blueprint</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Complete Runnable Code Blueprint */}
        {activeStep === 6 && (
          <div className="space-y-6 max-w-4xl">
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-950 p-5 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">
                Ready-to-Run Blueprint
              </span>
              <h3 className="text-lg font-bold text-white">
                Build Your Own Agent From Scratch in 5 Minutes!
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Here is a standalone, single-file TypeScript script that you can copy, paste into any Node.js project, and run directly. It implements the complete agent perception-reasoning-action loop!
              </p>
            </div>

            {/* Quick Setup Instructions */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
              <h4 className="font-bold text-slate-200 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                Quick Terminal Setup Commands:
              </h4>
              <div className="rounded-lg bg-slate-900 p-2.5 font-mono text-[11px] text-emerald-400 border border-slate-800 space-y-1">
                <div>mkdir my-ai-agent && cd my-ai-agent</div>
                <div>npm init -y</div>
                <div>npm install @google/genai dotenv tsx typescript</div>
                <div>npx tsx minimal-agent.ts</div>
              </div>
            </div>

            {/* Code Block with Copy Button */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-2.5 text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-mono">
                  <FileCode className="h-4 w-4 text-emerald-400" />
                  <span>minimal-agent.ts</span>
                </div>
                <button
                  onClick={copyBlueprint}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1 text-xs shadow-md transition-all"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-[480px]">
                <pre>{MINIMAL_AGENT_CODE}</pre>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setActiveStep(5)}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2"
              >
                ← Back
              </button>
              <button
                onClick={() => setActiveStep(1)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-300 hover:text-white transition-all"
              >
                <span>Restart Academy Course</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MINIMAL_AGENT_CODE = `import { GoogleGenAI, Type, type FunctionDeclaration } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// 1. Initialize Gemini with modern GoogleGenAI SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

// 2. Define your agent's tools (Function Declarations)
const reminderTool: FunctionDeclaration = {
  name: 'createReminder',
  description: 'Create a reminder or alarm for the user.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'What to remind the user about' },
      time: { type: Type.STRING, description: 'Time in HH:MM format (e.g. 15:00)' },
      priority: { type: Type.STRING, description: '"high" | "medium" | "low"' }
    },
    required: ['title', 'time']
  }
};

// 3. Execution Function (What your code runs when the AI calls the tool)
function executeCreateReminder(args: { title: string; time: string; priority?: string }) {
  console.log(\`🔔 [ACTION EXECUTED] Reminder set: "\${args.title}" at \${args.time} (Priority: \${args.priority || 'normal'})\`);
  return { status: 'success', reminderId: 'rem_' + Date.now() };
}

// 4. The Agent Loop
async function runPersonalAssistant(userQuery: string) {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const today = new Date().toISOString().split('T')[0];

  console.log(\`\\n👤 User: "\${userQuery}"\`);

  // Anchor temporal awareness in systemInstruction
  const systemInstruction = \`You are an autonomous Personal Assistant Agent.
Current Date: \${today}
Current Time: \${currentTime}
Always call the createReminder tool when the user asks for reminders or alarms.\`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: userQuery,
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: [reminderTool] }]
    }
  });

  // Check if Gemini decided to invoke a tool
  const functionCalls = response.functionCalls || [];

  if (functionCalls.length > 0) {
    for (const call of functionCalls) {
      if (call.name === 'createReminder') {
        executeCreateReminder(call.args as any);
      }
    }
  }

  console.log(\`🤖 Agent: \${response.text || 'I have scheduled your reminder!'}\`);
}

// Run test
runPersonalAssistant('Remind me to call the doctor at 3:30 PM today');
`;

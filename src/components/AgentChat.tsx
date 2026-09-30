import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Wrench,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sliders,
  Trash2,
  Clock,
  Calendar,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { AgentMessage, AgentToolCall } from '../types/agent';
import { sound } from '../utils/audio';

interface AgentChatProps {
  messages: AgentMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isProcessing: boolean;
  onClearHistory: () => void;
  tone: 'balanced' | 'executive' | 'friendly' | 'drill_sergeant';
  onToneChange: (tone: 'balanced' | 'executive' | 'friendly' | 'drill_sergeant') => void;
  onSelectToolCall?: (toolCall: AgentToolCall) => void;
}

const QUICK_PROMPTS = [
  { label: 'Plan my entire day', prompt: 'Plan my day today with focused work blocks, meetings, lunch, and a health break.' },
  { label: 'Set water reminder', prompt: 'Remind me to drink water every 2 hours starting now.' },
  { label: 'Schedule 90m deep work', prompt: 'Schedule a 90-minute Deep Work focus block at 2 PM for coding.' },
  { label: 'Break down complex task', prompt: 'Add a high priority task to prepare the product launch roadmap and decompose it into subtasks.' },
  { label: 'Check schedule conflicts', prompt: 'Check if I have any schedule conflicts or overlapping meetings today.' },
];

export const AgentChat: React.FC<AgentChatProps> = ({
  messages,
  onSendMessage,
  isProcessing,
  onClearHistory,
  tone,
  onToneChange,
  onSelectToolCall,
}) => {
  const [input, setInput] = useState('');
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    const msg = input.trim();
    setInput('');
    await onSendMessage(msg);
  };

  const handleQuickPrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  const toggleReasoning = (msgId: string) => {
    setExpandedReasoning((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-xl">
      {/* Header with Tone Selector & Clear */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-4 py-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
              Nova Agent Chat
              <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            </h2>
            <p className="text-[11px] text-slate-400">Conversational AI with autonomous tool calling</p>
          </div>
        </div>

        {/* Tone pills */}
        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 mr-1">
            <Sliders className="h-3 w-3" />
            <span>Tone:</span>
          </div>
          <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[10px]">
            {(['balanced', 'executive', 'friendly', 'drill_sergeant'] as const).map((t) => (
              <button
                key={t}
                onClick={() => onToneChange(t)}
                className={`rounded-md px-2 py-1 font-medium capitalize transition-all ${
                  tone === t
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={onClearHistory}
            title="Clear Chat History"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors ml-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/20">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Applied Actions Summary list */}
                  {msg.appliedActionsSummary && msg.appliedActionsSummary.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-1 text-xs">
                      <div className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Autonomous Actions Executed:</span>
                      </div>
                      {msg.appliedActionsSummary.map((summary, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-slate-300 pl-1">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{summary}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Agent Tool Calling Badges */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {msg.toolCalls.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => onSelectToolCall?.(tool)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-950/80 border border-indigo-500/30 px-2.5 py-1 text-[11px] font-mono text-indigo-300 hover:bg-indigo-900/60 hover:border-indigo-400 transition-all shadow-sm"
                      >
                        <Wrench className="h-3 w-3 text-indigo-400" />
                        <span>call:{tool.name}()</span>
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Reasoning Accordion (Brain perception) */}
                {msg.reasoning && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden text-xs">
                    <button
                      onClick={() => toggleReasoning(msg.id)}
                      className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <span className="flex items-center gap-1.5 font-mono">
                        <Sparkles className="h-3 w-3 text-cyan-400" />
                        <span>Agent Perception & Reasoning Trace</span>
                      </span>
                      {expandedReasoning[msg.id] ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                    {expandedReasoning[msg.id] && (
                      <div className="px-3 pb-2.5 pt-1 text-[11px] font-mono text-slate-300 border-t border-slate-800/80 bg-slate-950/90 whitespace-pre-wrap leading-relaxed">
                        {msg.reasoning}
                      </div>
                    )}
                  </div>
                )}

                {/* Suggestion Follow-up pills */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => onSendMessage(sug)}
                        className="rounded-full bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white transition-all text-left"
                      >
                        👉 {sug}
                      </button>
                    ))}
                  </div>
                )}

                <div className={`text-[10px] text-slate-500 ${isUser ? 'text-right' : 'text-left'} px-1`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex gap-3 items-center">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white animate-pulse">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-slate-800/80 border border-slate-700/80 px-4 py-3 text-xs text-slate-300 shadow-sm flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                Agent reasoning, evaluating calendar & executing tools...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Carousel */}
      <div className="border-t border-slate-800/70 bg-slate-950/40 px-3 py-2 overflow-x-auto scrollbar-none flex items-center gap-1.5 text-xs">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="h-2.5 w-2.5 text-indigo-400" />
          Quick:
        </span>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPrompt(qp.prompt)}
            disabled={isProcessing}
            className="shrink-0 rounded-lg bg-slate-800/80 hover:bg-slate-750 hover:border-indigo-500/40 border border-slate-700/60 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white transition-all disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSubmit} className="border-t border-slate-800 bg-slate-950/90 p-3">
        <div className="relative flex items-center rounded-xl bg-slate-900 border border-slate-700/70 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell Nova: 'Remind me to drink water', 'Plan my day', 'Schedule focus block'..."
            disabled={isProcessing}
            className="w-full bg-transparent px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/30 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

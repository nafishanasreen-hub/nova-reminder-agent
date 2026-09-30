import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Sparkles,
  Clock,
  Trash2,
  CheckCircle2,
  ListTodo,
  Grid3X3,
  Calendar,
  AlertCircle,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TaskItem, PriorityLevel, EisenhowerQuadrant } from '../types/agent';
import { getTodayString } from '../utils/storage';
import { sound } from '../utils/audio';

interface TaskManagerProps {
  tasks: TaskItem[];
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  onUpdateTaskStatus: (id: string, status: TaskItem['status']) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteTask: (id: string) => void;
  onDecomposeTask: (taskId: string, title: string, category: string) => Promise<void>;
  decomposingTaskId: string | null;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  onAddTask,
  onUpdateTaskStatus,
  onToggleSubtask,
  onDeleteTask,
  onDecomposeTask,
  decomposingTaskId,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');
  const [filter, setFilter] = useState<'all' | 'today' | 'high' | 'completed'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [category, setCategory] = useState<TaskItem['category']>('work');
  const [dueDate, setDueDate] = useState(() => getTodayString());
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);

  const toggleExpand = (taskId: string) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let quadrant: EisenhowerQuadrant = 'important_not_urgent';
    if (priority === 'high') quadrant = 'urgent_important';
    if (priority === 'low') quadrant = 'neither';

    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      quadrant,
      category,
      dueDate,
      estimatedMinutes,
      status: 'todo',
      subtasks: [],
    });

    setTitle('');
    setDescription('');
    setShowAddForm(false);
    sound.playSuccess();
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'completed') return t.status === 'completed';
    if (filter === 'high') return t.priority === 'high' && t.status !== 'completed';
    if (filter === 'today') return t.dueDate === getTodayString() && t.status !== 'completed';
    return t.status !== 'completed';
  });

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'low':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  const calculateProgress = (subtasks: { completed: boolean }[]) => {
    if (!subtasks.length) return 0;
    const completed = subtasks.filter((s) => s.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-4 py-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckSquare className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
              Everyday Tasks & Workflows
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[10px] font-bold text-emerald-300">
                {tasks.filter((t) => t.status !== 'completed').length} active
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Subtask decomposition, priority tracking & Eisenhower matrix</p>
          </div>
        </div>

        {/* View Switcher & Add Task */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[10px]">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 rounded-md px-2 py-1 transition-all ${
                viewMode === 'list' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListTodo className="h-3 w-3" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1 rounded-md px-2 py-1 transition-all ${
                viewMode === 'matrix' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid3X3 className="h-3 w-3" />
              <span>Matrix</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 text-slate-950 font-medium px-3 py-1 text-xs hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Add Task Form Modal */}
      {showAddForm && (
        <form onSubmit={handleCreateTask} className="m-3 p-3.5 rounded-xl border border-slate-700 bg-slate-950 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Create New Everyday Task
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
            placeholder="Task title (e.g. Prepare marketing launch report)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />

          <input
            type="text"
            placeholder="Brief description or context..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-white capitalize focus:border-emerald-500"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-white capitalize focus:border-emerald-500"
              >
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="learning">Learning</option>
                <option value="errand">Errand</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-white font-mono focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Est. Minutes</label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                min={5}
                step={5}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-white font-mono focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition-all"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs (when in List View) */}
      {viewMode === 'list' && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-slate-950/40 text-xs">
          <div className="flex items-center gap-1">
            {(['all', 'today', 'high', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-2.5 py-1 capitalize text-[11px] transition-all ${
                  filter === f
                    ? 'bg-slate-800 text-white font-medium border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            {filteredTasks.length} items
          </span>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3">
        {viewMode === 'matrix' ? (
          /* Eisenhower Matrix 2x2 Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
            {/* Q1: Urgent & Important */}
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 space-y-2 flex flex-col">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-1.5">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  🔥 Q1: Urgent & Important (Do First)
                </span>
                <span className="text-[10px] text-rose-300 font-mono">
                  {tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5">
                {tasks
                  .filter((t) => t.priority === 'high' && t.status !== 'completed')
                  .map((task) => (
                    <div key={task.id} className="rounded-lg bg-slate-900/80 border border-slate-800 p-2 text-xs">
                      <div className="font-medium text-white">{task.title}</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>Due: {task.dueDate || 'Today'}</span>
                        <button
                          onClick={() => onUpdateTaskStatus(task.id, 'completed')}
                          className="text-emerald-400 hover:underline"
                        >
                          Mark Done
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Q2: Important Not Urgent */}
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3 space-y-2 flex flex-col">
              <div className="flex items-center justify-between border-b border-indigo-500/20 pb-1.5">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  ⭐ Q2: Important, Not Urgent (Schedule)
                </span>
                <span className="text-[10px] text-indigo-300 font-mono">
                  {tasks.filter((t) => t.priority === 'medium' && t.status !== 'completed').length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5">
                {tasks
                  .filter((t) => t.priority === 'medium' && t.status !== 'completed')
                  .map((task) => (
                    <div key={task.id} className="rounded-lg bg-slate-900/80 border border-slate-800 p-2 text-xs">
                      <div className="font-medium text-white">{task.title}</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>Est: {task.estimatedMinutes}m</span>
                        <button
                          onClick={() => onUpdateTaskStatus(task.id, 'completed')}
                          className="text-emerald-400 hover:underline"
                        >
                          Mark Done
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Q3: Urgent Not Important */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-2 flex flex-col">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  ⚡ Q3: Urgent, Not Important (Delegate/Quick)
                </span>
                <span className="text-[10px] text-amber-300 font-mono">
                  {tasks.filter((t) => t.category === 'errand' && t.status !== 'completed').length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5">
                {tasks
                  .filter((t) => t.category === 'errand' && t.status !== 'completed')
                  .map((task) => (
                    <div key={task.id} className="rounded-lg bg-slate-900/80 border border-slate-800 p-2 text-xs">
                      <div className="font-medium text-white">{task.title}</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>Category: {task.category}</span>
                        <button
                          onClick={() => onUpdateTaskStatus(task.id, 'completed')}
                          className="text-emerald-400 hover:underline"
                        >
                          Mark Done
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Q4: Neither */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/20 p-3 space-y-2 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  🍃 Q4: Low Priority / Backlog (Eliminate)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {tasks.filter((t) => t.priority === 'low' && t.status !== 'completed').length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5">
                {tasks
                  .filter((t) => t.priority === 'low' && t.status !== 'completed')
                  .map((task) => (
                    <div key={task.id} className="rounded-lg bg-slate-900/80 border border-slate-800 p-2 text-xs">
                      <div className="font-medium text-white">{task.title}</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>Low Urgency</span>
                        <button
                          onClick={() => onUpdateTaskStatus(task.id, 'completed')}
                          className="text-emerald-400 hover:underline"
                        >
                          Mark Done
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-2.5">
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <CheckSquare className="h-8 w-8 text-slate-600 mb-2 stroke-[1.5]" />
                <p className="text-xs font-medium text-slate-400">No {filter} tasks</p>
                <p className="text-[11px] mt-1 text-slate-500">
                  Ask Nova: "Add a task to prepare the sprint report" or click "Add Task".
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                const progress = calculateProgress(task.subtasks);
                const isExpanded = expandedTasks[task.id] ?? true;
                const isDecomposing = decomposingTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    className={`rounded-xl border p-3 transition-all ${
                      isCompleted
                        ? 'border-slate-800/60 bg-slate-950/40 opacity-60'
                        : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Status Checkbox */}
                        <button
                          onClick={() => {
                            onUpdateTaskStatus(task.id, isCompleted ? 'todo' : 'completed');
                            if (!isCompleted) sound.playSuccess();
                          }}
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                            isCompleted
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-slate-600 hover:border-emerald-400'
                          }`}
                        >
                          {isCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </button>

                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-semibold ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                              {task.title}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${getPriorityBadge(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                              {task.category}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-[11px] text-slate-400">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-0.5">
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {task.dueDate}
                              </span>
                            )}
                            {task.estimatedMinutes && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                ~{task.estimatedMinutes}m
                              </span>
                            )}
                            {task.subtasks.length > 0 && (
                              <span className="text-emerald-400">
                                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks ({progress}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        {/* AI Decompose Button */}
                        {task.subtasks.length === 0 && !isCompleted && (
                          <button
                            onClick={() => onDecomposeTask(task.id, task.title, task.category)}
                            disabled={isDecomposing}
                            className="flex items-center gap-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 px-2 py-1 text-[11px] font-medium text-indigo-300 transition-all disabled:opacity-50"
                          >
                            <Sparkles className="h-3 w-3 text-indigo-400" />
                            <span>{isDecomposing ? 'Decomposing...' : 'Break Down'}</span>
                          </button>
                        )}

                        {task.subtasks.length > 0 && (
                          <button
                            onClick={() => toggleExpand(task.id)}
                            className="p-1 text-slate-400 hover:text-slate-200"
                          >
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteTask(task.id)}
                          title="Delete task"
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Subtasks Progress Bar & Checklist */}
                    {task.subtasks.length > 0 && isExpanded && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1.5">
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>

                        <div className="space-y-1 pl-6 pt-1">
                          {task.subtasks.map((st) => (
                            <div key={st.id} className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={st.completed}
                                onChange={() => onToggleSubtask(task.id, st.id)}
                                className="h-3.5 w-3.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/30"
                              />
                              <span className={`text-[11px] ${st.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                                {st.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

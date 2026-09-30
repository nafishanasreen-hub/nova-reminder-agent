export type PriorityLevel = 'high' | 'medium' | 'low';

export type EisenhowerQuadrant = 'urgent_important' | 'important_not_urgent' | 'urgent_not_important' | 'neither';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority: PriorityLevel;
  quadrant?: EisenhowerQuadrant;
  status: 'todo' | 'in_progress' | 'completed';
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  estimatedMinutes?: number;
  category: 'work' | 'personal' | 'health' | 'learning' | 'errand';
  subtasks: SubTask[];
  createdAt: string;
  completedAt?: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  priority: PriorityLevel;
  recurrence: 'none' | 'daily' | 'weekly' | 'weekdays' | 'monthly';
  category: 'general' | 'health' | 'work' | 'meeting' | 'personal';
  status: 'active' | 'dismissed' | 'snoozed' | 'completed';
  snoozedUntil?: string;
  notes?: string;
  createdAt: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (e.g. "09:00")
  endTime: string; // HH:MM (e.g. "10:30")
  category: 'work' | 'focus' | 'meeting' | 'health' | 'break' | 'personal';
  description?: string;
  isFixed?: boolean;
  isCompleted?: boolean;
  color?: string;
}

export interface AgentToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  result?: any;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
}

export interface AgentMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  reasoning?: string;
  toolCalls?: AgentToolCall[];
  appliedActionsSummary?: string[];
  suggestions?: string[];
  rawGeminiResponse?: any;
}

export interface UserContext {
  currentTime: string;
  currentDate: string;
  timezone: string;
  tasks: TaskItem[];
  reminders: ReminderItem[];
  events: ScheduleEvent[];
  agentTone?: 'balanced' | 'executive' | 'friendly' | 'drill_sergeant';
}

export interface AgentActionPayload {
  action: 'create_reminder' | 'update_reminder' | 'delete_reminder' |
          'create_event' | 'update_event' | 'delete_event' |
          'create_task' | 'update_task' | 'delete_task' |
          'batch_plan_day';
  data: any;
}

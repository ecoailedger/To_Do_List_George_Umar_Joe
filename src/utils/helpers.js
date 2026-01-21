import { formatDistanceToNow, isPast, isToday, isTomorrow, addDays, format } from 'date-fns';

export const generateId = (prefix = 'item') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return format(d, 'MMM dd, yyyy');
};

export const getRelativeDate = (date) => {
  if (!date) return '';
  const d = new Date(date);

  if (isPast(d) && !isToday(d)) {
    return `Overdue by ${formatDistanceToNow(d)}`;
  }

  if (isToday(d)) {
    return 'Due today';
  }

  if (isTomorrow(d)) {
    return 'Due tomorrow';
  }

  return `Due in ${formatDistanceToNow(d)}`;
};

export const getPriorityColor = (priority) => {
  const colors = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };
  return colors[priority?.toLowerCase()] || colors.medium;
};

export const getStatusColor = (status) => {
  const colors = {
    'not-started': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'blocked': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    'complete': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };
  return colors[status] || colors['not-started'];
};

export const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const calculateProgress = (todos) => {
  if (!todos || todos.length === 0) return { completed: 0, total: 0, percentage: 0 };
  const completed = todos.filter(t => t.status === 'complete').length;
  const total = todos.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage };
};

export const getOverdueCount = (todos) => {
  if (!todos) return 0;
  return todos.filter(t =>
    t.dueDate &&
    isPast(new Date(t.dueDate)) &&
    !isToday(new Date(t.dueDate)) &&
    t.status !== 'complete'
  ).length;
};

export const getWorkloadIntensity = (todos) => {
  if (!todos || todos.length === 0) return 0;

  const overdue = getOverdueCount(todos);
  const critical = todos.filter(t => t.priority === 'critical' && t.status !== 'complete').length;
  const high = todos.filter(t => t.priority === 'high' && t.status !== 'complete').length;

  // Calculate intensity score (0-10)
  const score = (overdue * 2) + (critical * 1.5) + (high * 1) + (todos.length * 0.1);
  return Math.min(10, score);
};

export const getHeatmapColor = (intensity) => {
  if (intensity === 0) return 'bg-gray-50 dark:bg-gray-900';
  if (intensity < 2) return 'bg-blue-50 dark:bg-blue-950';
  if (intensity < 4) return 'bg-yellow-100 dark:bg-yellow-900/30';
  if (intensity < 7) return 'bg-orange-200 dark:bg-orange-900/50';
  return 'bg-red-300 dark:bg-red-900/60';
};

export const sortTodos = (todos, sortBy = 'priority') => {
  if (!todos) return [];

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

  return [...todos].sort((a, b) => {
    if (sortBy === 'priority') {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'status') {
      return a.status.localeCompare(b.status);
    }
    return 0;
  });
};

export const filterTodos = (todos, filters) => {
  if (!todos) return [];

  return todos.filter(todo => {
    if (filters.status?.length && !filters.status.includes(todo.status)) return false;
    if (filters.priority?.length && !filters.priority.includes(todo.priority)) return false;
    if (filters.assignee?.length && !filters.assignee.includes(todo.assignee)) return false;
    if (filters.tags?.length && !filters.tags.some(tag => todo.tags?.includes(tag))) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = todo.title?.toLowerCase().includes(searchLower);
      const matchesNotes = todo.notes?.toLowerCase().includes(searchLower);
      const matchesComments = todo.comments?.some(c => c.text?.toLowerCase().includes(searchLower));
      if (!matchesTitle && !matchesNotes && !matchesComments) return false;
    }
    return true;
  });
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Due date color coding
export const getDueDateColor = (dueDate, status) => {
  if (!dueDate || status === 'complete') return 'text-gray-500 dark:text-gray-400';

  const date = new Date(dueDate);
  const now = new Date();
  const daysDiff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

  if (isPast(date) && !isToday(date)) {
    return 'text-red-600 dark:text-red-400 font-semibold'; // Overdue
  }
  if (isToday(date)) {
    return 'text-amber-600 dark:text-amber-400 font-semibold'; // Due today
  }
  if (daysDiff <= 7) {
    return 'text-blue-600 dark:text-blue-400'; // This week
  }
  return 'text-gray-500 dark:text-gray-400'; // Future
};

// Stale task detection (7+ days with no updates)
export const isStaleTask = (todo) => {
  if (!todo.updatedAt || todo.status === 'complete') return false;
  const updatedDate = new Date(todo.updatedAt);
  const daysSinceUpdate = Math.floor((new Date() - updatedDate) / (1000 * 60 * 60 * 24));
  return daysSinceUpdate >= 7;
};

// Group tasks for "My Focus" view
export const groupTasksByDueDate = (todos) => {
  const groups = {
    overdue: [],
    today: [],
    thisWeek: [],
    later: [],
  };

  todos.forEach(todo => {
    if (!todo.dueDate) {
      groups.later.push(todo);
      return;
    }

    const date = new Date(todo.dueDate);
    const now = new Date();
    const daysDiff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

    if (isPast(date) && !isToday(date)) {
      groups.overdue.push(todo);
    } else if (isToday(date)) {
      groups.today.push(todo);
    } else if (daysDiff <= 7) {
      groups.thisWeek.push(todo);
    } else {
      groups.later.push(todo);
    }
  });

  return groups;
};

// Parse @mentions from text
export const parseMentions = (text, teamMembers) => {
  if (!text) return [];
  const mentionRegex = /@(\w+)/g;
  const matches = [...text.matchAll(mentionRegex)];
  const mentions = [];

  matches.forEach(match => {
    const username = match[1].toLowerCase();
    const member = teamMembers.find(m =>
      m.name.toLowerCase() === username ||
      m.initials.toLowerCase() === username
    );
    if (member) {
      mentions.push(member.id);
    }
  });

  return [...new Set(mentions)];
};

// Highlight @mentions in text
export const highlightMentions = (text, teamMembers) => {
  if (!text) return text;
  let highlighted = text;

  teamMembers.forEach(member => {
    const regex = new RegExp(`@${member.name}\\b`, 'gi');
    highlighted = highlighted.replace(regex, `<span class="mention">@${member.name}</span>`);
  });

  return highlighted;
};

// Generate standup report
export const generateStandupReport = (data, userId) => {
  const member = data.teamMembers.find(m => m.id === userId);
  if (!member) return '';

  const userTodos = [];
  Object.entries(data.todos).forEach(([key, todos]) => {
    userTodos.push(...todos.filter(t => t.assignee === userId));
  });

  const completed = userTodos.filter(t => t.status === 'complete');
  const inProgress = userTodos.filter(t => t.status === 'in-progress');
  const blocked = userTodos.filter(t => t.status === 'blocked');

  let report = `## Standup Report - ${member.name}\n\n`;

  report += `### ✅ Completed (${completed.length})\n`;
  completed.forEach(t => {
    report += `- ${t.title}\n`;
  });

  report += `\n### 🚧 In Progress (${inProgress.length})\n`;
  inProgress.forEach(t => {
    report += `- ${t.title}\n`;
  });

  if (blocked.length > 0) {
    report += `\n### 🚫 Blocked (${blocked.length})\n`;
    blocked.forEach(t => {
      report += `- ${t.title}\n`;
    });
  }

  return report;
};

// Generate weekly summary
export const generateWeeklySummary = (data) => {
  let summary = `## Weekly Summary\n\n`;

  data.teamMembers.forEach(member => {
    const userTodos = [];
    Object.entries(data.todos).forEach(([key, todos]) => {
      userTodos.push(...todos.filter(t => t.assignee === member.id));
    });

    const completed = userTodos.filter(t => t.status === 'complete').length;
    const total = userTodos.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    summary += `### ${member.name}\n`;
    summary += `- Total Tasks: ${total}\n`;
    summary += `- Completed: ${completed}\n`;
    summary += `- Completion Rate: ${completionRate}%\n\n`;
  });

  // By region
  summary += `### By Region\n`;
  data.companies.forEach(company => {
    let companyTasks = 0;
    let companyCompleted = 0;

    data.projects.forEach(project => {
      const key = `${project.id}-${company}`;
      const todos = data.todos[key] || [];
      companyTasks += todos.length;
      companyCompleted += todos.filter(t => t.status === 'complete').length;
    });

    const rate = companyTasks > 0 ? Math.round((companyCompleted / companyTasks) * 100) : 0;
    summary += `- **${company}**: ${companyCompleted}/${companyTasks} (${rate}%)\n`;
  });

  return summary;
};

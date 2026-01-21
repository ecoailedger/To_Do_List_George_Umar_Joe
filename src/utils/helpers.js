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

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadData, saveData, defaultData } from '../utils/storage';
import { debounce, generateId } from '../utils/helpers';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [data, setData] = useState(loadData());
  const [selectedCell, setSelectedCell] = useState(null);
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' or 'dashboard'
  const [focusMode, setFocusMode] = useState(null);
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTodos, setSelectedTodos] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [notification, setNotification] = useState(null);

  // Auto-save with debouncing
  const debouncedSave = useCallback(
    debounce((dataToSave) => {
      saveData(dataToSave);
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSave(data);
  }, [data, debouncedSave]);

  // Dark mode effect
  useEffect(() => {
    if (data.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data.settings.darkMode]);

  const toggleDarkMode = () => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, darkMode: !prev.settings.darkMode }
    }));
  };

  // Project management
  const addProject = (name, color) => {
    const newProject = {
      id: generateId('proj'),
      name,
      color: color || '#3B82F6',
      order: data.projects.length,
    };
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
    return newProject;
  };

  const updateProject = (projectId, updates) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? { ...p, ...updates } : p),
    }));
  };

  const deleteProject = (projectId) => {
    // Also delete all todos in this project
    const newTodos = { ...data.todos };
    data.companies.forEach(company => {
      delete newTodos[`${projectId}-${company}`];
    });

    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== projectId),
      todos: newTodos,
    }));
  };

  const reorderProjects = (startIndex, endIndex) => {
    const result = Array.from(data.projects);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    const reordered = result.map((p, index) => ({ ...p, order: index }));

    setData(prev => ({ ...prev, projects: reordered }));
  };

  const duplicateProject = (projectId) => {
    const project = data.projects.find(p => p.id === projectId);
    if (!project) return;

    const newProject = {
      ...project,
      id: generateId('proj'),
      name: `${project.name} (Copy)`,
      order: data.projects.length,
    };

    // Copy all todos
    const newTodos = { ...data.todos };
    data.companies.forEach(company => {
      const cellKey = `${projectId}-${company}`;
      if (data.todos[cellKey]) {
        const newCellKey = `${newProject.id}-${company}`;
        newTodos[newCellKey] = data.todos[cellKey].map(todo => ({
          ...todo,
          id: generateId('todo'),
        }));
      }
    });

    setData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject],
      todos: newTodos,
    }));
  };

  // Todo management
  const getCellKey = (projectId, company) => `${projectId}-${company}`;

  const getTodos = (projectId, company) => {
    const key = getCellKey(projectId, company);
    return data.todos[key] || [];
  };

  const addTodo = (projectId, company, todoData) => {
    const key = getCellKey(projectId, company);
    const newTodo = {
      id: generateId('todo'),
      title: todoData.title || 'New Task',
      notes: todoData.notes || '',
      assignee: todoData.assignee || null,
      priority: todoData.priority || 'medium',
      dueDate: todoData.dueDate || null,
      status: todoData.status || 'not-started',
      tags: todoData.tags || [],
      subtasks: todoData.subtasks || [],
      comments: todoData.comments || [],
      timeEstimate: todoData.timeEstimate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setData(prev => ({
      ...prev,
      todos: {
        ...prev.todos,
        [key]: [...(prev.todos[key] || []), newTodo],
      },
    }));

    return newTodo;
  };

  const updateTodo = (projectId, company, todoId, updates) => {
    const key = getCellKey(projectId, company);
    setData(prev => ({
      ...prev,
      todos: {
        ...prev.todos,
        [key]: (prev.todos[key] || []).map(todo =>
          todo.id === todoId ? { ...todo, ...updates, updatedAt: new Date().toISOString() } : todo
        ),
      },
    }));
  };

  const deleteTodo = (projectId, company, todoId) => {
    const key = getCellKey(projectId, company);
    setData(prev => ({
      ...prev,
      todos: {
        ...prev.todos,
        [key]: (prev.todos[key] || []).filter(todo => todo.id !== todoId),
      },
    }));
  };

  const moveTodo = (fromProject, fromCompany, toProject, toCompany, todoId) => {
    const fromKey = getCellKey(fromProject, fromCompany);
    const toKey = getCellKey(toProject, toCompany);

    const todo = (data.todos[fromKey] || []).find(t => t.id === todoId);
    if (!todo) return;

    setData(prev => ({
      ...prev,
      todos: {
        ...prev.todos,
        [fromKey]: (prev.todos[fromKey] || []).filter(t => t.id !== todoId),
        [toKey]: [...(prev.todos[toKey] || []), { ...todo, updatedAt: new Date().toISOString() }],
      },
    }));
  };

  // Team members
  const addTeamMember = (name) => {
    const newMember = {
      id: generateId('tm'),
      name,
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase(),
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    };
    setData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, newMember],
    }));
    return newMember;
  };

  // Bulk actions
  const bulkUpdateTodos = (updates) => {
    selectedTodos.forEach(({ projectId, company, todoId }) => {
      updateTodo(projectId, company, todoId, updates);
    });
    setSelectedTodos([]);
  };

  const bulkDeleteTodos = () => {
    selectedTodos.forEach(({ projectId, company, todoId }) => {
      deleteTodo(projectId, company, todoId);
    });
    setSelectedTodos([]);
  };

  // Notifications
  const showNotification = (message, type = 'info', duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  // Current user management
  const setCurrentUser = (userId) => {
    setData(prev => ({ ...prev, currentUser: userId }));
  };

  // Activity log
  const addActivity = (action, details) => {
    const activity = {
      id: generateId('activity'),
      action,
      details,
      user: data.currentUser,
      timestamp: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      activityLog: [activity, ...(prev.activityLog || [])].slice(0, 100), // Keep last 100 activities
    }));
  };

  // Watch toggle
  const toggleWatch = (projectId, company, todoId) => {
    const key = getCellKey(projectId, company);
    setData(prev => ({
      ...prev,
      todos: {
        ...prev.todos,
        [key]: (prev.todos[key] || []).map(todo => {
          if (todo.id === todoId) {
            const watchers = todo.watchers || [];
            const isWatching = watchers.includes(data.currentUser);
            return {
              ...todo,
              watchers: isWatching
                ? watchers.filter(w => w !== data.currentUser)
                : [...watchers, data.currentUser],
              updatedAt: new Date().toISOString(),
            };
          }
          return todo;
        }),
      },
    }));
  };

  // Reassign with handoff note
  const reassignTodo = (projectId, company, todoId, newAssignee, handoffNote) => {
    const key = getCellKey(projectId, company);
    const todo = (data.todos[key] || []).find(t => t.id === todoId);
    if (!todo) return;

    const oldAssignee = data.teamMembers.find(m => m.id === todo.assignee);
    const newAssigneeMember = data.teamMembers.find(m => m.id === newAssignee);

    // Add handoff note to comments
    const handoffComment = {
      id: generateId('comment'),
      text: `Reassigned from ${oldAssignee?.name || 'Unassigned'} to ${newAssigneeMember?.name}${handoffNote ? `\n\nHandoff note: ${handoffNote}` : ''}`,
      timestamp: new Date().toISOString(),
      type: 'system',
    };

    updateTodo(projectId, company, todoId, {
      assignee: newAssignee,
      comments: [...(todo.comments || []), handoffComment],
    });

    // Remember last assignee for this region
    setData(prev => ({
      ...prev,
      smartDefaults: {
        ...prev.smartDefaults,
        lastAssigneeByRegion: {
          ...prev.smartDefaults?.lastAssigneeByRegion,
          [company]: newAssignee,
        },
      },
    }));

    addActivity('reassigned', {
      todoTitle: todo.title,
      from: oldAssignee?.name,
      to: newAssigneeMember?.name,
      company,
    });
  };

  // Get suggested assignee for region
  const getSuggestedAssignee = (company) => {
    return data.smartDefaults?.lastAssigneeByRegion?.[company] || null;
  };

  // Get suggested due date based on priority
  const getSuggestedDueDate = (priority) => {
    const today = new Date();
    switch (priority) {
      case 'critical':
        return new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0];
      case 'high':
        return new Date(today.setDate(today.getDate() + 3)).toISOString().split('T')[0];
      case 'medium':
        return new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0];
      case 'low':
        return new Date(today.setDate(today.getDate() + 14)).toISOString().split('T')[0];
      default:
        return null;
    }
  };

  const value = {
    data,
    setData,
    selectedCell,
    setSelectedCell,
    viewMode,
    setViewMode,
    focusMode,
    setFocusMode,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    selectedTodos,
    setSelectedTodos,
    showShortcuts,
    setShowShortcuts,
    notification,
    showNotification,
    toggleDarkMode,
    addProject,
    updateProject,
    deleteProject,
    reorderProjects,
    duplicateProject,
    getTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    moveTodo,
    addTeamMember,
    bulkUpdateTodos,
    bulkDeleteTodos,
    setCurrentUser,
    addActivity,
    toggleWatch,
    reassignTodo,
    getSuggestedAssignee,
    getSuggestedDueDate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

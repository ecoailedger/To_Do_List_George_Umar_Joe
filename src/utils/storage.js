// LocalStorage utilities with versioning and auto-save

const STORAGE_KEY = 'midwich-todo-matrix';
const VERSION = '1.0.0';

export const defaultData = {
  version: VERSION,
  companies: ['UK&I', 'DACH', 'US', 'EMEA', 'APAC', 'Canada', 'NMK'],
  projects: [
    { id: 'proj-1', name: 'Digital Transformation', color: '#3B82F6', order: 0 },
    { id: 'proj-2', name: 'Product Launch Q1', color: '#10B981', order: 1 },
    { id: 'proj-3', name: 'Infrastructure Upgrade', color: '#F59E0B', order: 2 },
  ],
  todos: {
    // Format: 'proj-1-UK&I': [{ id, title, notes, assignee, priority, dueDate, status, tags, subtasks, comments, timeEstimate, createdAt, updatedAt }]
  },
  teamMembers: [
    { id: 'tm-1', name: 'John Smith', initials: 'JS', color: '#3B82F6' },
    { id: 'tm-2', name: 'Sarah Johnson', initials: 'SJ', color: '#10B981' },
    { id: 'tm-3', name: 'Michael Chen', initials: 'MC', color: '#F59E0B' },
    { id: 'tm-4', name: 'Emma Wilson', initials: 'EW', color: '#8B5CF6' },
  ],
  templates: [],
  filters: [],
  settings: {
    darkMode: false,
    notifications: true,
  },
  lastSaved: new Date().toISOString(),
};

export const loadData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultData;
    }
    const data = JSON.parse(stored);
    // Migration logic here if needed
    return { ...defaultData, ...data };
  } catch (error) {
    console.error('Error loading data:', error);
    return defaultData;
  }
};

export const saveData = (data) => {
  try {
    const toSave = {
      ...data,
      lastSaved: new Date().toISOString(),
      version: VERSION,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

export const clearData = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const exportData = () => {
  const data = loadData();
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    saveData(data);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

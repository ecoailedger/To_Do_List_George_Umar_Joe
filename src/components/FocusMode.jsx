import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus } from 'lucide-react';
import { sortTodos, getPriorityColor, getRelativeDate } from '../utils/helpers';

export default function FocusMode() {
  const { focusMode, setFocusMode, getTodos, updateTodo, addTodo, data } = useApp();

  if (!focusMode) return null;

  const { projectId, company } = focusMode;
  const todos = getTodos(projectId, company);
  const project = data.projects.find(p => p.id === projectId);

  const todosByStatus = {
    'not-started': todos.filter(t => t.status === 'not-started' || t.status === 'blocked'),
    'in-progress': todos.filter(t => t.status === 'in-progress'),
    'complete': todos.filter(t => t.status === 'complete'),
  };

  const handleStatusChange = (todoId, newStatus) => {
    updateTodo(projectId, company, todoId, { status: newStatus });
  };

  const handleAddTask = () => {
    addTodo(projectId, company, { title: 'New Task' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm animate-fade-in">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gray-800 border-b border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: project?.color }}
              />
              <span>{project?.name}</span>
              <span className="text-gray-400">•</span>
              <span className="text-primary-400">{company}</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">Focus Mode - Press ESC to exit</p>
          </div>
          <button
            onClick={() => setFocusMode(null)}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-3 gap-6 p-6">
            <KanbanColumn
              title="To Do"
              count={todosByStatus['not-started'].length}
              todos={sortTodos(todosByStatus['not-started'], 'priority')}
              projectId={projectId}
              company={company}
              onStatusChange={handleStatusChange}
              onAddTask={handleAddTask}
            />
            <KanbanColumn
              title="In Progress"
              count={todosByStatus['in-progress'].length}
              todos={sortTodos(todosByStatus['in-progress'], 'priority')}
              projectId={projectId}
              company={company}
              onStatusChange={handleStatusChange}
            />
            <KanbanColumn
              title="Done"
              count={todosByStatus['complete'].length}
              todos={sortTodos(todosByStatus['complete'], 'priority')}
              projectId={projectId}
              company={company}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ title, count, todos, projectId, company, onStatusChange, onAddTask }) {
  const statusMap = {
    'To Do': 'not-started',
    'In Progress': 'in-progress',
    'Done': 'complete',
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const todoId = e.dataTransfer.getData('todoId');
    onStatusChange(todoId, newStatus);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {title} <span className="text-gray-400">({count})</span>
        </h2>
        {title === 'To Do' && (
          <button
            onClick={onAddTask}
            className="p-1 rounded hover:bg-gray-700 text-primary-400"
          >
            <Plus size={18} />
          </button>
        )}
      </div>
      <div
        className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3"
        onDrop={(e) => handleDrop(e, statusMap[title])}
        onDragOver={handleDragOver}
      >
        {todos.map((todo) => (
          <KanbanCard
            key={todo.id}
            todo={todo}
            projectId={projectId}
            company={company}
          />
        ))}
        {todos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanCard({ todo, projectId, company }) {
  const { setSelectedCell, data } = useApp();

  const handleDragStart = (e) => {
    e.dataTransfer.setData('todoId', todo.id);
  };

  const handleClick = () => {
    setSelectedCell({ projectId, company });
  };

  const assignee = data.teamMembers.find(m => m.id === todo.assignee);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors border-l-4"
      style={{ borderColor: todo.status === 'complete' ? '#10B981' : todo.status === 'blocked' ? '#EF4444' : '#3B82F6' }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`badge text-xs ${getPriorityColor(todo.priority)}`}>
          {todo.priority}
        </span>
        {assignee && (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: assignee.color }}
            title={assignee.name}
          >
            {assignee.initials}
          </div>
        )}
      </div>
      <h3 className="text-white font-medium mb-2">{todo.title}</h3>
      {todo.notes && (
        <p className="text-sm text-gray-400 mb-2 line-clamp-2">{todo.notes}</p>
      )}
      {todo.dueDate && (
        <p className="text-xs text-gray-400">{getRelativeDate(todo.dueDate)}</p>
      )}
      {todo.subtasks && todo.subtasks.length > 0 && (
        <div className="text-xs text-gray-400 mt-2">
          {todo.subtasks.filter(st => st.completed).length}/{todo.subtasks.length} subtasks
        </div>
      )}
    </div>
  );
}

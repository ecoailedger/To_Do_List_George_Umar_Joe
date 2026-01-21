import React from 'react';
import { useApp } from '../context/AppContext';
import { calculateProgress, getOverdueCount, getWorkloadIntensity, getHeatmapColor, sortTodos, getPriorityColor } from '../utils/helpers';
import { AlertCircle, Plus } from 'lucide-react';

export default function GridCell({ projectId, company }) {
  const { getTodos, setSelectedCell, setFocusMode, addTodo } = useApp();
  const todos = getTodos(projectId, company);
  const { completed, total, percentage } = calculateProgress(todos);
  const overdueCount = getOverdueCount(todos);
  const intensity = getWorkloadIntensity(todos);
  const heatmapColor = getHeatmapColor(intensity);

  const sortedTodos = sortTodos(todos, 'priority');
  const topTodo = sortedTodos.find(t => t.status !== 'complete');

  const handleClick = () => {
    setSelectedCell({ projectId, company });
  };

  const handleDoubleClick = () => {
    setFocusMode({ projectId, company });
  };

  const handleAddTask = (e) => {
    e.stopPropagation();
    addTodo(projectId, company, { title: 'New Task' });
    setSelectedCell({ projectId, company });
  };

  return (
    <td
      className={`border-b border-r border-gray-200 dark:border-gray-700 p-3 transition-all relative group ${heatmapColor} cursor-pointer`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title="Click to view, double-click for focus mode"
    >
      <div className="space-y-2">
        {/* Progress bar and count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {completed}/{total}
            </span>
            {overdueCount > 0 && (
              <span className="flex items-center space-x-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle size={12} />
                <span>{overdueCount}</span>
              </span>
            )}
          </div>
          <button
            onClick={handleAddTask}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 text-primary-600 dark:text-primary-400 transition-opacity"
            title="Add task (N)"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-primary-600 dark:bg-primary-500 h-1.5 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}

        {/* Top priority item preview */}
        {topTodo && (
          <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-tight">
            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium mr-1 ${getPriorityColor(topTodo.priority)}`}>
              {topTodo.priority?.toUpperCase()}
            </span>
            {topTodo.title}
          </div>
        )}

        {total === 0 && (
          <div className="text-xs text-gray-400 dark:text-gray-500 italic">
            No tasks
          </div>
        )}
      </div>
    </td>
  );
}

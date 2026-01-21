import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { groupTasksByDueDate, getDueDateColor, isStaleTask } from '../utils/helpers';
import { AlertCircle, Clock, Calendar, ChevronRight } from 'lucide-react';

export default function MyFocusView() {
  const { data, setSelectedCell } = useApp();

  // Get all tasks for current user
  const myTasks = useMemo(() => {
    const tasks = [];
    Object.entries(data.todos).forEach(([key, todos]) => {
      const [projectId, _, company] = key.split('-');
      const fullProjectId = `${projectId}-${_}`;

      todos.forEach(todo => {
        if (todo.assignee === data.currentUser) {
          const project = data.projects.find(p => p.id === fullProjectId);
          tasks.push({
            ...todo,
            projectId: fullProjectId,
            projectName: project?.name || 'Unknown',
            projectColor: project?.color || '#3B82F6',
            company,
          });
        }
      });
    });
    return tasks;
  }, [data.todos, data.currentUser, data.projects]);

  const groupedTasks = groupTasksByDueDate(myTasks);

  const TaskCard = ({ task }) => {
    const isStale = isStaleTask(task);

    return (
      <div
        onClick={() => setSelectedCell({ projectId: task.projectId, company: task.company })}
        className={`bg-white dark:bg-gray-800 rounded-lg p-4 border-2 hover:shadow-md transition-all cursor-pointer ${
          isStale ? 'border-l-4 border-l-yellow-500' : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              {task.title}
            </h3>
            <div className="flex items-center space-x-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: task.projectColor }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {task.projectName} • {task.company}
              </span>
            </div>
          </div>
          <span className={`badge ${task.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
            {task.priority}
          </span>
        </div>

        {task.notes && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
            {task.notes}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className={`badge ${task.status === 'complete' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : task.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : task.status === 'blocked' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
            {task.status.replace('-', ' ')}
          </span>

          {task.dueDate && (
            <span className={`text-xs flex items-center space-x-1 ${getDueDateColor(task.dueDate, task.status)}`}>
              <Calendar size={12} />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </span>
          )}
        </div>

        {isStale && (
          <div className="mt-2 flex items-center space-x-1 text-xs text-yellow-600 dark:text-yellow-400">
            <AlertCircle size={12} />
            <span>Stale (no updates in 7+ days)</span>
          </div>
        )}
      </div>
    );
  };

  const TaskSection = ({ title, tasks, icon, emptyMessage }) => (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-4">
        {icon}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          {tasks.length}
        </span>
      </div>
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );

  const currentUser = data.teamMembers.find(m => m.id === data.currentUser);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: currentUser?.color }}
            >
              {currentUser?.initials}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Focus
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {myTasks.length} {myTasks.length === 1 ? 'task' : 'tasks'} assigned to {currentUser?.name}
              </p>
            </div>
          </div>
        </div>

        <TaskSection
          title="Overdue"
          tasks={groupedTasks.overdue}
          icon={<AlertCircle className="text-red-600 dark:text-red-400" size={20} />}
          emptyMessage="No overdue tasks"
        />

        <TaskSection
          title="Due Today"
          tasks={groupedTasks.today}
          icon={<Clock className="text-amber-600 dark:text-amber-400" size={20} />}
          emptyMessage="No tasks due today"
        />

        <TaskSection
          title="This Week"
          tasks={groupedTasks.thisWeek}
          icon={<Calendar className="text-blue-600 dark:text-blue-400" size={20} />}
          emptyMessage="No tasks due this week"
        />

        <TaskSection
          title="Later"
          tasks={groupedTasks.later}
          icon={<ChevronRight className="text-gray-600 dark:text-gray-400" size={20} />}
          emptyMessage="No upcoming tasks"
        />
      </div>
    </div>
  );
}

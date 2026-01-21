import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Filter } from 'lucide-react';

export default function FilterSidebar({ onClose }) {
  const { filters, setFilters, data } = useApp();

  const handleToggle = (category, value) => {
    const current = filters[category] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFilters({ ...filters, [category]: updated });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasFilters = Object.keys(filters).some(key => filters[key]?.length > 0);

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto scrollbar-thin animate-slide-in">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="w-full text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            Clear all filters
          </button>
        )}

        {/* Status */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Status</h3>
          <div className="space-y-2">
            {['not-started', 'in-progress', 'blocked', 'complete'].map((status) => (
              <label key={status} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(filters.status || []).includes(status)}
                  onChange={() => handleToggle('status', status)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {status.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Priority</h3>
          <div className="space-y-2">
            {['critical', 'high', 'medium', 'low'].map((priority) => (
              <label key={priority} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(filters.priority || []).includes(priority)}
                  onChange={() => handleToggle('priority', priority)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {priority}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Assignee */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Assignee</h3>
          <div className="space-y-2">
            {data.teamMembers.map((member) => (
              <label key={member.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(filters.assignee || []).includes(member.id)}
                  onChange={() => handleToggle('assignee', member.id)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <div className="flex items-center space-x-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.initials}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {member.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Companies */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Company</h3>
          <div className="space-y-2">
            {data.companies.map((company) => (
              <label key={company} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(filters.company || []).includes(company)}
                  onChange={() => handleToggle('company', company)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {company}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Project</h3>
          <div className="space-y-2">
            {data.projects.map((project) => (
              <label key={project.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(filters.project || []).includes(project.id)}
                  onChange={() => handleToggle('project', project.id)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {project.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

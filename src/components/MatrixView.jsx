import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';
import ProjectRow from './ProjectRow';
import AddProjectModal from './AddProjectModal';

export default function MatrixView() {
  const { data } = useApp();
  const [showAddProject, setShowAddProject] = useState(false);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-20 bg-white dark:bg-gray-800 shadow-sm">
            <tr>
              <th className="sticky left-0 z-30 bg-white dark:bg-gray-800 border-b-2 border-r-2 border-gray-300 dark:border-gray-600 p-4 text-left min-w-[200px]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Projects
                  </span>
                  <button
                    onClick={() => setShowAddProject(true)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-primary-600 dark:text-primary-400"
                    title="Add Project (P)"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </th>
              {data.companies.map((company) => (
                <th
                  key={company}
                  className="border-b-2 border-gray-300 dark:border-gray-600 p-4 text-center min-w-[180px] bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-800"
                >
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {company}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.projects
              .sort((a, b) => a.order - b.order)
              .map((project, index) => (
                <ProjectRow key={project.id} project={project} index={index} />
              ))}
          </tbody>
        </table>

        {data.projects.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <Plus size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No projects yet</p>
            <p className="text-sm mb-4">Create your first project to get started</p>
            <button
              onClick={() => setShowAddProject(true)}
              className="btn-primary"
            >
              <Plus size={18} className="inline mr-2" />
              Add Project
            </button>
          </div>
        )}
      </div>

      {showAddProject && (
        <AddProjectModal onClose={() => setShowAddProject(false)} />
      )}
    </div>
  );
}

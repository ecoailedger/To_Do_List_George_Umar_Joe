import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MoreVertical, Edit2, Copy, Archive, Trash2 } from 'lucide-react';
import GridCell from './GridCell';

export default function ProjectRow({ project, index }) {
  const { data, updateProject, deleteProject, duplicateProject } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (editName.trim()) {
      updateProject(project.id, { name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleDuplicate = () => {
    duplicateProject(project.id);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}" and all its tasks?`)) {
      deleteProject(project.id);
    }
    setShowMenu(false);
  };

  return (
    <>
      <tr
        className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
        onContextMenu={handleContextMenu}
      >
        <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 border-b border-r-2 border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color }}
              />
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleSaveEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') {
                      setEditName(project.name);
                      setIsEditing(false);
                    }
                  }}
                  className="input-field text-sm py-1"
                  autoFocus
                />
              ) : (
                <span
                  className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400"
                  onDoubleClick={handleEdit}
                  title="Double-click to edit"
                >
                  {project.name}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </td>
        {data.companies.map((company) => (
          <GridCell
            key={`${project.id}-${company}`}
            projectId={project.id}
            company={company}
          />
        ))}
      </tr>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div
            className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[160px] animate-scale-in"
            style={{
              left: menuPosition.x,
              top: menuPosition.y,
            }}
          >
            <button
              onClick={handleEdit}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-300"
            >
              <Edit2 size={16} />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDuplicate}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-300"
            >
              <Copy size={16} />
              <span>Duplicate</span>
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 text-red-600 dark:text-red-400"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </>
  );
}

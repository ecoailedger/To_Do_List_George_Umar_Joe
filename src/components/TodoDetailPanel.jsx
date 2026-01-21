import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Trash2, Calendar, User, Tag, Clock, MessageSquare, CheckSquare, Eye, RefreshCw } from 'lucide-react';
import { formatDate, getRelativeDate, getPriorityColor, getStatusColor, sortTodos } from '../utils/helpers';
import ReactMarkdown from 'react-markdown';

export default function TodoDetailPanel({ projectId, company, onClose }) {
  const { getTodos, addTodo, updateTodo, deleteTodo, data } = useApp();
  const todos = getTodos(projectId, company);
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [showAddTodo, setShowAddTodo] = useState(false);

  const selectedTodo = todos.find(t => t.id === selectedTodoId);

  const project = data.projects.find(p => p.id === projectId);

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-800 shadow-2xl z-40 flex flex-col animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: project?.color }}
            />
            <span>{project?.name}</span>
            <span className="text-gray-400">•</span>
            <span className="text-primary-600 dark:text-primary-400">{company}</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {todos.length} {todos.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Task list */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto scrollbar-thin">
          <div className="p-4 space-y-2">
            <button
              onClick={() => {
                const newTodo = addTodo(projectId, company, { title: 'New Task' });
                setSelectedTodoId(newTodo.id);
              }}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <Plus size={18} />
              <span>Add Task</span>
            </button>

            {sortTodos(todos, 'priority').map((todo) => (
              <div
                key={todo.id}
                onClick={() => setSelectedTodoId(todo.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedTodoId === todo.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`badge ${getPriorityColor(todo.priority)}`}>
                    {todo.priority}
                  </span>
                  <span className={`badge ${getStatusColor(todo.status)}`}>
                    {todo.status.replace('-', ' ')}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                  {todo.title}
                </h3>
                {todo.dueDate && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getRelativeDate(todo.dueDate)}
                  </p>
                )}
              </div>
            ))}

            {todos.length === 0 && (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                <CheckSquare size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tasks yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Task detail */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {selectedTodo ? (
            <TodoEditor
              todo={selectedTodo}
              projectId={projectId}
              company={company}
              onUpdate={updateTodo}
              onDelete={() => {
                deleteTodo(projectId, company, selectedTodo.id);
                setSelectedTodoId(null);
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <div className="text-center">
                <CheckSquare size={64} className="mx-auto mb-4 opacity-50" />
                <p>Select a task to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TodoEditor({ todo, projectId, company, onUpdate, onDelete }) {
  const { data, toggleWatch, reassignTodo, showNotification, getSuggestedAssignee, getSuggestedDueDate } = useApp();
  const [title, setTitle] = useState(todo.title);
  const [notes, setNotes] = useState(todo.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignTarget, setReassignTarget] = useState('');
  const [handoffNote, setHandoffNote] = useState('');

  const handleUpdate = (field, value) => {
    onUpdate(projectId, company, todo.id, { [field]: value });
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comments = [...(todo.comments || []), {
        id: Date.now().toString(),
        text: newComment,
        timestamp: new Date().toISOString(),
      }];
      handleUpdate('comments', comments);
      setNewComment('');
    }
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const subtasks = [...(todo.subtasks || []), {
        id: Date.now().toString(),
        text: newSubtask,
        completed: false,
      }];
      handleUpdate('subtasks', subtasks);
      setNewSubtask('');
    }
  };

  const handleToggleSubtask = (subtaskId) => {
    const subtasks = todo.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    handleUpdate('subtasks', subtasks);
  };

  const isWatching = (todo.watchers || []).includes(data.currentUser);
  const isAssignedToCurrentUser = todo.assignee === data.currentUser;

  const handleReassign = () => {
    if (reassignTarget && reassignTarget !== todo.assignee) {
      reassignTodo(projectId, company, todo.id, reassignTarget, handoffNote);
      showNotification('Task reassigned successfully', 'success');
      setShowReassignModal(false);
      setReassignTarget('');
      setHandoffNote('');
    }
  };

  const handleToggleWatch = () => {
    toggleWatch(projectId, company, todo.id);
    showNotification(isWatching ? 'Stopped watching task' : 'Now watching task', 'success');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => handleUpdate('title', title)}
          className="text-2xl font-bold w-full bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
          placeholder="Task title..."
        />
      </div>

      {/* Watch and Reassign buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleToggleWatch}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-2 text-sm transition-colors ${
            isWatching
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Eye size={16} />
          <span>{isWatching ? 'Watching' : 'Watch'}</span>
        </button>

        <button
          onClick={() => setShowReassignModal(true)}
          className="px-3 py-1.5 rounded-lg flex items-center space-x-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <RefreshCw size={16} />
          <span>Reassign</span>
        </button>
      </div>

      {/* Status and Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={todo.status}
            onChange={(e) => handleUpdate('status', e.target.value)}
            className="input-field"
          >
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="complete">Complete</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Priority
          </label>
          <select
            value={todo.priority}
            onChange={(e) => handleUpdate('priority', e.target.value)}
            className="input-field"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Assignee and Due Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
            <User size={16} />
            <span>Assignee</span>
          </label>
          <select
            value={todo.assignee || ''}
            onChange={(e) => handleUpdate('assignee', e.target.value || null)}
            className="input-field"
          >
            <option value="">Unassigned</option>
            {data.teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
            <Calendar size={16} />
            <span>Due Date</span>
          </label>
          <input
            type="date"
            value={todo.dueDate || ''}
            onChange={(e) => handleUpdate('dueDate', e.target.value || null)}
            className="input-field"
          />
        </div>
      </div>

      {/* Time Estimate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
          <Clock size={16} />
          <span>Time Estimate (hours)</span>
        </label>
        <input
          type="number"
          value={todo.timeEstimate || ''}
          onChange={(e) => handleUpdate('timeEstimate', parseFloat(e.target.value) || null)}
          className="input-field"
          placeholder="e.g., 4.5"
          step="0.5"
          min="0"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
          <Tag size={16} />
          <span>Tags</span>
        </label>
        <input
          type="text"
          value={todo.tags?.join(', ') || ''}
          onChange={(e) => handleUpdate('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
          className="input-field"
          placeholder="Enter tags separated by commas"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes (Markdown supported)
        </label>
        {isEditingNotes ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => {
              handleUpdate('notes', notes);
              setIsEditingNotes(false);
            }}
            className="input-field min-h-[150px] font-mono text-sm"
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditingNotes(true)}
            className="input-field min-h-[100px] cursor-text prose dark:prose-invert max-w-none"
          >
            {notes ? (
              <ReactMarkdown>{notes}</ReactMarkdown>
            ) : (
              <span className="text-gray-400 italic">Click to add notes...</span>
            )}
          </div>
        )}
      </div>

      {/* Subtasks */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
          <CheckSquare size={16} />
          <span>Subtasks</span>
        </label>
        <div className="space-y-2 mb-2">
          {todo.subtasks?.map((subtask) => (
            <div key={subtask.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => handleToggleSubtask(subtask.id)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                {subtask.text}
              </span>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
            placeholder="Add subtask..."
            className="input-field flex-1"
          />
          <button onClick={handleAddSubtask} className="btn-primary">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Comments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
          <MessageSquare size={16} />
          <span>Comments</span>
        </label>
        <div className="space-y-3 mb-3">
          {todo.comments?.map((comment) => (
            <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(comment.timestamp)}
              </p>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            placeholder="Add comment..."
            className="input-field flex-1"
          />
          <button onClick={handleAddComment} className="btn-primary">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Delete button */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this task?')) {
              onDelete();
            }
          }}
          className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
          <span>Delete Task</span>
        </button>
      </div>

      {/* Reassign Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reassign Task
              </h3>
              <button
                onClick={() => setShowReassignModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reassign to
                </label>
                <select
                  value={reassignTarget}
                  onChange={(e) => setReassignTarget(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select team member...</option>
                  {data.teamMembers
                    .filter(m => m.id !== todo.assignee)
                    .map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Handoff note (optional)
                </label>
                <textarea
                  value={handoffNote}
                  onChange={(e) => setHandoffNote(e.target.value)}
                  placeholder="Add context for the new assignee..."
                  className="input-field min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowReassignModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReassign}
                disabled={!reassignTarget}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reassign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

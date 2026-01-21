import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Download, FileSpreadsheet, FileText, FileJson, Copy } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDate } from '../utils/helpers';
import { exportData } from '../utils/storage';

export default function ExportModal({ onClose }) {
  const { data, showNotification } = useApp();
  const [exportType, setExportType] = useState('excel');

  const handleExport = () => {
    switch (exportType) {
      case 'excel':
        exportExcel();
        break;
      case 'csv':
        exportCSV();
        break;
      case 'pdf':
        exportPDF();
        break;
      case 'json':
        exportJSON();
        break;
      case 'clipboard':
        copyToClipboard();
        break;
      default:
        break;
    }
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Create a sheet for each project
    data.projects.forEach(project => {
      const rows = [
        ['Company', 'Title', 'Status', 'Priority', 'Assignee', 'Due Date', 'Notes', 'Tags'],
      ];

      data.companies.forEach(company => {
        const todos = data.todos[`${project.id}-${company}`] || [];
        todos.forEach(todo => {
          const assignee = data.teamMembers.find(m => m.id === todo.assignee);
          rows.push([
            company,
            todo.title,
            todo.status,
            todo.priority,
            assignee?.name || '',
            todo.dueDate ? formatDate(todo.dueDate) : '',
            todo.notes || '',
            todo.tags?.join(', ') || '',
          ]);
        });
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, project.name.substring(0, 31));
    });

    XLSX.writeFile(wb, 'midwich-todo-matrix.xlsx');
    showNotification('Excel file downloaded successfully', 'success');
    onClose();
  };

  const exportCSV = () => {
    const rows = [
      ['Project', 'Company', 'Title', 'Status', 'Priority', 'Assignee', 'Due Date', 'Notes', 'Tags', 'Time Estimate'],
    ];

    data.projects.forEach(project => {
      data.companies.forEach(company => {
        const todos = data.todos[`${project.id}-${company}`] || [];
        todos.forEach(todo => {
          const assignee = data.teamMembers.find(m => m.id === todo.assignee);
          rows.push([
            project.name,
            company,
            todo.title,
            todo.status,
            todo.priority,
            assignee?.name || '',
            todo.dueDate ? formatDate(todo.dueDate) : '',
            todo.notes || '',
            todo.tags?.join(', ') || '',
            todo.timeEstimate || '',
          ]);
        });
      });
    });

    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'midwich-todo-matrix.csv';
    a.click();
    URL.revokeObjectURL(url);

    showNotification('CSV file downloaded successfully', 'success');
    onClose();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.text('Midwich To-Do Matrix Report', 14, yPos);
    yPos += 10;

    // Summary
    doc.setFontSize(12);
    let totalTasks = 0;
    let completedTasks = 0;
    Object.values(data.todos).forEach(todos => {
      totalTasks += todos.length;
      completedTasks += todos.filter(t => t.status === 'complete').length;
    });

    doc.text(`Total Tasks: ${totalTasks}`, 14, yPos);
    yPos += 7;
    doc.text(`Completed: ${completedTasks} (${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)`, 14, yPos);
    yPos += 7;
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yPos);
    yPos += 15;

    // Tasks by project
    data.projects.forEach(project => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text(project.name, 14, yPos);
      yPos += 7;

      const projectTodos = [];
      data.companies.forEach(company => {
        const todos = data.todos[`${project.id}-${company}`] || [];
        todos.forEach(todo => {
          const assignee = data.teamMembers.find(m => m.id === todo.assignee);
          projectTodos.push([
            company,
            todo.title,
            todo.status,
            todo.priority,
            assignee?.name || 'Unassigned',
            todo.dueDate ? formatDate(todo.dueDate) : '',
          ]);
        });
      });

      if (projectTodos.length > 0) {
        doc.autoTable({
          startY: yPos,
          head: [['Company', 'Title', 'Status', 'Priority', 'Assignee', 'Due Date']],
          body: projectTodos,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] },
        });
        yPos = doc.lastAutoTable.finalY + 10;
      } else {
        doc.setFontSize(10);
        doc.text('No tasks', 14, yPos);
        yPos += 10;
      }
    });

    doc.save('midwich-todo-matrix.pdf');
    showNotification('PDF report downloaded successfully', 'success');
    onClose();
  };

  const exportJSON = () => {
    const jsonData = exportData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'midwich-todo-matrix-backup.json';
    a.click();
    URL.revokeObjectURL(url);

    showNotification('JSON backup downloaded successfully', 'success');
    onClose();
  };

  const copyToClipboard = () => {
    let text = 'Midwich To-Do Matrix\n\n';

    data.projects.forEach(project => {
      text += `${project.name}\n${'='.repeat(project.name.length)}\n\n`;

      data.companies.forEach(company => {
        const todos = data.todos[`${project.id}-${company}`] || [];
        if (todos.length > 0) {
          text += `${company}:\n`;
          todos.forEach(todo => {
            const assignee = data.teamMembers.find(m => m.id === todo.assignee);
            text += `  • [${todo.status}] ${todo.title} (${todo.priority})`;
            if (assignee) text += ` - ${assignee.name}`;
            if (todo.dueDate) text += ` - Due: ${formatDate(todo.dueDate)}`;
            text += '\n';
          });
          text += '\n';
        }
      });
      text += '\n';
    });

    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Download size={24} className="text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Export Data
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="radio"
                name="export"
                value="excel"
                checked={exportType === 'excel'}
                onChange={(e) => setExportType(e.target.value)}
                className="w-4 h-4"
              />
              <FileSpreadsheet size={20} className="text-green-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">Excel (.xlsx)</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Formatted spreadsheet with sheets per project</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="radio"
                name="export"
                value="csv"
                checked={exportType === 'csv'}
                onChange={(e) => setExportType(e.target.value)}
                className="w-4 h-4"
              />
              <FileText size={20} className="text-blue-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">CSV</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Flat file with all tasks</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="radio"
                name="export"
                value="pdf"
                checked={exportType === 'pdf'}
                onChange={(e) => setExportType(e.target.value)}
                className="w-4 h-4"
              />
              <FileText size={20} className="text-red-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">PDF Report</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Formatted summary report</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="radio"
                name="export"
                value="json"
                checked={exportType === 'json'}
                onChange={(e) => setExportType(e.target.value)}
                className="w-4 h-4"
              />
              <FileJson size={20} className="text-purple-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">JSON Backup</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Full data backup for reimporting</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="radio"
                name="export"
                value="clipboard"
                checked={exportType === 'clipboard'}
                onChange={(e) => setExportType(e.target.value)}
                className="w-4 h-4"
              />
              <Copy size={20} className="text-orange-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">Copy to Clipboard</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Plain text format for emails/docs</div>
              </div>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleExport} className="btn-primary">
              <Download size={18} className="inline mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { isPast, isToday, addDays, startOfWeek, format } from 'date-fns';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function Dashboard() {
  const { data } = useApp();

  const stats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;
    let upcomingTasks = 0;
    const statusCounts = { 'not-started': 0, 'in-progress': 0, 'blocked': 0, 'complete': 0 };
    const priorityCounts = { low: 0, medium: 0, high: 0, critical: 0 };
    const companyCounts = {};
    const projectCounts = {};

    data.companies.forEach(company => {
      companyCounts[company] = 0;
    });

    data.projects.forEach(project => {
      projectCounts[project.name] = 0;
    });

    Object.entries(data.todos).forEach(([key, todos]) => {
      todos.forEach(todo => {
        totalTasks++;
        statusCounts[todo.status]++;
        priorityCounts[todo.priority]++;

        if (todo.status === 'complete') {
          completedTasks++;
        }

        if (todo.dueDate) {
          const dueDate = new Date(todo.dueDate);
          if (isPast(dueDate) && !isToday(dueDate) && todo.status !== 'complete') {
            overdueTasks++;
          }
          if (dueDate >= new Date() && dueDate <= addDays(new Date(), 7)) {
            upcomingTasks++;
          }
        }

        // Count by company
        const company = key.split('-').pop();
        if (companyCounts[company] !== undefined) {
          companyCounts[company]++;
        }

        // Count by project
        const projectId = key.split('-')[0] + '-' + key.split('-')[1];
        const project = data.projects.find(p => p.id === projectId);
        if (project && projectCounts[project.name] !== undefined) {
          projectCounts[project.name]++;
        }
      });
    });

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      upcomingTasks,
      statusCounts,
      priorityCounts,
      companyCounts,
      projectCounts,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  }, [data]);

  const statusData = Object.entries(stats.statusCounts).map(([name, value]) => ({
    name: name.replace('-', ' '),
    value,
  }));

  const priorityData = Object.entries(stats.priorityCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const companyData = Object.entries(stats.companyCounts).map(([name, value]) => ({
    name,
    tasks: value,
  }));

  const projectData = Object.entries(stats.projectCounts).map(([name, value]) => ({
    name,
    tasks: value,
  }));

  return (
    <div className="h-full overflow-y-auto scrollbar-thin bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={<CheckCircle />}
            color="bg-blue-500"
          />
          <MetricCard
            title="Completed This Week"
            value={stats.completedTasks}
            icon={<CheckCircle />}
            color="bg-green-500"
            subtitle={`${stats.completionRate}% completion rate`}
          />
          <MetricCard
            title="Overdue"
            value={stats.overdueTasks}
            icon={<AlertCircle />}
            color="bg-red-500"
          />
          <MetricCard
            title="Upcoming (7 days)"
            value={stats.upcomingTasks}
            icon={<Clock />}
            color="bg-orange-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tasks by Status
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Distribution */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tasks by Priority
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Tasks by Company */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tasks by Company
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={companyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tasks by Project */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tasks by Project
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color, subtitle }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${color} p-3 rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

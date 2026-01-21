# Midwich To-Do Matrix

A full-featured, interactive to-do list web application with a matrix/grid layout designed for managing tasks across multiple companies and projects.

## Features

### Core Functionality
- **Matrix Layout**: Grid-based interface with companies as columns and projects as rows
- **Project Management**: Add, edit, duplicate, delete, and reorder projects with color coding
- **Rich Task Management**: Full-featured tasks with title, notes (markdown support), assignees, priority, due dates, status, tags, subtasks, comments, and time estimates
- **Dark Mode**: Full dark mode support with system preference detection
- **Data Persistence**: Auto-save to localStorage with data versioning
- **☁️ Cloud Sync** (Optional): Backup and sync data across devices with Supabase integration

### Views
- **Matrix View**: Main grid view with cell summaries and heatmap visualization
- **Dashboard View**: Analytics and charts showing task distribution and metrics
- **Focus Mode**: Distraction-free Kanban board for individual cells
- **Detail Panel**: Slide-out panel for viewing and editing tasks

### Advanced Features
- **Export**: Excel (.xlsx), CSV, PDF reports, JSON backup, and clipboard copy
- **Import**: JSON data import with validation
- **Smart Filters**: Filter by status, priority, assignee, company, and project
- **Global Search**: Search across all tasks, notes, and comments
- **Bulk Actions**: Multi-select and bulk update/delete tasks
- **Keyboard Shortcuts**: Comprehensive keyboard navigation
- **Heat Map**: Visual workload intensity indicators
- **Progress Tracking**: Progress bars and completion metrics
- **Notifications**: Toast notifications for actions
- **Team Management**: Assignee management with avatars

### UI/UX
- Sticky headers and columns for easy navigation
- Smooth animations and micro-interactions
- Responsive design (optimized for desktop, functional on tablet)
- Loading skeletons and empty states
- Tooltips and accessibility features
- Context menus and inline editing

## Tech Stack

- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Excel Export**: SheetJS (xlsx)
- **PDF Export**: jsPDF with autoTable
- **Markdown**: react-markdown
- **Build Tool**: Vite

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

### Keyboard Shortcuts

- `?` - Show keyboard shortcuts help
- `N` - New task in focused cell
- `P` - New project
- `⌘/Ctrl + K` - Focus search
- `D` - Toggle dark mode
- `E` - Export menu
- `F` - Toggle filters
- `Esc` - Close modal/panel
- `Enter` - Open cell detail
- `Double Click` - Enter focus mode

### Project Management

- Click the `+` button in the projects column to add a new project
- Double-click a project name to edit it inline
- Right-click a project for context menu (Edit, Duplicate, Delete)
- Drag projects to reorder them

### Task Management

- Click a cell to open the detail panel and view all tasks
- Click the `+` button in a cell to quickly add a task
- Double-click a cell to enter focus mode (Kanban view)
- Use the detail panel to edit all task properties
- Drag tasks between Kanban columns in focus mode

### Filtering and Search

- Use the global search bar to search across all tasks
- Click the filter icon to open the filter sidebar
- Apply multiple filters to narrow down tasks
- Filters are applied across both matrix and dashboard views

### Export and Backup

- Click the download icon to open export options
- Choose from Excel, CSV, PDF, JSON, or clipboard
- Excel exports include separate sheets per project
- JSON exports can be reimported for backup restoration

## Data Storage

All data is stored in browser localStorage with:
- Automatic saving (500ms debounce)
- Data versioning for future migrations
- Last saved timestamp tracking
- Full export/import capabilities

## Project Structure

```
src/
├── components/        # React components
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── MatrixView.jsx
│   ├── ProjectRow.jsx
│   ├── GridCell.jsx
│   ├── TodoDetailPanel.jsx
│   ├── Dashboard.jsx
│   ├── FilterSidebar.jsx
│   ├── ExportModal.jsx
│   ├── ShortcutsModal.jsx
│   ├── FocusMode.jsx
│   ├── AddProjectModal.jsx
│   └── Notification.jsx
├── context/          # React Context providers
│   └── AppContext.jsx
├── utils/            # Utility functions
│   ├── storage.js    # localStorage utilities
│   └── helpers.js    # Helper functions
├── App.jsx           # Main App component
├── main.jsx          # App entry point
└── index.css         # Global styles

```

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- localStorage support required

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

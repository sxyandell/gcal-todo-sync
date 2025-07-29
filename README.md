# Task Manager - Daily Task List Application

A comprehensive task management application that allows users to create, edit, and manage tasks with automatic daily saving functionality. The application automatically saves the state of your task list at the end of each day, preserving both completed and uncompleted tasks.

## Features

### 🎯 Core Features
- **Task Management**: Create, edit, and delete tasks with descriptions, due dates, and priority levels
- **Checkbox Interface**: Mark tasks as complete with visual feedback (strikethrough for completed tasks)
- **Priority System**: Assign low, medium, or high priority to tasks with color-coded indicators
- **Due Date Support**: Set specific due dates and times for tasks
- **Task Editing**: Full editing capabilities for all task properties

### 💾 Daily Saving System
- **Automatic Daily Save**: Tasks are automatically saved at 11:59 PM each day
- **Manual Save**: Users can manually save their current task state at any time
- **Complete State Preservation**: Both completed and uncompleted tasks are saved
- **Historical Data**: View and restore tasks from previous days

### 📅 History & Restoration
- **Daily History View**: Browse all saved daily task lists
- **Task Restoration**: Restore tasks from any previous day
- **Visual History**: See task completion status and counts for each saved day
- **Safe Restoration**: Confirmation prompts before replacing current tasks

### 🔗 Google Calendar Integration (Optional)
- **Calendar Sync**: Automatically sync tasks to Google Calendar
- **Event Creation**: Tasks with due dates create calendar events
- **Reminder Support**: Calendar events include email and popup reminders
- **OAuth Authentication**: Secure Google Calendar connection

### 🎨 User Interface
- **Modern Design**: Clean, responsive interface with Tailwind CSS
- **Intuitive Navigation**: Easy-to-use task management interface
- **Visual Feedback**: Color-coded priorities and completion states
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks for state management
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Beautiful, customizable icons
- **Axios**: HTTP client for API communication
- **date-fns**: Modern date utility library

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Google APIs**: Google Calendar integration
- **UUID**: Unique identifier generation
- **CORS**: Cross-origin resource sharing support

### Development Tools
- **Nodemon**: Automatic server restart during development
- **Concurrently**: Run frontend and backend simultaneously
- **PostCSS & Autoprefixer**: CSS processing and vendor prefixing

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd gcal-todo-sync
```

### 2. Install Dependencies
```bash
# Install all dependencies (both root and client)
npm run install-all
```

### 3. Environment Configuration
Create a `.env` file in the root directory based on `env.example`:

```env
# Server Configuration
PORT=5000

# Google Calendar Integration (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
GOOGLE_ACCESS_TOKEN=your_access_token
```

### 4. Start the Application
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
npm run server  # Backend only
npm run client  # Frontend only
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage Guide

### Creating Tasks
1. Click "Add a new task" button
2. Fill in the task details:
   - **Title**: Required task name
   - **Description**: Optional detailed description
   - **Due Date**: Optional date and time
   - **Priority**: Low, Medium, or High
3. Click "Add Task" to save

### Managing Tasks
- **Complete Task**: Click the circle icon next to a task
- **Edit Task**: Click the edit (pencil) icon
- **Delete Task**: Click the trash icon
- **View Details**: Task details are displayed below the title

### Daily Saving
- **Automatic**: Tasks are saved automatically at 11:59 PM daily
- **Manual Save**: Click "Save Now" button to save immediately
- **History View**: Click "History" button to view saved daily lists

### Restoring Previous Days
1. Click "History" button
2. Browse through saved daily lists
3. Click "Restore" on any date to load those tasks
4. Confirm the restoration when prompted

### Google Calendar Integration (Optional)
1. Click "Connect Google Calendar" button
2. Complete Google OAuth authentication
3. Tasks with due dates will automatically sync to your calendar
4. Calendar events include reminders and descriptions

## API Endpoints

### Task Management
- `GET /api/todos` - Get all tasks
- `POST /api/todos` - Create new task
- `PUT /api/todos/:id` - Update task
- `DELETE /api/todos/:id` - Delete task

### Daily Saving
- `POST /api/daily-save` - Manually save daily tasks
- `GET /api/daily-saves` - Get all daily saves
- `GET /api/daily-saves/:date` - Get specific daily save
- `POST /api/daily-saves/:date/restore` - Restore tasks from date

### Google Calendar (Optional)
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback handler

## Data Structure

### Task Object
```javascript
{
  id: "uuid",
  title: "Task title",
  description: "Optional description",
  dueDate: "2024-01-01T10:00:00.000Z",
  priority: "low|medium|high",
  completed: false,
  createdAt: "2024-01-01T10:00:00.000Z",
  syncedToGCal: false,
  gcalEventId: "optional_calendar_event_id"
}
```

### Daily Save Object
```javascript
{
  id: "uuid",
  date: "2024-01-01",
  tasks: [/* array of task objects */],
  savedAt: "2024-01-01T23:59:00.000Z"
}
```

## Development

### Project Structure
```
gcal-todo-sync/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/               # React source code
│   ├── package.json       # Frontend dependencies
│   └── tailwind.config.js # Tailwind configuration
├── server/                # Node.js backend
│   └── index.js          # Express server
├── package.json           # Root dependencies
└── README.md             # This file
```

### Available Scripts
- `npm run dev` - Start development server (frontend + backend)
- `npm run server` - Start backend server only
- `npm run client` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run install-all` - Install all dependencies

### Code Organization
- **Frontend**: React components with hooks for state management
- **Backend**: Express routes with middleware for API endpoints
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React for consistent iconography

## Production Deployment

### Frontend Build
```bash
cd client
npm run build
```

### Backend Deployment
- Deploy the `server/` directory to your Node.js hosting platform
- Set up environment variables for production
- Configure CORS for your domain
- Set up a production database (currently using in-memory storage)

### Database Considerations
The current implementation uses in-memory storage. For production:
- Implement a proper database (MongoDB, PostgreSQL, etc.)
- Add data persistence and backup strategies
- Implement user authentication and data isolation
- Add data validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

---

**Note**: This application is designed for personal task management. For team or enterprise use, consider adding user authentication, data encryption, and proper database implementation. 
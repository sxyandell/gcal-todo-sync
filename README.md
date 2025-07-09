# 📝 Todo Sync - Google Calendar Integration

A modern todo list web application that automatically syncs your tasks with Google Calendar. Built with React, Node.js, and the Google Calendar API.

## ✨ Features

- **Beautiful Modern UI**: Clean, responsive design with smooth animations
- **Google Calendar Sync**: Automatically creates calendar events for your todos
- **Priority Levels**: High, medium, and low priority tasks with visual indicators
- **Due Dates**: Set due dates and times for your tasks
- **Real-time Updates**: Instant sync between your todos and Google Calendar
- **Responsive Design**: Works perfectly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Console account

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd gcal-todo-sync
npm run install-all
```

### 2. Google Calendar API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
5. Copy your Client ID and Client Secret

### 3. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your Google API credentials:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
   PORT=5000
   NODE_ENV=development
   ```

### 4. Start the Application

```bash
npm run dev
```

This will start both the backend server (port 5000) and the React frontend (port 3000).

### 5. Connect Google Calendar

1. Open your browser to `http://localhost:3000`
2. Click "Connect Google Calendar"
3. Authorize the application to access your Google Calendar
4. Start adding todos!

## 🛠️ Development

### Project Structure

```
gcal-todo-sync/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styles
│   │   └── index.js       # React entry point
│   └── package.json       # Frontend dependencies
├── server/
│   └── index.js           # Express backend with Google Calendar API
├── package.json           # Backend dependencies
└── README.md
```

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the React frontend
- `npm run build` - Build the React app for production
- `npm run install-all` - Install dependencies for both frontend and backend

### API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

## 🔧 Configuration

### Google Calendar API Permissions

The application requests the following Google Calendar permissions:
- `https://www.googleapis.com/auth/calendar.events` - Create and manage calendar events
- `https://www.googleapis.com/auth/calendar` - Full access to calendars

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Yes |
| `GOOGLE_REDIRECT_URI` | OAuth redirect URI | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |

## 🎨 Features in Detail

### Todo Management
- Create todos with title, description, due date, and priority
- Mark todos as complete/incomplete
- Delete todos (also removes from Google Calendar)
- Visual priority indicators (High: 🔴, Medium: 🟡, Low: 🟢)

### Google Calendar Integration
- Automatic event creation when adding todos
- Events include todo title, description, and due date
- Email and popup reminders (24 hours and 30 minutes before)
- Automatic cleanup when todos are deleted

### User Experience
- Loading states and error handling
- Responsive design for all screen sizes
- Smooth animations and transitions
- Intuitive interface with clear visual feedback

## 🚀 Deployment

### Backend Deployment

1. Set up your production environment variables
2. Deploy to your preferred hosting service (Heroku, Vercel, etc.)
3. Update the redirect URI in Google Cloud Console
4. Update the frontend API URL

### Frontend Deployment

1. Build the React app: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Update the API base URL in the frontend code

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Google Calendar not syncing**
   - Check your Google API credentials
   - Ensure the redirect URI matches exactly
   - Verify the Google Calendar API is enabled

2. **CORS errors**
   - Make sure the backend is running on the correct port
   - Check that the frontend proxy is configured correctly

3. **Authentication issues**
   - Clear browser cache and cookies
   - Re-authenticate with Google

### Getting Help

If you encounter any issues, please:
1. Check the browser console for errors
2. Check the server logs for backend errors
3. Verify your environment variables are set correctly
4. Ensure all dependencies are installed

## 🎯 Roadmap

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User accounts and authentication
- [ ] Todo categories and tags
- [ ] Recurring todos
- [ ] Mobile app
- [ ] Team collaboration features
- [ ] Advanced calendar views
- [ ] Todo templates 
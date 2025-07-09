const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage for todos (in production, use a database)
let todos = [];

// Google Calendar setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Routes
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;
    
    const newTodo = {
      id: uuidv4(),
      title,
      description: description || '',
      dueDate: dueDate || null,
      priority: priority || 'medium',
      completed: false,
      createdAt: new Date().toISOString(),
      syncedToGCal: false
    };

    todos.push(newTodo);

    // Sync to Google Calendar if credentials are available
    if (process.env.GOOGLE_ACCESS_TOKEN) {
      try {
        oauth2Client.setCredentials({
          access_token: process.env.GOOGLE_ACCESS_TOKEN
        });

        const event = {
          summary: `📝 ${title}`,
          description: description || 'Todo task',
          start: {
            dateTime: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: dueDate ? new Date(dueDate).toISOString() : new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            timeZone: 'UTC',
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 30 },
            ],
          },
        };

        const response = await calendar.events.insert({
          calendarId: 'primary',
          resource: event,
        });

        newTodo.syncedToGCal = true;
        newTodo.gcalEventId = response.data.id;
        
        console.log('Todo synced to Google Calendar:', response.data.id);
      } catch (gcalError) {
        console.error('Failed to sync to Google Calendar:', gcalError.message);
      }
    }

    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, priority, completed } = req.body;
  
  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos[todoIndex] = {
    ...todos[todoIndex],
    title: title || todos[todoIndex].title,
    description: description !== undefined ? description : todos[todoIndex].description,
    dueDate: dueDate !== undefined ? dueDate : todos[todoIndex].dueDate,
    priority: priority || todos[todoIndex].priority,
    completed: completed !== undefined ? completed : todos[todoIndex].completed,
    updatedAt: new Date().toISOString()
  };

  res.json(todos[todoIndex]);
});

app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  
  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const todo = todos[todoIndex];

  // Remove from Google Calendar if synced
  if (todo.syncedToGCal && todo.gcalEventId && process.env.GOOGLE_ACCESS_TOKEN) {
    try {
      oauth2Client.setCredentials({
        access_token: process.env.GOOGLE_ACCESS_TOKEN
      });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: todo.gcalEventId,
      });

      console.log('Todo removed from Google Calendar');
    } catch (gcalError) {
      console.error('Failed to remove from Google Calendar:', gcalError.message);
    }
  }

  todos.splice(todoIndex, 1);
  res.json({ message: 'Todo deleted successfully' });
});

// Google Calendar authentication routes
app.get('/api/auth/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  res.json({ authUrl });
});

app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // In production, store tokens securely in a database
    console.log('Access token received:', tokens.access_token);
    
    res.json({ 
      message: 'Authentication successful',
      accessToken: tokens.access_token 
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Google Calendar integration ready');
}); 
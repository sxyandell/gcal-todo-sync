import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  Circle, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  X,
  Settings,
  History,
  Save,
  Edit3,
  ArrowLeft
} from 'lucide-react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ title: '', description: '', dueDate: '', priority: 'medium' });
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingTodo, setEditingTodo] = useState(null);
  const [dailySaves, setDailySaves] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchTodos();
    fetchDailySaves();
    checkAuthStatus();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/todos`);
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailySaves = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/daily-saves`);
      setDailySaves(response.data);
    } catch (error) {
      console.error('Error fetching daily saves:', error);
    }
  };

  const checkAuthStatus = async () => {
    // Check if we have stored auth token
    const token = localStorage.getItem('gcal_access_token');
    if (token) {
      setIsAuthenticated(true);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/google`);
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Error initiating Google auth:', error);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/todos`, newTodo);
      setTodos([...todos, response.data]);
      setNewTodo({ title: '', description: '', dueDate: '', priority: 'medium' });
      setIsAddingTodo(false);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleEditTodo = async (e) => {
    e.preventDefault();
    if (!editingTodo.title.trim()) return;

    try {
      const response = await axios.put(`${API_BASE_URL}/todos/${editingTodo.id}`, editingTodo);
      setTodos(todos.map(todo => todo.id === editingTodo.id ? response.data : todo));
      setEditingTodo(null);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/todos/${id}`, { completed: !completed });
      setTodos(todos.map(todo => todo.id === id ? response.data : todo));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleManualSave = async () => {
    try {
      await axios.post(`${API_BASE_URL}/daily-save`);
      await fetchDailySaves();
      alert('Daily tasks saved successfully!');
    } catch (error) {
      console.error('Error saving daily tasks:', error);
      alert('Failed to save daily tasks');
    }
  };

  const handleRestoreTasks = async (date) => {
    if (window.confirm('Are you sure you want to restore tasks from this date? This will replace your current tasks.')) {
      try {
        const response = await axios.post(`${API_BASE_URL}/daily-saves/${date}/restore`);
        setTodos(response.data.tasks);
        setShowHistory(false);
        setSelectedDate(null);
        alert('Tasks restored successfully!');
      } catch (error) {
        console.error('Error restoring tasks:', error);
        alert('Failed to restore tasks');
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertTriangle size={16} className="text-red-500" />;
      case 'medium': return <Clock size={16} className="text-yellow-500" />;
      case 'low': return <CheckCircle2 size={16} className="text-green-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your todos...</p>
        </div>
      </div>
    );
  }

  if (showHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <button
                onClick={() => setShowHistory(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Tasks
              </button>
              <h1 className="text-3xl font-bold text-gray-800">📅 Daily History</h1>
              <div className="w-20"></div> {/* Spacer for centering */}
            </div>
          </div>

          {/* Daily Saves List */}
          <div className="max-w-2xl mx-auto">
            {dailySaves.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <History size={64} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">No saved history yet</h3>
                <p className="text-gray-500">Your daily saves will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dailySaves.map((save) => (
                  <div key={save.id} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {format(parseISO(save.date), 'MMMM dd, yyyy')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {save.tasks.length} tasks • Saved at {format(parseISO(save.savedAt), 'HH:mm')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRestoreTasks(save.date)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Restore
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {save.tasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="flex items-center gap-2 text-sm">
                          {task.completed ? (
                            <CheckCircle size={14} className="text-green-500" />
                          ) : (
                            <Circle size={14} className="text-gray-400" />
                          )}
                          <span className={task.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                      {save.tasks.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{save.tasks.length - 3} more tasks
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📝 Task Manager
          </h1>
          <p className="text-gray-600">
            Your tasks with automatic daily saving
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-4">
            {!isAuthenticated && (
              <button
                onClick={handleGoogleAuth}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Calendar size={20} />
                Connect Google Calendar
              </button>
            )}
            
            {isAuthenticated && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 size={20} />
                <span>Connected to Google Calendar</span>
              </div>
            )}

            <button
              onClick={handleManualSave}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save size={20} />
              Save Now
            </button>

            <button
              onClick={() => setShowHistory(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <History size={20} />
              History
            </button>
          </div>
        </div>

        {/* Add Todo Form */}
        <div className="max-w-2xl mx-auto mb-8">
          {!isAddingTodo ? (
            <button
              onClick={() => setIsAddingTodo(true)}
              className="w-full bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={24} />
              Add a new task
            </button>
          ) : (
            <form onSubmit={handleAddTodo} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">New Task</h3>
                <button
                  type="button"
                  onClick={() => setIsAddingTodo(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="What needs to be done?"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <textarea
                    placeholder="Description (optional)"
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="datetime-local"
                      value={newTodo.dueDate}
                      onChange={(e) => setNewTodo({...newTodo, dueDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={newTodo.priority}
                      onChange={(e) => setNewTodo({...newTodo, priority: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Edit Todo Form */}
        {editingTodo && (
          <div className="max-w-2xl mx-auto mb-8">
            <form onSubmit={handleEditTodo} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Edit Task</h3>
                <button
                  type="button"
                  onClick={() => setEditingTodo(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Task title"
                    value={editingTodo.title}
                    onChange={(e) => setEditingTodo({...editingTodo, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <textarea
                    placeholder="Description (optional)"
                    value={editingTodo.description}
                    onChange={(e) => setEditingTodo({...editingTodo, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="datetime-local"
                      value={editingTodo.dueDate}
                      onChange={(e) => setEditingTodo({...editingTodo, dueDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={editingTodo.priority}
                      onChange={(e) => setEditingTodo({...editingTodo, priority: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTodo(null)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        <div className="max-w-2xl mx-auto">
          {todos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Circle size={64} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No tasks yet</h3>
              <p className="text-gray-500">Add your first task to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`bg-white rounded-lg shadow-sm border-l-4 ${
                    todo.completed ? 'border-green-500 opacity-75' : 'border-blue-500'
                  } p-4 transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleComplete(todo.id, todo.completed)}
                      className="mt-1 text-gray-400 hover:text-green-500 transition-colors"
                    >
                      {todo.completed ? <CheckCircle size={20} className="text-green-500" /> : <Circle size={20} />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p className={`text-sm mt-1 ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                              {todo.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 mt-2">
                            {todo.dueDate && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Calendar size={14} />
                                {format(new Date(todo.dueDate), 'MMM dd, yyyy HH:mm')}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(todo.priority)}
                              <span className={`text-sm capitalize ${getPriorityColor(todo.priority)}`}>
                                {todo.priority}
                              </span>
                            </div>
                            
                            {todo.syncedToGCal && (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 size={14} />
                                <span className="text-sm">Synced</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingTodo(todo)}
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTodo(todo.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App; 
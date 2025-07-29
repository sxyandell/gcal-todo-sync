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
  ArrowLeft,
  BarChart3,
  TrendingUp,
  CalendarDays,
  Target
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
  const [selectedSave, setSelectedSave] = useState(null);

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
        setSelectedSave(null);
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

  const getCompletionStats = (tasks) => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const priorityBreakdown = {
      high: tasks.filter(task => task.priority === 'high').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      low: tasks.filter(task => task.priority === 'low').length
    };

    return { total, completed, completionRate, priorityBreakdown };
  };

  const handleViewSaveDetails = (save) => {
    setSelectedSave(save);
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
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <button
                onClick={() => {
                  setShowHistory(false);
                  setSelectedSave(null);
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Tasks
              </button>
              <h1 className="text-3xl font-bold text-gray-800">📅 Daily History & Progress</h1>
              <div className="w-20"></div> {/* Spacer for centering */}
            </div>
          </div>

          {/* Daily Saves List */}
          <div className="max-w-4xl mx-auto">
            {dailySaves.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <History size={64} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">No saved history yet</h3>
                <p className="text-gray-500">Your daily saves will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dailySaves.map((save) => {
                  const stats = getCompletionStats(save.tasks);
                  return (
                    <div key={save.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {format(parseISO(save.date), 'MMMM dd, yyyy')}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Saved at {format(parseISO(save.savedAt), 'HH:mm')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{stats.completionRate}%</div>
                          <div className="text-xs text-gray-500">Completion</div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{stats.completed}/{stats.total} tasks</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stats.completionRate}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Priority Breakdown */}
                      <div className="mb-4">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span>High: {stats.priorityBreakdown.high}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span>Medium: {stats.priorityBreakdown.medium}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Low: {stats.priorityBreakdown.low}</span>
                          </div>
                        </div>
                      </div>

                      {/* Task Preview */}
                      <div className="space-y-2 mb-4">
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

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewSaveDetails(save)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                        >
                          <BarChart3 size={14} />
                          View Details
                        </button>
                        <button
                          onClick={() => handleRestoreTasks(save.date)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          Restore
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detailed Save View */}
          {selectedSave && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {format(parseISO(selectedSave.date), 'MMMM dd, yyyy')} - Detailed View
                    </h2>
                    <button
                      onClick={() => setSelectedSave(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Statistics */}
                  {(() => {
                    const stats = getCompletionStats(selectedSave.tasks);
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                          <div className="text-sm text-gray-600">Total Tasks</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                          <div className="text-sm text-gray-600">Completed</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-yellow-600">{stats.total - stats.completed}</div>
                          <div className="text-sm text-gray-600">Remaining</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
                          <div className="text-sm text-gray-600">Success Rate</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* All Tasks */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">All Tasks</h3>
                    {selectedSave.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-4 rounded-lg border-l-4 ${
                          task.completed ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {task.completed ? (
                              <CheckCircle size={20} className="text-green-500" />
                            ) : (
                              <Circle size={20} className="text-gray-400" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                                {task.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 mt-2">
                              {task.dueDate && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Calendar size={14} />
                                  {format(new Date(task.dueDate), 'MMM dd, yyyy HH:mm')}
                                </div>
                              )}
                              
                              <div className="flex items-center gap-1">
                                {getPriorityIcon(task.priority)}
                                <span className={`text-sm capitalize ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => handleRestoreTasks(selectedSave.date)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                    >
                      Restore These Tasks
                    </button>
                    <button
                      onClick={() => setSelectedSave(null)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
              View History
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
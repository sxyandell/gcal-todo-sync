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
  Target,
  Star,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ title: '', section: 'Today', description: '', dueDate: '', priority: 'medium' });
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingTodo, setEditingTodo] = useState(null);
  const [dailySaves, setDailySaves] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSave, setSelectedSave] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedHistory, setExpandedHistory] = useState({});
  const [textContent, setTextContent] = useState('');

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

  const handleTextChange = (e) => {
    const value = e.target.value;
    setTextContent(value);
    
    // Check for [] pattern and convert to task
    const lines = value.split('\n');
    const newLines = [];
    let hasNewTask = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('[] ')) {
        // Convert to task
        const taskTitle = line.substring(3).trim();
        if (taskTitle) {
          createTaskFromText(taskTitle);
          hasNewTask = true;
        }
        // Remove the line from text content
        continue;
      }
      newLines.push(line);
    }
    
    if (hasNewTask) {
      setTextContent(newLines.join('\n'));
    }
  };

  const createTaskFromText = async (taskTitle) => {
    try {
      const newTodo = {
        title: taskTitle,
        section: 'Today',
        description: '',
        dueDate: null,
        priority: 'medium',
      };

      const response = await axios.post(`${API_BASE_URL}/todos`, newTodo);
      setTodos([...todos, response.data]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/todos`, newTodo);
      setTodos([...todos, response.data]);
      setNewTodo({ title: '', section: 'Today', description: '', dueDate: '', priority: 'medium' });
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

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const toggleHistorySection = (sectionName) => {
    setExpandedHistory(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const groupTodosBySection = (todos) => {
    const grouped = {};
    todos.forEach(todo => {
      const section = todo.section || 'Today';
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(todo);
    });
    return grouped;
  };

  const groupHistoryByMonth = (dailySaves) => {
    const grouped = {};
    dailySaves.forEach(save => {
      const date = parseISO(save.date);
      const monthKey = format(date, 'MMMM yyyy');
      const dayKey = format(date, 'M/dd/yyyy EEEE MMMM yyyy');
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {};
      }
      grouped[monthKey][dayKey] = save;
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  const groupedTodos = groupTodosBySection(todos);
  const groupedHistory = groupHistoryByMonth(dailySaves);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <CheckCircle2 size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">To-do</h1>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleManualSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save size={16} />
              Save Now
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <History size={16} />
              {showHistory ? 'Hide History' : 'Show History'}
            </button>

            {!isAuthenticated && (
              <button
                onClick={handleGoogleAuth}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Calendar size={16} />
                Connect Calendar
              </button>
            )}
          </div>
        </div>

        {/* Natural Typing Interface */}
        <div className="mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="mb-2 text-sm text-gray-600">
              Type naturally. Use <code className="bg-gray-200 px-1 rounded">[]</code> and space to create tasks.
            </div>
            <textarea
              value={textContent}
              onChange={handleTextChange}
              placeholder="Type your thoughts here... Use [] and space to create tasks. For example: [] Buy groceries"
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            />
          </div>
        </div>

        {/* Current Tasks */}
        <div className="mb-8">
          {/* Task Sections */}
          {Object.keys(groupedTodos).map(sectionName => (
            <div key={sectionName} className="mb-6">
              <button
                onClick={() => toggleSection(sectionName)}
                className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3 hover:text-gray-600 transition-colors"
              >
                {expandedSections[sectionName] ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
                {sectionName}
              </button>
              
              {expandedSections[sectionName] && (
                <div className="space-y-2 ml-6">
                  {groupedTodos[sectionName].map((todo) => (
                    <div key={todo.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                      <button
                        onClick={() => handleToggleComplete(todo.id, todo.completed)}
                        className="text-gray-400 hover:text-green-500 transition-colors"
                      >
                        {todo.completed ? (
                          <CheckCircle size={20} className="text-green-500" />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <span className={`${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {todo.title}
                        </span>
                        {todo.description && (
                          <p className="text-sm text-gray-500 mt-1">{todo.description}</p>
                        )}
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
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* History Section */}
        {showHistory && (
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Star size={20} className="text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-800">History</h2>
            </div>
            
            {dailySaves.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No saved history yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedHistory).map(([month, days]) => (
                  <div key={month}>
                    <button
                      onClick={() => toggleHistorySection(month)}
                      className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-2 hover:text-gray-600 transition-colors"
                    >
                      {expandedHistory[month] ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                      {month}
                    </button>
                    
                    {expandedHistory[month] && (
                      <div className="ml-6 space-y-2">
                        {Object.entries(days).map(([dayKey, save]) => (
                          <div key={dayKey}>
                            <button
                              onClick={() => toggleHistorySection(dayKey)}
                              className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1 hover:text-gray-600 transition-colors"
                            >
                              {expandedHistory[dayKey] ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                              {format(parseISO(save.date), 'M/dd/yyyy EEEE MMMM yyyy')}
                            </button>
                            
                            {expandedHistory[dayKey] && (
                              <div className="ml-6 space-y-1">
                                {save.tasks.map((task) => (
                                  <div key={task.id} className="flex items-center gap-2 text-sm">
                                    {task.completed ? (
                                      <CheckCircle size={16} className="text-green-500" />
                                    ) : (
                                      <Circle size={16} className="text-gray-400" />
                                    )}
                                    <span className={task.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                                      {task.title}
                                    </span>
                                  </div>
                                ))}
                                <button
                                  onClick={() => handleRestoreTasks(save.date)}
                                  className="text-blue-600 hover:text-blue-700 text-xs mt-2"
                                >
                                  Restore this day
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Todo Modal */}
        {editingTodo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Edit Task</h3>
                  <button
                    onClick={() => setEditingTodo(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleEditTodo} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Task title"
                      value={editingTodo.title}
                      onChange={(e) => setEditingTodo({...editingTodo, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <select
                      value={editingTodo.section || 'Today'}
                      onChange={(e) => setEditingTodo({...editingTodo, section: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Today">Today</option>
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Health">Health</option>
                    </select>
                  </div>
                  
                  <div>
                    <textarea
                      placeholder="Description (optional)"
                      value={editingTodo.description}
                      onChange={(e) => setEditingTodo({...editingTodo, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows="3"
                    />
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
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
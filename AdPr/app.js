// API Configuration
const API_URL = 'http://localhost:4000/api';

// Authentication Helper
function getAuthToken() {
    return localStorage.getItem('token');
}

function getUserEmail() {
    return localStorage.getItem('userEmail');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
}

// Check authentication on page load
function checkAuth() {
    const token = getAuthToken();
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Class to represent an individual task
class Task {
    constructor(id, title, description = '', completed = false, createdAt = new Date()) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.completed = completed;
        this.createdAt = new Date(createdAt);
    }
}

// Class to manage all tasks with API integration
class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
    }

    // Get authorization headers
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        };
    }

    // Load tasks from API
    async loadTasks() {
        try {
            const response = await fetch(`${API_URL}/items`, {
                headers: this.getHeaders()
            });

            if (response.status === 401) {
                logout();
                return;
            }

            const data = await response.json();
            
            if (response.ok) {
                this.tasks = data.items.map(item => 
                    new Task(item.id, item.title, item.description, false, item.created_at)
                );
                return { success: true };
            } else {
                throw new Error(data.error || 'Failed to load tasks');
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            return { success: false, message: error.message };
        }
    }

    // Add a new task
    async addTask(name) {
        if (!name || name.trim() === '') {
            return { success: false, message: 'Task name cannot be empty' };
        }

        try {
            const response = await fetch(`${API_URL}/items`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    title: name.trim(),
                    description: ''
                })
            });

            if (response.status === 401) {
                logout();
                return;
            }

            const data = await response.json();

            if (response.ok) {
                const newTask = new Task(data.item.id, data.item.title, data.item.description, false, data.item.created_at);
                this.tasks.unshift(newTask);
                return { success: true, task: newTask };
            } else {
                throw new Error(data.error || 'Failed to add task');
            }
        } catch (error) {
            console.error('Error adding task:', error);
            return { success: false, message: error.message };
        }
    }

    // Delete a task by ID
    async deleteTask(id) {
        try {
            const response = await fetch(`${API_URL}/items/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (response.status === 401) {
                logout();
                return false;
            }

            if (response.ok || response.status === 204) {
                const index = this.tasks.findIndex(task => task.id === id);
                if (index !== -1) {
                    this.tasks.splice(index, 1);
                }
                return true;
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            return false;
        }
    }

    // Get task by ID
    getTaskById(id) {
        return this.tasks.find(task => task.id === id);
    }

    // Update task name
    async updateTaskName(id, newName) {
        if (!newName || newName.trim() === '') {
            return false;
        }

        try {
            const task = this.getTaskById(id);
            if (!task) return false;

            const response = await fetch(`${API_URL}/items/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    title: newName.trim(),
                    description: task.description || ''
                })
            });

            if (response.status === 401) {
                logout();
                return false;
            }

            const data = await response.json();

            if (response.ok) {
                task.title = data.item.title;
                return true;
            } else {
                throw new Error(data.error || 'Failed to update task');
            }
        } catch (error) {
            console.error('Error updating task:', error);
            return false;
        }
    }

    // Toggle task status (for local display only)
    toggleTaskStatus(id) {
        const task = this.getTaskById(id);
        if (task) {
            task.completed = !task.completed;;
    // Toggle task status (for local display only)
    toggleTaskStatus(id) {
        const task = this.getTaskById(id);
        if (task) {
            task.completed = !task.completed;
            return true;
        }
        return false;
    }

    // Get tasks according to current filter
    getFilteredTasks() {
        switch(this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            default:
                return [...this.tasks];
        }
    }

    // Set current filter
    setFilter(filter) {
        if (['all', 'pending', 'completed'].includes(filter)) {
            this.currentFilter = filter;
        }
    }

    // Get statistics
    getStatistics() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        return { total, completed, pending };
    }
}

// Class to handle the user interface
class TaskInterface {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this.editingTask = null;
        this.initializeDOMElements();
        this.setupEventListeners();
        this.displayUserInfo();
        this.initialize();
    }

    // Initialize app - load tasks async
    async initialize() {
        await this.loadTasks();
        this.updateCurrentYear();
    }

    // Load tasks from API
    async loadTasks() {
        const result = await this.taskManager.loadTasks();
        if (result.success) {
            this.renderTasks();
            this.updateStatistics();
            this.updateEmptyState();
        }
    }

    // Display user info
    displayUserInfo() {
        const userEmail = getUserEmail();
        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement && userEmail) {
            userInfoElement.innerHTML = `
                <i class="fas fa-user-circle"></i>
                <span>${userEmail}</span>
            `;
        }
    }

    // Initialize DOM element references
    initializeDOMElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addButton = document.getElementById('addTaskBtn');
        this.tasksList = document.getElementById('tasksList');
        this.errorMessage = document.getElementById('errorMessage');
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.emptyState = document.getElementById('emptyState');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.editModal = document.getElementById('editModal');
        this.editInput = document.getElementById('editTaskInput');
        this.saveEditButton = document.getElementById('saveEditBtn');
        this.cancelEditButton = document.getElementById('cancelEditBtn');
        this.closeModalButton = document.querySelector('.close-modal');
        this.logoutButton = document.getElementById('logoutBtn');
    }

    // Configure event listeners
    setupEventListeners() {
        // Add task
        this.addButton.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Logout
        if (this.logoutButton) {
            this.logoutButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    logout();
                }
            });
        }

        // Filters
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.setFilter(filter);
            });
        });

        // Edit modal
        this.saveEditButton.addEventListener('click', () => this.saveEdit());
        this.cancelEditButton.addEventListener('click', () => this.closeModal());
        this.closeModalButton.addEventListener('click', () => this.closeModal());
        
        // Close modal when clicking outside
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeModal();
        });
    }

    // Add a new task
    async addTask() {
        const taskName = this.taskInput.value;
        this.addButton.disabled = true;
        this.addButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        
        const result = await this.taskManager.addTask(taskName);
        
        if (result.success) {
            this.taskInput.value = '';
            this.showError('');
            this.renderTasks();
            this.updateStatistics();
            this.updateEmptyState();
        } else {
            this.showError(result.message);
        }
        
        this.addButton.disabled = false;
        this.addButton.innerHTML = '<i class="fas fa-plus"></i> Add Task';
        this.taskInput.focus();
    }

    // Show error message
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.opacity = message ? '1' : '0';
    }

    // Delete a task
    async deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            const deleted = await this.taskManager.deleteTask(id);
            
            if (deleted) {
                this.renderTasks();
                this.updateStatistics();
                this.updateEmptyState();
            }
        }
    }

    // Toggle task completion status
    toggleTaskStatus(id) {
        const toggled = this.taskManager.toggleTaskStatus(id);
        
        if (toggled) {
            this.renderTasks();
            this.updateStatistics();
        }
    }

    // Open modal to edit task
    openEditModal(id) {
        const task = this.taskManager.getTaskById(id);
        
        if (task) {
            this.editingTask = id;
            this.editInput.value = task.title;
            this.editModal.style.display = 'flex';
            this.editInput.focus();
        }
    }

    // Save edit changes
    async saveEdit() {
        if (this.editingTask) {
            const newName = this.editInput.value;
            this.saveEditButton.disabled = true;
            this.saveEditButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            
            const updated = await this.taskManager.updateTaskName(this.editingTask, newName);
            
            if (updated) {
                this.renderTasks();
                this.closeModal();
            } else {
                alert('Task name cannot be empty');
            }
            
            this.saveEditButton.disabled = false;
            this.saveEditButton.innerHTML = '<i class="fas fa-save"></i> Save';
        }
    }

    // Close edit modal
    closeModal() {
        this.editModal.style.display = 'none';
        this.editingTask = null;
        this.editInput.value = '';
    }

    // Set active filter
    setFilter(filter) {
        // Update filter buttons
        this.filterButtons.forEach(button => {
            if (button.dataset.filter === filter) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        // Apply filter in the manager
        this.taskManager.setFilter(filter);
        
        // Re-render tasks
        this.renderTasks();
    }

    // Render all tasks
    renderTasks() {
        // Clear list
        this.tasksList.innerHTML = '';
        
        // Get filtered tasks
        const filteredTasks = this.taskManager.getFilteredTasks();
        
        // If no tasks with applied filter, show empty state
        if (filteredTasks.length === 0) {
            this.updateEmptyState();
            return;
        }
        
        // Create element for each task
        filteredTasks.forEach(task => {
            const listItem = this.createTaskElement(task);
            this.tasksList.appendChild(listItem);
        });
    }

    // Create HTML element for a task
    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;
        
        // Task content
        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${this.escapeHTML(task.title)}</span>
            </div>
            <div class="task-actions">
                <button class="btn-edit" title="Edit task">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" title="Delete task">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        // Add event listeners to buttons
        const checkbox = li.querySelector('.task-checkbox');
        const editButton = li.querySelector('.btn-edit');
        const deleteButton = li.querySelector('.btn-delete');
        
        checkbox.addEventListener('change', () => this.toggleTaskStatus(task.id));
        editButton.addEventListener('click', () => this.openEditModal(task.id));
        deleteButton.addEventListener('click', () => this.deleteTask(task.id));
        
        return li;
    }

    // Update statistics
    updateStatistics() {
        const { total, completed } = this.taskManager.getStatistics();
        this.totalTasks.textContent = `Total: ${total}`;
        this.completedTasks.textContent = `Completed: ${completed}`;
    }

    // Show/hide empty state
    updateEmptyState() {
        const filteredTasks = this.taskManager.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.emptyState.style.display = 'block';
            this.tasksList.style.display = 'none';
        } else {
            this.emptyState.style.display = 'none';
            this.tasksList.style.display = 'block';
        }
    }

    // Update current year in footer
    updateCurrentYear() {
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    }

    // Function to escape HTML (basic XSS prevention)
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    if (!checkAuth()) {
        return;
    }

    const taskManager = new TaskManager();
    const taskInterface = new TaskInterface(taskManager);
    
    // Make the application global for debugging (optional)
    window.app = {
        taskManager,
        taskInterface
    };
    
    console.log('Task Management Application started successfully');
});
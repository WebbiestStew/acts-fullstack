// Class to represent an individual task
class Task {
    constructor(id, name, completed = false) {
        this.id = id;
        this.name = name;
        this.completed = completed;
        this.createdDate = new Date();
    }

    // Method to toggle completion status
    toggleStatus() {
        this.completed = !this.completed;
        return this;
    }

    // Method to update the task name
    updateName(newName) {
        if (newName && newName.trim() !== '') {
            this.name = newName.trim();
            return true;
        }
        return false;
    }
}

// Class to manage all tasks
class TaskManager {
    constructor() {
        this.tasks = [];
        this.idCounter = 1;
        this.currentFilter = 'all';
        this.loadStoredTasks();
    }

    // Load tasks from localStorage if they exist
    loadStoredTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            const tasksData = JSON.parse(savedTasks);
            this.tasks = tasksData.map(task => {
                const newTask = new Task(task.id, task.name, task.completed);
                newTask.createdDate = new Date(task.createdDate);
                return newTask;
            });
            
            // Find the highest ID to continue from there
            const maxId = this.tasks.reduce((max, task) => Math.max(max, task.id), 0);
            this.idCounter = maxId + 1;
        }
    }

    // Save tasks to localStorage
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    // Add a new task
    addTask(name) {
        if (!name || name.trim() === '') {
            return { success: false, message: 'Task name cannot be empty' };
        }

        const newTask = new Task(this.idCounter++, name.trim());
        this.tasks.push(newTask);
        this.saveTasks();
        return { success: true, task: newTask };
    }

    // Delete a task by ID
    deleteTask(id) {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index !== -1) {
            this.tasks.splice(index, 1);
            this.saveTasks();
            return true;
        }
        return false;
    }

    // Get task by ID
    getTaskById(id) {
        return this.tasks.find(task => task.id === id);
    }

    // Toggle task status
    toggleTaskStatus(id) {
        const task = this.getTaskById(id);
        if (task) {
            task.toggleStatus();
            this.saveTasks();
            return true;
        }
        return false;
    }

    // Update task name
    updateTaskName(id, newName) {
        const task = this.getTaskById(id);
        if (task && task.updateName(newName)) {
            this.saveTasks();
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
                return [...this.tasks]; // Return array copy
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
        this.renderTasks();
        this.updateStatistics();
        this.updateEmptyState();
        this.updateCurrentYear();
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
    }

    // Configure event listeners
    setupEventListeners() {
        // Add task
        this.addButton.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

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
    addTask() {
        const taskName = this.taskInput.value;
        const result = this.taskManager.addTask(taskName);
        
        if (result.success) {
            this.taskInput.value = '';
            this.showError('');
            this.renderTasks();
            this.updateStatistics();
            this.updateEmptyState();
        } else {
            this.showError(result.message);
        }
        
        this.taskInput.focus();
    }

    // Show error message
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.opacity = message ? '1' : '0';
    }

    // Delete a task
    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            const deleted = this.taskManager.deleteTask(id);
            
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
            this.editInput.value = task.name;
            this.editModal.style.display = 'flex';
            this.editInput.focus();
        }
    }

    // Save edit changes
    saveEdit() {
        if (this.editingTask) {
            const newName = this.editInput.value;
            const updated = this.taskManager.updateTaskName(this.editingTask, newName);
            
            if (updated) {
                this.renderTasks();
                this.closeModal();
            } else {
                alert('Task name cannot be empty');
            }
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
                <span class="task-text ${task.completed ? 'completed' : ''}">${this.escapeHTML(task.name)}</span>
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
    const taskManager = new TaskManager();
    const taskInterface = new TaskInterface(taskManager);
    
    // Make the application global for debugging (optional)
    window.app = {
        taskManager,
        taskInterface
    };
    
    console.log('Task Management Application started successfully');
});
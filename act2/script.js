const newTaskInput = document.getElementById('new-task');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('tasks-list');
const deleteTaskButton = document.getElementById('delete-task');
const editTaskButton = document.getElementById('edit-task');

let selectedTask = null;

// Add task
addTaskButton.addEventListener('click', () => {
    const taskText = newTaskInput.value.trim();
    if (taskText !== '') {
        const listItem = document.createElement('li');
        listItem.textContent = taskText;
        
        // Click to select task
        listItem.addEventListener('click', () => {
            // Remove selection from previous task
            if (selectedTask) {
                selectedTask.style.backgroundColor = '';
                selectedTask.style.borderLeft = '4px solid #667eea';
            }
            // Select new task
            selectedTask = listItem;
            listItem.style.backgroundColor = '#e3f2fd';
            listItem.style.borderLeft = '6px solid #2196F3';
        });
        
        taskList.appendChild(listItem);
        newTaskInput.value = '';
    }
});

// Delete selected task
deleteTaskButton.addEventListener('click', () => {
    if (selectedTask) {
        selectedTask.remove();
        selectedTask = null;
    } else {
        alert('Please select a task to delete');
    }
});

// Edit selected task
editTaskButton.addEventListener('click', () => {
    if (selectedTask) {
        const newText = prompt('Edit task:', selectedTask.textContent);
        if (newText !== null && newText.trim() !== '') {
            selectedTask.textContent = newText.trim();
        }
    } else {
        alert('Please select a task to edit');
    }
});
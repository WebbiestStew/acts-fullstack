// Clase Tarea - Representa cada tarea individual
class Tarea {
    constructor(nombre, id = Date.now()) {
        this.id = id;
        this.nombre = nombre;
        this.completada = false;
    }

    // Método para alternar el estado de completada
    toggleEstado() {
        this.completada = !this.completada;
    }

    // Método para editar el contenido de la tarea
    editar(nuevoNombre) {
        if (nuevoNombre && nuevoNombre.trim() !== '') {
            this.nombre = nuevoNombre.trim();
            return true;
        }
        return false;
    }

    // Método para obtener el HTML de la tarea usando template literals
    generarHTML() {
        return `
            <li data-id="${this.id}" class="${this.completada ? 'completada' : ''}">
                <input type="checkbox" class="checkbox-tarea" ${this.completada ? 'checked' : ''}>
                <span class="texto-tarea">${this.nombre}</span>
            </li>
        `;
    }
}

// Clase GestorDeTareas - Gestiona todas las tareas
class GestorDeTareas {
    constructor() {
        this.tareas = [];
        this.tareaSeleccionada = null;
    }

    // Agregar una nueva tarea
    agregarTarea(nombre) {
        if (nombre && nombre.trim() !== '') {
            const nuevaTarea = new Tarea(nombre.trim());
            this.tareas.push(nuevaTarea);
            return nuevaTarea;
        }
        return null;
    }

    // Eliminar una tarea por ID
    eliminarTarea(id) {
        const index = this.tareas.findIndex(tarea => tarea.id === id);
        if (index !== -1) {
            this.tareas.splice(index, 1);
            if (this.tareaSeleccionada?.id === id) {
                this.tareaSeleccionada = null;
            }
            return true;
        }
        return false;
    }

    // Editar una tarea por ID
    editarTarea(id, nuevoNombre) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            return tarea.editar(nuevoNombre);
        }
        return false;
    }

    // Alternar estado de completada de una tarea
    toggleEstadoTarea(id) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            tarea.toggleEstado();
            return true;
        }
        return false;
    }

    // Obtener tarea por ID
    obtenerTarea(id) {
        return this.tareas.find(t => t.id === id);
    }

    // Renderizar todas las tareas usando forEach
    renderizarTareas(contenedor) {
        contenedor.innerHTML = '';
        
        this.tareas.forEach(tarea => {
            contenedor.innerHTML += tarea.generarHTML();
        });

        // Agregar event listeners después de renderizar
        this.agregarEventListeners(contenedor);
    }

    // Agregar event listeners a las tareas renderizadas
    agregarEventListeners(contenedor) {
        const items = contenedor.querySelectorAll('li');
        
        items.forEach(item => {
            const id = parseInt(item.dataset.id);
            
            // Click en el item para seleccionar
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('checkbox-tarea')) {
                    this.seleccionarTarea(id, item);
                }
            });

            // Click en el checkbox para alternar completada
            const checkbox = item.querySelector('.checkbox-tarea');
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleEstadoTarea(id);
                this.renderizarTareas(contenedor);
            });
        });
    }

    // Seleccionar una tarea
    seleccionarTarea(id, elemento) {
        // Remover selección previa
        const items = document.querySelectorAll('#tasks-list li');
        items.forEach(item => item.classList.remove('seleccionada'));

        // Agregar selección a la nueva tarea
        elemento.classList.add('seleccionada');
        this.tareaSeleccionada = this.obtenerTarea(id);
    }
}

// Inicializar la aplicación
const gestor = new GestorDeTareas();
const newTaskInput = document.getElementById('new-task');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('tasks-list');
const deleteTaskButton = document.getElementById('delete-task');
const editTaskButton = document.getElementById('edit-task');

// Event listener para agregar tarea
addTaskButton.addEventListener('click', () => {
    const taskText = newTaskInput.value;
    const tarea = gestor.agregarTarea(taskText);
    
    if (tarea) {
        gestor.renderizarTareas(taskList);
        newTaskInput.value = '';
    }
});

// Event listener para agregar tarea con Enter
newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTaskButton.click();
    }
});

// Event listener para eliminar tarea
deleteTaskButton.addEventListener('click', () => {
    if (gestor.tareaSeleccionada) {
        gestor.eliminarTarea(gestor.tareaSeleccionada.id);
        gestor.renderizarTareas(taskList);
    } else {
        alert('Please select a task to delete');
    }
});

// Event listener para editar tarea
editTaskButton.addEventListener('click', () => {
    if (gestor.tareaSeleccionada) {
        const nuevoTexto = prompt('Edit task:', gestor.tareaSeleccionada.nombre);
        if (nuevoTexto !== null && gestor.editarTarea(gestor.tareaSeleccionada.id, nuevoTexto)) {
            gestor.renderizarTareas(taskList);
        }
    } else {
        alert('Please select a task to edit');
    }
});

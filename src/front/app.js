// Variables globales
const API_URL = 'http://localhost:3000'; // Reemplaza con la URL de tu API

// Función de inicio de sesión
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token); // save token
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('taskManager').classList.remove('hidden');
            loadTasks();
        } else {
            alert('Error de inicio de sesión');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cargar tareas
async function loadTasks() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const tasks = await response.json();
            displayTasks(tasks);
        } else {
            alert('Error al cargar las tareas');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Mostrar tareas
function displayTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'bg-white p-4 rounded shadow';
        taskElement.innerHTML = `
            <h3 class="font-bold">${task.title}</h3>
            <p>${task.description || 'Sin descripción'}</p>
            <p>Estado: ${task.status_value}</p>
            <p>Fecha límite: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No especificada'}</p>
            <button onclick="deleteTask(${task.id_task})" class="bg-red-500 text-white px-2 py-1 rounded mt-2">Eliminar</button>
        `;
        taskList.appendChild(taskElement);
    });
}

// Agregar tarea
document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const task = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        status_id: document.getElementById('status').value,
        due_date: document.getElementById('dueDate').value
    };

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(task)
        });

        if (response.ok) {
            loadTasks();
            document.getElementById('taskForm').reset();
        } else {
            const errorData = await response.json();
            alert('Error al crear la tarea: ' + (errorData.message || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear la tarea');
    }
});

// Eliminar tarea
async function deleteTask(taskId) {
    console.log('Deleting task with ID:', taskId); // Add this line for debugging
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            loadTasks();
        } else {
            const errorText = await response.text();
            console.error('Error response:', response.status, errorText);
            alert(`Error al eliminar la tarea: ${response.status} ${errorText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error al eliminar la tarea: ${error.message}`);
    }
}

// Cargar tareas al iniciar la aplicación si hay un token
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('taskManager').classList.remove('hidden');
        loadTasks();
    }
});
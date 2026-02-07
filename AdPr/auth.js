// API Configuration
// Automatically use the right API based on where the app is running
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:4000/api'  // Local development
  : 'https://YOUR-BACKEND-URL.onrender.com/api';  // Production (UPDATE THIS AFTER DEPLOYING TO RENDER)

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const loadingSpinner = document.getElementById('loadingSpinner');

// Toggle between login and register forms
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    clearErrors();
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    clearErrors();
});

// Password visibility toggle
const setupPasswordToggle = (toggleId, inputId) => {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    
    if (toggle && input) {
        toggle.addEventListener('click', () => {
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            toggle.classList.toggle('fa-eye');
            toggle.classList.toggle('fa-eye-slash');
        });
    }
};

setupPasswordToggle('toggleLoginPassword', 'loginPassword');
setupPasswordToggle('toggleRegisterPassword', 'registerPassword');
setupPasswordToggle('toggleConfirmPassword', 'confirmPassword');

// Clear error messages
function clearErrors() {
    document.getElementById('loginError').classList.remove('active');
    document.getElementById('registerError').classList.remove('active');
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('active');
}

// Show/hide loading spinner
function setLoading(isLoading) {
    if (isLoading) {
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
        if (loginForm.classList.contains('hidden')) {
            registerForm.classList.remove('hidden');
        } else {
            loginForm.classList.remove('hidden');
        }
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Login Form Submit
loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Validation
    if (!email || !password) {
        showError('loginError', 'Please fill in all fields');
        return;
    }

    if (!isValidEmail(email)) {
        showError('loginError', 'Please enter a valid email address');
        return;
    }

    // Disable button and show loading
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.disabled = true;
    setLoading(true);

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Store token and email in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', email);

        // Redirect to main page
        window.location.href = 'index.html';

    } catch (error) {
        setLoading(false);
        loginBtn.disabled = false;
        showError('loginError', error.message || 'Failed to login. Please try again.');
    }
});

// Register Form Submit
registerFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation
    if (!email || !password || !confirmPassword) {
        showError('registerError', 'Please fill in all fields');
        return;
    }

    if (!isValidEmail(email)) {
        showError('registerError', 'Please enter a valid email address');
        return;
    }

    if (password.length < 6) {
        showError('registerError', 'Password must be at least 6 characters long');
        return;
    }

    if (password !== confirmPassword) {
        showError('registerError', 'Passwords do not match');
        return;
    }

    // Disable button and show loading
    const registerBtn = document.getElementById('registerBtn');
    registerBtn.disabled = true;
    setLoading(true);

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        // Auto-login after registration
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
            throw new Error('Registration successful! Please login.');
        }

        // Store token and email in localStorage
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('userEmail', email);

        // Redirect to main page
        window.location.href = 'index.html';

    } catch (error) {
        setLoading(false);
        registerBtn.disabled = false;
        showError('registerError', error.message || 'Failed to register. Please try again.');
    }
});

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        // Redirect to main page if already logged in
        window.location.href = 'index.html';
    }
});

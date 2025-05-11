// Agri-Energy Connect - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // API base URL
    const API_URL = 'http://localhost:5019/api';

    // State management
    let authToken = localStorage.getItem('token');
    let userRole = localStorage.getItem('userRole');
    let farmerId = localStorage.getItem('farmerId');
    let username = localStorage.getItem('username');

    // DOM elements - Auth
    const authSection = document.getElementById('auth-section');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginFormElement = document.getElementById('login-form-element');
    const loginUsername = document.getElementById('login-username');
    const loginPassword = document.getElementById('login-password');
    const loginMessage = document.getElementById('login-message');
    const backToLoginBtn = document.getElementById('back-to-login');
    
    // DOM elements - Header
    const header = document.getElementById('header');
    const navLinks = document.getElementById('nav-links');
    const userInfo = document.getElementById('user-info');
    
    // DOM elements - Dashboards
    const farmerDashboard = document.getElementById('farmer-dashboard');
    const employeeDashboard = document.getElementById('employee-dashboard');
    
    // DOM elements - Farmer
    const addProductForm = document.getElementById('add-product-form');
    const productName = document.getElementById('product-name');
    const productCategory = document.getElementById('product-category');
    const productionDate = document.getElementById('production-date');
    const loadProductsFarmerBtn = document.getElementById('load-products-farmer-btn');
    const productsListFarmer = document.getElementById('products-list-farmer');
    const addProductMessage = document.getElementById('add-product-message');
    
    // DOM elements - Employee
    const addFarmerForm = document.getElementById('add-farmer-form');
    const farmerUsername = document.getElementById('farmer-username');
    const farmerPassword = document.getElementById('farmer-password');
    const farmerName = document.getElementById('farmer-name');
    const farmerLocation = document.getElementById('farmer-location');
    const farmerContact = document.getElementById('farmer-contact');
    const farmerSelect = document.getElementById('farmer-select');
    const loadProductsEmployeeBtn = document.getElementById('load-products-employee-btn');
    const productsListEmployee = document.getElementById('products-list-employee');
    const addFarmerMessage = document.getElementById('add-farmer-message');

    // Check if user is already logged in
    if (authToken && userRole) {
        showDashboard(userRole);
    }

    // Event Listeners - Auth Tabs
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });

    backToLoginBtn.addEventListener('click', () => {
        loginTab.click();
    });

    // Event Listeners - Forms
    loginFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        login();
    });

    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addProduct();
    });

    addFarmerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addFarmer();
    });

    // Event Listeners - Buttons
    loadProductsFarmerBtn.addEventListener('click', loadFarmerProducts);
    loadProductsEmployeeBtn.addEventListener('click', loadProductsByFarmer);

    // Login function
    async function login() {
        const username = loginUsername.value;
        const password = loginPassword.value;

        if (!username || !password) {
            showMessage(loginMessage, 'Please enter both username and password.', 'message-error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Invalid credentials');
            }

            const data = await response.json();
            
            // Save auth data
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('username', username);
            
            if (data.farmerId) {
                localStorage.setItem('farmerId', data.farmerId);
            }
            
            // Update state
            authToken = data.token;
            userRole = data.role;
            farmerId = data.farmerId;
            
            // Show appropriate dashboard
            showDashboard(data.role);
            
            // Reset login form
            loginFormElement.reset();
            
        } catch (error) {
            showMessage(loginMessage, error.message, 'message-error');
        }
    }

    // Logout function
    function logout() {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('farmerId');
        localStorage.removeItem('username');
        
        // Reset state
        authToken = null;
        userRole = null;
        farmerId = null;
        username = null;
        
        // Show auth section, hide dashboards
        authSection.classList.remove('hidden');
        header.classList.add('hidden');
        farmerDashboard.classList.add('hidden');
        employeeDashboard.classList.add('hidden');
        
        // Reset login form
        loginFormElement.reset();
        loginMessage.classList.add('hidden');
    }

    // Show dashboard based on user role
    function showDashboard(role) {
        // Hide auth section, show header
        authSection.classList.add('hidden');
        header.classList.remove('hidden');
        
        // Update user info in header
        updateUserInfo();
        
        // Update navigation links
        updateNavLinks(role);
        
        // Show appropriate dashboard
        if (role === 'Farmer') {
            farmerDashboard.classList.remove('hidden');
            employeeDashboard.classList.add('hidden');
            // Load farmer's products
            loadFarmerProducts();
        } else if (role === 'Employee') {
            employeeDashboard.classList.remove('hidden');
            farmerDashboard.classList.add('hidden');
            // Load farmers for dropdown
            loadFarmers();
        }
    }

    // Update user info in header
    function updateUserInfo() {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            const initial = storedUsername.charAt(0).toUpperCase();
            userInfo.innerHTML = `
                <div class="user-avatar">${initial}</div>
                <span>${storedUsername}</span>
                <button id="logout-btn" class="btn btn-sm btn-outline">Logout</button>
            `;
            
            // Add event listener to logout button
            document.getElementById('logout-btn').addEventListener('click', logout);
        }
    }

    // Update navigation links based on role
    function updateNavLinks(role) {
        if (role === 'Farmer') {
            navLinks.innerHTML = `
                <a href="#" class="nav-link active">Dashboard</a>
                <a href="#" class="nav-link">Products</a>
                <a href="#" class="nav-link">Profile</a>
            `;
        } else if (role === 'Employee') {
            navLinks.innerHTML = `
                <a href="#" class="nav-link active">Dashboard</a>
                <a href="#" class="nav-link">Farmers</a>
                <a href="#" class="nav-link">Products</a>
                <a href="#" class="nav-link">Reports</a>
            `;
        }
    }

    // Load farmers for employee dropdown
    async function loadFarmers() {
        try {
            const response = await fetch(`${API_URL}/farmers`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load farmers');
            }

            const farmers = await response.json();
            
            // Clear previous options
            farmerSelect.innerHTML = '<option value="">-- Select Farmer --</option>';
            
            // Add new options
            farmers.forEach(farmer => {
                const option = document.createElement('option');
                option.value = farmer.id;
                option.textContent = farmer.name;
                farmerSelect.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error loading farmers:', error);
            showMessage(document.querySelector('#employee-dashboard .message'), 
                       'Failed to load farmers. Please try again.', 
                       'message-error');
        }
    }

    // Add new product (Farmer only)
    async function addProduct() {
        const name = productName.value;
        const category = productCategory.value;
        const date = productionDate.value;

        if (!name || !category || !date) {
            showMessage(addProductMessage, 'Please fill in all product details.', 'message-error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    name: name,
                    category: category,
                    productionDate: date
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add product');
            }

            // Reset form
            addProductForm.reset();
            
            // Show success message
            showMessage(addProductMessage, 'Product added successfully!', 'message-success');
            
            // Reload products list
            loadFarmerProducts();
            
        } catch (error) {
            showMessage(addProductMessage, error.message, 'message-error');
        }
    }

    // Load products for farmer
    async function loadFarmerProducts() {
        const startDate = document.getElementById('start-date-farmer').value;
        const endDate = document.getElementById('end-date-farmer').value;
        const category = document.getElementById('category-filter-farmer').value;
        
        // Show loading state
        productsListFarmer.innerHTML = '<div class="spinner"></div>';

        // Build query parameters
        let queryParams = new URLSearchParams();
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        if (category) queryParams.append('category', category);

        try {
            const currentFarmerId = localStorage.getItem('farmerId');
            const response = await fetch(`${API_URL}/products/farmer/${currentFarmerId}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load products');
            }

            const products = await response.json();
            
            // Display products
            displayProducts(productsListFarmer, products);
            
        } catch (error) {
            console.error('Error loading products:', error);
            productsListFarmer.innerHTML = `
                <div class="message message-error">
                    Error loading products: ${error.message}
                </div>
            `;
        }
    }

    // Add new farmer (Employee only)
    async function addFarmer() {
        const username = farmerUsername.value;
        const password = farmerPassword.value;
        const name = farmerName.value;
        const location = farmerLocation.value;
        const contactInfo = farmerContact.value;

        if (!username || !password || !name || !location || !contactInfo) {
            showMessage(addFarmerMessage, 'Please fill in all farmer details.', 'message-error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/farmers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    name: name,
                    location: location,
                    contactInfo: contactInfo
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add farmer');
            }

            // Reset form
            addFarmerForm.reset();
            
            // Show success message
            showMessage(addFarmerMessage, 'Farmer added successfully!', 'message-success');
            
            // Reload farmers dropdown
            loadFarmers();
            
        } catch (error) {
            showMessage(addFarmerMessage, error.message, 'message-error');
        }
    }

    // Load products by farmer (Employee only)
    async function loadProductsByFarmer() {
        const selectedFarmerId = farmerSelect.value;
        const startDate = document.getElementById('start-date-employee').value;
        const endDate = document.getElementById('end-date-employee').value;
        const category = document.getElementById('category-filter-employee').value;

        if (!selectedFarmerId) {
            productsListEmployee.innerHTML = `
                <div class="message message-warning">
                    Please select a farmer first.
                </div>
            `;
            return;
        }

        // Show loading state
        productsListEmployee.innerHTML = '<div class="spinner"></div>';

        // Build query parameters
        let queryParams = new URLSearchParams();
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        if (category) queryParams.append('category', category);

        try {
            const response = await fetch(`${API_URL}/products/farmer/${selectedFarmerId}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load products');
            }

            const products = await response.json();
            
            // Display products
            displayProducts(productsListEmployee, products);
            
        } catch (error) {
            console.error('Error loading products:', error);
            productsListEmployee.innerHTML = `
                <div class="message message-error">
                    Error loading products: ${error.message}
                </div>
            `;
        }
    }

    // Display products in a grid
    function displayProducts(container, products) {
        if (products.length === 0) {
            container.innerHTML = `
                <div class="message message-warning">
                    No products found matching your criteria.
                </div>
            `;
            return;
        }

        let html = '';
        
        products.forEach(product => {
            const date = new Date(product.productionDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            html += `
                <div class="result-item">
                    <span class="badge badge-${getCategoryBadgeClass(product.category)}">${product.category}</span>
                    <h4>${product.name}</h4>
                    <p>Production Date: ${date}</p>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    // Get badge class based on category
    function getCategoryBadgeClass(category) {
        const categories = {
            'Vegetables': 'primary',
            'Fruit': 'primary',
            'Meat': 'secondary',
            'Poultry': 'secondary',
            'Dairy': 'secondary',
            'Green Energy': 'primary'
        };
        
        return categories[category] || 'primary';
    }

    // Show message with appropriate styling
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = 'message';
        element.classList.add(type);
        element.classList.remove('hidden');
        
        // Clear message after 5 seconds
        setTimeout(() => {
            element.classList.add('hidden');
        }, 5000);
    }

    // Set today's date as max for date inputs
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.setAttribute('max', today);
    });

    // Agri-Energy Connect - Dashboard Component
    // This file adds data visualization capabilities to the application

    // Only initialize dashboard if Chart.js is available
    if (typeof Chart === 'undefined') {
        // Dynamically load Chart.js from CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
        script.integrity = 'sha512-ElRFoEQdI5Ht6kZvyzXhYG9NqjtkmlkfYk0wr6wHxU9JEHakS7UJZNeml5ALk+8IKlU6jDgMabC3vkumRokgJA==';
        script.crossOrigin = 'anonymous';
        script.referrerPolicy = 'no-referrer';
        script.onload = initDashboard;
        document.head.appendChild(script);
    } else {
        initDashboard();
    }

    function initDashboard() {
        // API base URL
        const API_URL = 'http://localhost:5019/api';
        const authToken = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        
        // Only proceed if user is logged in
        if (!authToken || !userRole) return;
        
        // Create dashboard elements if they don't exist
        createDashboardElements();
        
        // Load and display dashboard data
        if (userRole === 'Farmer') {
            loadFarmerDashboardData();
        } else if (userRole === 'Employee') {
            loadEmployeeDashboardData();
        }
    }
    
    function createDashboardElements() {
        const userRole = localStorage.getItem('userRole');
        
        if (userRole === 'Farmer') {
            // Only create farmer dashboard if it doesn't exist
            if (!document.getElementById('farmer-stats')) {
                const farmerDashboard = document.getElementById('farmer-dashboard');
                if (!farmerDashboard) return;
                
                // Create dashboard container at the top
                const dashboardContainer = document.createElement('div');
                dashboardContainer.className = 'card';
                dashboardContainer.id = 'farmer-stats';
                dashboardContainer.innerHTML = `
                    <h3 class="card-title">My Products Overview</h3>
                    <div class="dashboard-grid">
                        <div class="chart-container">
                            <canvas id="farmer-category-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <canvas id="farmer-production-chart"></canvas>
                        </div>
                    </div>
                    <div class="stats-summary mt-4"></div>
                `;
                
                // Insert dashboard at the top of farmer dashboard
                farmerDashboard.insertBefore(dashboardContainer, farmerDashboard.firstChild);
                
                // Add styles to make charts responsive
                const style = document.createElement('style');
                style.textContent = `
                    .dashboard-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                        gap: 2rem;
                        margin-top: 1.5rem;
                    }
                    .chart-container {
                        position: relative;
                        height: 250px;
                    }
                    .stats-card {
                        background-color: var(--dark-surface);
                        border-radius: 8px;
                        padding: 1.25rem;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                    }
                    .stats-value {
                        font-size: 2rem;
                        font-weight: bold;
                        color: var(--primary);
                    }
                    .stats-label {
                        font-size: 0.875rem;
                        color: var(--muted-text);
                    }
                    .stats-summary {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 1rem;
                    }
                `;
                document.head.appendChild(style);
            }
        } else if (userRole === 'Employee') {
            // Only create employee dashboard if it doesn't exist
            if (!document.getElementById('employee-stats')) {
                const employeeDashboard = document.getElementById('employee-dashboard');
                if (!employeeDashboard) return;
                
                // Create dashboard container at the top
                const dashboardContainer = document.createElement('div');
                dashboardContainer.className = 'card';
                dashboardContainer.id = 'employee-stats';
                dashboardContainer.innerHTML = `
                    <h3 class="card-title">Platform Overview</h3>
                    <div class="dashboard-grid">
                        <div class="chart-container">
                            <canvas id="product-distribution-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <canvas id="farmer-location-chart"></canvas>
                        </div>
                    </div>
                    <div class="stats-summary mt-4"></div>
                `;
                
                // Insert dashboard at the top of employee dashboard
                employeeDashboard.insertBefore(dashboardContainer, employeeDashboard.firstChild);
            }
        }
    }
    
    // Load dashboard data for farmer view
    async function loadFarmerDashboardData() {
        const farmerId = localStorage.getItem('farmerId');
        const authToken = localStorage.getItem('token');
        
        if (!farmerId || !authToken) return;
        
        try {
            // Fetch all products for this farmer
            const response = await fetch(`${API_URL}/products/farmer/${farmerId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load products data');
            }
            
            const products = await response.json();
            
            if (products.length === 0) {
                document.querySelector('#farmer-stats .stats-summary').innerHTML = `
                    <p>No products found. Add some products to see statistics.</p>
                `;
                return;
            }
            
            // Process data for charts
            displayFarmerCharts(products);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }
    
    // Display charts for farmer dashboard
    function displayFarmerCharts(products) {
        // 1. Category distribution chart
        const categoryData = {};
        products.forEach(product => {
            categoryData[product.category] = (categoryData[product.category] || 0) + 1;
        });
        
        const categoryCtx = document.getElementById('farmer-category-chart').getContext('2d');
        new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                        '#4ade80', // Green
                        '#3b82f6', // Blue
                        '#f97316', // Orange
                        '#8b5cf6', // Purple
                        '#ec4899', // Pink
                        '#facc15'  // Yellow
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Products by Category',
                        color: '#f3f4f6',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#f3f4f6'
                        }
                    }
                }
            }
        });
        
        // 2. Production timeline chart
        // Group products by month
        const monthData = {};
        const now = new Date();
        // Look back 6 months
        for (let i = 0; i < 6; i++) {
            const date = new Date(now);
            date.setMonth(now.getMonth() - i);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthData[monthKey] = 0;
        }
        
        products.forEach(product => {
            const date = new Date(product.productionDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthData[monthKey] !== undefined) {
                monthData[monthKey]++;
            }
        });
        
        // Sort keys by date (oldest first)
        const sortedMonths = Object.keys(monthData).sort();
        const monthLabels = sortedMonths.map(month => {
            const [year, monthNum] = month.split('-');
            return new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
        });
        
        const timelineCtx = document.getElementById('farmer-production-chart').getContext('2d');
        new Chart(timelineCtx, {
            type: 'line',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: 'Products Added',
                    data: sortedMonths.map(month => monthData[month]),
                    borderColor: '#4ade80',
                    backgroundColor: 'rgba(74, 222, 128, 0.2)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Production Timeline',
                        color: '#f3f4f6',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 30, 30, 0.8)',
                        titleColor: '#f3f4f6',
                        bodyColor: '#f3f4f6'
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            precision: 0,
                            color: '#9ca3af'
                        }
                    }
                }
            }
        });
        
        // 3. Stats summary
        const statsSummary = document.querySelector('#farmer-stats .stats-summary');
        
        // Calculate stats
        const totalProducts = products.length;
        const latestProduct = new Date(Math.max(...products.map(p => new Date(p.productionDate))));
        const categoryCount = Object.keys(categoryData).length;
        
        // Display stats
        statsSummary.innerHTML = `
            <div class="stats-card">
                <div class="stats-value">${totalProducts}</div>
                <div class="stats-label">Total Products</div>
            </div>
            <div class="stats-card">
                <div class="stats-value">${categoryCount}</div>
                <div class="stats-label">Product Categories</div>
            </div>
            <div class="stats-card">
                <div class="stats-value">${latestProduct.toLocaleDateString('default', { day: 'numeric', month: 'short' })}</div>
                <div class="stats-label">Latest Production</div>
            </div>
        `;
    }
    
    // Load dashboard data for employee view
    async function loadEmployeeDashboardData() {
        const authToken = localStorage.getItem('token');
        
        if (!authToken) return;
        
        try {
            // Fetch all farmers
            const farmersResponse = await fetch(`${API_URL}/farmers`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (!farmersResponse.ok) {
                throw new Error('Failed to load farmers data');
            }
            
            const farmers = await farmersResponse.json();
            
            // Fetch all products
            const productsResponse = await fetch(`${API_URL}/products`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (!productsResponse.ok) {
                throw new Error('Failed to load products data');
            }
            
            const products = await productsResponse.json();
            
            // Display charts with data
            displayEmployeeCharts(farmers, products);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            document.querySelector('#employee-stats .stats-summary').innerHTML = `
                <div class="message message-error">
                    Error loading dashboard data: ${error.message}
                </div>
            `;
        }
    }
    
    // Display charts for employee dashboard
    function displayEmployeeCharts(farmers, products) {
        // 1. Product distribution chart by category
        const categoryData = {};
        products.forEach(product => {
            categoryData[product.category] = (categoryData[product.category] || 0) + 1;
        });
        
        const categoryCtx = document.getElementById('product-distribution-chart').getContext('2d');
        new Chart(categoryCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                        '#4ade80', // Green
                        '#3b82f6', // Blue
                        '#f97316', // Orange
                        '#8b5cf6', // Purple
                        '#ec4899', // Pink
                        '#facc15'  // Yellow
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Products by Category',
                        color: '#f3f4f6',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#f3f4f6'
                        }
                    }
                }
            }
        });
        
        // 2. Farmer location chart
        const locationData = {};
        farmers.forEach(farmer => {
            locationData[farmer.location] = (locationData[farmer.location] || 0) + 1;
        });
        
        const locationCtx = document.getElementById('farmer-location-chart').getContext('2d');
        new Chart(locationCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(locationData),
                datasets: [{
                    label: 'Farmers',
                    data: Object.values(locationData),
                    backgroundColor: '#3b82f6',
                    borderColor: '#2563eb',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Farmers by Location',
                        color: '#f3f4f6',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 30, 30, 0.8)',
                        titleColor: '#f3f4f6',
                        bodyColor: '#f3f4f6'
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            precision: 0,
                            color: '#9ca3af'
                        }
                    }
                }
            }
        });
        
        // 3. Stats summary
        const statsSummary = document.querySelector('#employee-stats .stats-summary');
        
        // Calculate stats
        const totalFarmers = farmers.length;
        const totalProducts = products.length;
        const avgProductsPerFarmer = (totalProducts / totalFarmers).toFixed(1);
        const greenEnergyProducts = products.filter(p => p.category === 'Green Energy').length;
        
        // Display stats
        statsSummary.innerHTML = `
            <div class="stats-card">
                <div class="stats-value">${totalFarmers}</div>
                <div class="stats-label">Registered Farmers</div>
            </div>
            <div class="stats-card">
                <div class="stats-value">${totalProducts}</div>
                <div class="stats-label">Total Products</div>
            </div>
            <div class="stats-card">
                <div class="stats-value">${avgProductsPerFarmer}</div>
                <div class="stats-label">Avg Products/Farmer</div>
            </div>
            <div class="stats-card">
                <div class="stats-value">${greenEnergyProducts}</div>
                <div class="stats-label">Green Energy Products</div>
            </div>
        `;
    }
});
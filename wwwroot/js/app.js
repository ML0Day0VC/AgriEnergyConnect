// Agri-Energy Connect - Main JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // API base URL - Update this if needed to match your environment
    const API_URL = window.location.protocol === 'https:'
        ? 'https://localhost:7012/api'
        : 'http://localhost:5019/api';

    console.log("Using API URL:", API_URL);

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
    const adminDashboard = document.createElement('section'); // Create admin dashboard element
    adminDashboard.id = 'admin-dashboard';
    adminDashboard.classList.add('hidden');
    document.querySelector('main').appendChild(adminDashboard); // Add to main container

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

    // Initialize admin dashboard
    initializeAdminDashboard();

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

    // Create Admin Dashboard
    function initializeAdminDashboard() {
        adminDashboard.innerHTML = `
            <h2 class="section-title">Admin Dashboard</h2>
            
            <!-- Platform Overview Card -->
            <div class="card">
                <h3 class="card-title">Platform Overview</h3>
                <div class="dashboard-grid">
                    <div class="chart-container">
                        <canvas id="admin-products-chart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="admin-farmers-chart"></canvas>
                    </div>
                </div>
                <div id="admin-stats-summary" class="stats-summary mt-4"></div>
            </div>
            
            <!-- All Farmers Card -->
            <div class="card">
                <h3 class="card-title">All Farmers</h3>
                <button id="load-all-farmers-btn" class="btn btn-secondary">Refresh Farmers</button>
                <div id="farmers-list" class="result-list mt-4"></div>
            </div>
            
            <!-- All Products Card -->
            <div class="card">
                <h3 class="card-title">All Products</h3>
                
                <!-- Filter Controls -->
                <div class="filter-row">
                    <div class="form-group">
                        <label for="start-date-admin">Start Date</label>
                        <input type="date" id="start-date-admin" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="end-date-admin">End Date</label>
                        <input type="date" id="end-date-admin" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="category-filter-admin">Category</label>
                        <select id="category-filter-admin" class="form-control">
                            <option value="">All Categories</option>
                            <option value="Vegetables">Vegetables</option>
                            <option value="Fruit">Fruit</option>
                            <option value="Meat">Meat</option>
                            <option value="Poultry">Poultry</option>
                            <option value="Dairy">Dairy</option>
                         
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="farmer-filter-admin">Farmer</label>
                        <select id="farmer-filter-admin" class="form-control">
                            <option value="">All Farmers</option>
                            <!-- Farmers will be loaded here -->
                        </select>
                    </div>
                </div>
                
                <button id="load-all-products-btn" class="btn btn-secondary">Refresh Products</button>
                
                <!-- Products Display -->
                <div id="products-list-admin" class="result-list mt-4"></div>
            </div>
        `;

        // Add Event Listeners for Admin Dashboard
        document.getElementById('load-all-farmers-btn').addEventListener('click', loadAllFarmers);
        document.getElementById('load-all-products-btn').addEventListener('click', loadAllProducts);

        // Initialize farmer filter in admin dashboard
        loadFarmersForAdminFilter();
    }

    // Load farmers for admin filter
    async function loadFarmersForAdminFilter() {
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

            // Populate farmer filter dropdown
            const farmerFilter = document.getElementById('farmer-filter-admin');
            farmerFilter.innerHTML = '<option value="">All Farmers</option>';

            farmers.forEach(farmer => {
                const option = document.createElement('option');
                option.value = farmer.id;
                option.textContent = farmer.name;
                farmerFilter.appendChild(option);
            });

        } catch (error) {
            console.error('Error loading farmers for filter:', error);
        }
    }

    async function loadAllFarmers() {
        try {
            const farmersList = document.getElementById('farmers-list');
            farmersList.innerHTML = '<div class="spinner"></div>';

            const response = await fetch(`${API_URL}/farmers`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load farmers');
            }

            const farmers = await response.json();

            if (farmers.length === 0) {
                farmersList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👨‍🌾</div>
                    <p>No farmers found.</p>
                </div>
            `;
                return;
            }

            // Create farmers table
            let html = `
            <div class="farmers-table-container">
                <table class="farmers-table">
                    <thead>
                        <tr>
                            <th>Farmer Name</th>
                            <th>Location</th>
                            <th>Contact Info</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

            farmers.forEach(farmer => {
                html += `
                <tr>
                    <td class="farmer-table-name">${farmer.name}</td>
                    <td class="farmer-location">${farmer.location}</td>
                    <td class="farmer-contact">${farmer.contactInfo}</td>
                    <td class="farmer-actions">
                        <button class="btn btn-sm btn-secondary view-farmer-products" data-id="${farmer.id}">
                            View Products
                        </button>
                    </td>
                </tr>
            `;
            });

            html += `
                    </tbody>
                </table>
            </div>
        `;

            farmersList.innerHTML = html;

            // Add event listeners to view products buttons
            document.querySelectorAll('.view-farmer-products').forEach(button => {
                button.addEventListener('click', function () {
                    const farmerId = this.getAttribute('data-id');
                    document.getElementById('farmer-filter-admin').value = farmerId;
                    loadAllProducts();
                    // Scroll to products section
                    document.querySelector('#admin-dashboard .card:nth-child(3)').scrollIntoView({ behavior: 'smooth' });
                });
            });

        } catch (error) {
            console.error('Error loading all farmers:', error);
            document.getElementById('farmers-list').innerHTML = `
            <div class="message message-error">
                Error loading farmers: ${error.message}
            </div>
        `;
        }

    }

    // Load all products for admin view
    async function loadAllProducts() {
        const startDate = document.getElementById('start-date-admin').value;
        const endDate = document.getElementById('end-date-admin').value;
        const category = document.getElementById('category-filter-admin').value;
        const selectedFarmerId = document.getElementById('farmer-filter-admin').value;

        const productsList = document.getElementById('products-list-admin');
        productsList.innerHTML = '<div class="spinner"></div>';

        try {
            let endpoint;
            let queryParams = new URLSearchParams();

            // If a specific farmer is selected, use the farmer endpoint
            if (selectedFarmerId) {
                endpoint = `${API_URL}/products/farmer/${selectedFarmerId}`;

                if (startDate) queryParams.append('startDate', startDate);
                if (endDate) queryParams.append('endDate', endDate);
                if (category) queryParams.append('category', category);

                console.log(`Fetching products for farmer ${selectedFarmerId} with URL: ${endpoint}?${queryParams}`);

                const response = await fetch(`${endpoint}?${queryParams}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Failed to load products: ${response.status}`);
                }

                const products = await response.json();
                console.log(`Loaded ${products.length} products for farmer ${selectedFarmerId}`);
                displayProductsWithFarmer(productsList, products, selectedFarmerId);
            }
            else {
                // Get all products
                endpoint = `${API_URL}/products`;
                console.log(`Fetching all products with URL: ${endpoint}`);

                const response = await fetch(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Failed to load products: ${response.status}`);
                }

                let products = await response.json();
                console.log(`Loaded ${products.length} products`);

                // Apply filters manually since the endpoint doesn't support them
                if (startDate) {
                    products = products.filter(p => new Date(p.productionDate) >= new Date(startDate));
                }

                if (endDate) {
                    products = products.filter(p => new Date(p.productionDate) <= new Date(endDate));
                }

                if (category) {
                    products = products.filter(p => p.category === category);
                }

                displayProductsWithFarmer(productsList, products);
            }
        } catch (error) {
            console.error('Error loading all products:', error);
            productsList.innerHTML = `
            <div class="message message-error">
                Error loading products: ${error.message}
            </div>
        `;
        }
    }

    // Display products with farmer info (for admin view)
    function displayProductsWithFarmer(container, products, specificFarmerId = null) {
        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <p>No products found matching your criteria.</p>
                </div>
            `;
            return;
        }

        // Create table with farmer column if needed
        let html = `
            <div class="products-table-container">
                <table class="products-table">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Production Date</th>
                            ${!specificFarmerId ? '<th>Farmer</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
        `;

        products.forEach(product => {
            const date = new Date(product.productionDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const categoryClass = getCategoryClass(product.category);
            const farmerName = product.farmerName || (product.farmer ? product.farmer.name : 'Unknown Farmer');

            html += `
                <tr>
                    <td class="product-name">${product.name}</td>
                    <td>
                        <span class="category-badge ${categoryClass}">${product.category}</span>
                    </td>
                    <td class="production-date">${date}</td>
                    ${!specificFarmerId ? `<td class="farmer-name">${farmerName}</td>` : ''}
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    }

    // Login function
    async function login() {
        const username = loginUsername.value;
        const password = loginPassword.value;

        if (!username || !password) {
            showMessage(loginMessage, 'Please enter both username and password.', 'message-error');
            return;
        }

        try {
            console.log("Attempting login with:", username);

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
            console.log("Login success:", data);

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
            console.error("Login error:", error);
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
        adminDashboard.classList.add('hidden');

        // Reset login form
        loginFormElement.reset();
        loginMessage.classList.add('hidden');
    }

    // Show dashboard based on user role
    function showDashboard(role) {
        console.log("Showing dashboard for role:", role);

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
            adminDashboard.classList.add('hidden');
            // Load farmer's products
            loadFarmerProducts();
        } else if (role === 'Employee') {
            employeeDashboard.classList.remove('hidden');
            farmerDashboard.classList.add('hidden');
            adminDashboard.classList.add('hidden');
            // Load farmers for dropdown
            loadFarmers();
        } else if (role === 'Admin') {
            adminDashboard.classList.remove('hidden');
            farmerDashboard.classList.add('hidden');
            employeeDashboard.classList.add('hidden');
            // Load admin dashboard data
            loadAllFarmers();
            loadFarmersForAdminFilter();
            loadAllProducts();
        }
    }

    // Update user info in header
    function updateUserInfo() {
        const storedUsername = localStorage.getItem('username');
        const storedRole = localStorage.getItem('userRole');

        if (storedUsername) {
            const initial = storedUsername.charAt(0).toUpperCase();
            userInfo.innerHTML = `
                <div class="user-avatar">${initial}</div>
                <span>${storedUsername} (${storedRole})</span>
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
        } else if (role === 'Admin') {
            navLinks.innerHTML = `
                <a href="#" class="nav-link active">Dashboard</a>
                <a href="#" class="nav-link">Farmers</a>
                <a href="#" class="nav-link">Products</a>
                <a href="#" class="nav-link">Reports</a>
                <a href="#" class="nav-link">System</a>
            `;
        }
    }


    // Load farmers for employee dropdown
    async function loadFarmers() {
        try {
            console.log("Loading farmers for dropdown");
            const response = await fetch(`${API_URL}/farmers`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load farmers');
            }

            const farmers = await response.json();
            console.log(`Loaded ${farmers.length} farmers`);

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
            showMessage(document.querySelector('#employee-dashboard .message') || addFarmerMessage,
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
            console.log("Adding product:", { name, category, date });

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
            console.error("Error adding product:", error);
            showMessage(addProductMessage, error.message, 'message-error');
        }
    }

    // Load products for farmer
    async function loadFarmerProducts() {
        const startDate = document.getElementById('start-date-farmer')?.value || '';
        const endDate = document.getElementById('end-date-farmer')?.value || '';
        const category = document.getElementById('category-filter-farmer')?.value || '';

        // Show loading state
        productsListFarmer.innerHTML = '<div class="spinner"></div>';

        try {
            const currentFarmerId = localStorage.getItem('farmerId');
            console.log(`Loading products for farmer ID: ${currentFarmerId} with filters:`,
                { startDate, endDate, category });

            if (!currentFarmerId) {
                throw new Error('Farmer ID not found. Please log in again.');
            }

            // Build query parameters
            const queryParams = new URLSearchParams();
            // Only add parameters if they have values
            if (startDate) queryParams.append('startDate', startDate);
            if (endDate) queryParams.append('endDate', endDate);
            if (category) queryParams.append('category', category);

            const queryString = queryParams.toString();
            const endpoint = `${API_URL}/products/farmer/${currentFarmerId}`;
            const fullUrl = queryString ? `${endpoint}?${queryString}` : endpoint;

            console.log(`Fetching from URL: ${fullUrl}`);

            const response = await fetch(fullUrl, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            // Log detailed response information for debugging
            console.log(`Response status: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                // Try to get error message from response
                let errorMessage;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || `${response.status} ${response.statusText}`;
                } catch (e) {
                    errorMessage = `${response.status} ${response.statusText}`;
                }
                throw new Error(`Failed to load products: ${errorMessage}`);
            }

            const products = await response.json();
            console.log(`Successfully loaded ${products.length} products:`, products);

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
            console.log("Adding farmer:", { username, name, location, contactInfo });

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

            addFarmerForm.reset();

            showMessage(addFarmerMessage, 'Farmer added successfully!', 'message-success');
            loadFarmers();

        } catch (error) {
            console.error("Error adding farmer:", error);
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
            console.log(`Loading products for selected farmer ID: ${selectedFarmerId} with filters:`,
                { startDate, endDate, category });

            const endpoint = `${API_URL}/products/farmer/${selectedFarmerId}`;
            console.log(`Fetching from URL: ${endpoint}?${queryParams}`);

            const response = await fetch(`${endpoint}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                // Try to get error message from response
                let errorMessage;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || `${response.status} ${response.statusText}`;
                } catch (e) {
                    errorMessage = `${response.status} ${response.statusText}`;
                }
                throw new Error(`Failed to load products: ${errorMessage}`);
            }

            const products = await response.json();
            console.log(`Successfully loaded ${products.length} products`);

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

    // Display products in a table/list format
    function displayProducts(container, products) {
        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <p>No products found matching your criteria.</p>
                </div>
            `;
            return;
        }

        // Create table structure
        let html = `
            <div class="products-table-container">
                <table class="products-table">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Production Date</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        products.forEach(product => {
            const date = new Date(product.productionDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const categoryClass = getCategoryClass(product.category);

            html += `
                <tr>
                    <td class="product-name">${product.name}</td>
                    <td>
                        <span class="category-badge ${categoryClass}">${product.category}</span>
                    </td>
                    <td class="production-date">${date}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    }

    // Get category class for badge styling
    function getCategoryClass(category) {
        const categoryLower = category.toLowerCase().replace(/\s+/g, '-');
        return categoryLower;
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


    if (typeof Chart === 'undefined') {
        // chart.js my GOAT
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
        // Only initialize charts if Chart.js is loaded and user is logged in
        if (typeof Chart === 'undefined' || !authToken || !userRole) return;


        // Load and display dashboard data based on user role
        if (userRole === 'Farmer') {
            loadFarmerDashboardData();
        } else if (userRole === 'Employee' || userRole === 'Admin') {
            loadEmployeeDashboardData();
        }
    }
 
    async function loadEmployeeDashboardData() {
        try {
            // Load farmers and products for charts
            const [farmersResponse, productsResponse] = await Promise.all([
                fetch(`${API_URL}/farmers`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                }),
                fetch(`${API_URL}/products`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                })
            ]);

            if (!farmersResponse.ok || !productsResponse.ok) {
                throw new Error('Failed to load dashboard data');
            }

            const farmers = await farmersResponse.json();
            const products = await productsResponse.json();

            // Create charts
            createProductsByCategoryChart(products);
            createTopProducersChart(farmers, products);
            createStatsOverview(farmers, products);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    // Chart 1: Products by Category (Donut Chart)
    function createProductsByCategoryChart(products) {
        const canvas = document.getElementById('admin-products-chart');
        if (!canvas) return;

        // Count products by category (excluding Green Energy)
        const categoryCount = products.reduce((acc, product) => {
            if (product.category !== 'Green Energy') {
                acc[product.category] = (acc[product.category] || 0) + 1;
            }
            return acc;
        }, {});

        const ctx = canvas.getContext('2d');

        // Destroy existing chart if it exists
        if (window.productsChart) {
            window.productsChart.destroy();
        }

        window.productsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryCount),
                datasets: [{
                    data: Object.values(categoryCount),
                    backgroundColor: [
                        '#4ade80',  // Green for Vegetables
                        '#3b82f6',  // Blue for Fruit
                        '#ef4444',  // Red for Meat
                        '#f59e0b',  // Orange for Poultry
                        '#8b5cf6',  // Purple for Dairy
                    ],
                    borderWidth: 2,
                    borderColor: '#242424'
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
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#f3f4f6',
                            padding: 15,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    // Chart 2: Top Producers (Horizontal Bar Chart)
    function createTopProducersChart(farmers, products) {
        const canvas = document.getElementById('admin-farmers-chart');
        if (!canvas) return;

        // Count products per farmer
        const farmerProductCount = farmers.map(farmer => {
            const productCount = products.filter(p =>
                p.farmerId === farmer.id && p.category !== 'Green Energy'
            ).length;
            return {
                name: farmer.name,
                count: productCount
            };
        });

        // Sort by count and take top 8
        const topProducers = farmerProductCount
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

        const ctx = canvas.getContext('2d');

        // Destroy existing chart if it exists
        if (window.farmersChart) {
            window.farmersChart.destroy();
        }

        window.farmersChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topProducers.map(f => f.name),
                datasets: [{
                    label: 'Number of Products',
                    data: topProducers.map(f => f.count),
                    backgroundColor: '#4ade80',
                    borderColor: '#22c55e',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', 
                plugins: {
                    title: {
                        display: true,
                        text: 'Top Producers by Product Count',
                        color: '#f3f4f6',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { color: '#9ca3af' },
                        grid: { color: '#333333' }
                    },
                    y: {
                        ticks: { color: '#9ca3af' },
                        grid: { color: '#333333' }
                    }
                }
            }
        });
    }

    // Create stats overview
    function createStatsOverview(farmers, products) {
        const statsContainer = document.getElementById('admin-stats-summary');
        if (!statsContainer) return;

        // Calculate stats (excluding Green Energy products)
        const activeProducts = products.filter(p => p.category !== 'Green Energy');
        const totalFarmers = farmers.length;
        const totalProducts = activeProducts.length;

        // Most popular category
        const categoryCount = activeProducts.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + 1;
            return acc;
        }, {});

        const mostPopularCategory = Object.entries(categoryCount)
            .sort(([, a], [, b]) => b - a)[0];

        // Recent activity (products added in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentProducts = activeProducts.filter(p =>
            new Date(p.productionDate) >= thirtyDaysAgo
        ).length;

        statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h4>Total Farmers</h4>
                <p class="stat-number">${totalFarmers}</p>
            </div>
            <div class="stat-card">
                <h4>Total Products</h4>
                <p class="stat-number">${totalProducts}</p>
            </div>
            <div class="stat-card">
                <h4>Most Popular Category</h4>
                <p class="stat-number">${mostPopularCategory ? mostPopularCategory[0] : 'N/A'}</p>
                <small>${mostPopularCategory ? mostPopularCategory[1] : 0} products</small>
            </div>
            <div class="stat-card">
                <h4>Recent Activity</h4>
                <p class="stat-number">${recentProducts}</p>
                <small>Products in last 30 days</small>
            </div>
        </div>
    `;
    }

    // Load dashboard data for farmers
    async function loadFarmerDashboardData() {
        const farmerId = localStorage.getItem('farmerId');
        if (!farmerId) return;

        try {
            const response = await fetch(`${API_URL}/products/farmer/${farmerId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!response.ok) return;

            const products = await response.json();

            // Create a simple category breakdown for farmers
            const farmerStatsContainer = document.querySelector('#farmer-dashboard .card:first-child');
            if (farmerStatsContainer) {
                createFarmerStats(products);
            }

        } catch (error) {
            console.error('Error loading farmer dashboard data:', error);
        }
    }

    function createFarmerStats(products) {
        // Create farmer dashboard overview
        const farmerDashboard = document.getElementById('farmer-dashboard');

        // Add dashboard overview before existing cards
        const dashboardOverview = document.createElement('div');
        dashboardOverview.className = 'card';
        dashboardOverview.innerHTML = `
        <h3 class="card-title">Dashboard Overview</h3>
        <div id="farmer-stats-grid" class="stats-grid"></div>
    `;

        // Insert at the beginning
        farmerDashboard.insertBefore(dashboardOverview, farmerDashboard.firstChild);

        // Calculate farmer stats (excluding Green Energy)
        const activeProducts = products.filter(p => p.category !== 'Green Energy');
        const totalProducts = activeProducts.length;

        const categoryCount = activeProducts.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + 1;
            return acc;
        }, {});

        const categoriesSupplied = Object.keys(categoryCount).length;
        const mostProductiveCategory = Object.entries(categoryCount)
            .sort(([, a], [, b]) => b - a)[0];

        // Recent products (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentProducts = activeProducts.filter(p =>
            new Date(p.productionDate) >= thirtyDaysAgo
        ).length;

        document.getElementById('farmer-stats-grid').innerHTML = `
        <div class="stat-card">
            <h4>Total Products</h4>
            <p class="stat-number">${totalProducts}</p>
        </div>
        <div class="stat-card">
            <h4>Categories Supplied</h4>
            <p class="stat-number">${categoriesSupplied}</p>
        </div>
        <div class="stat-card">
            <h4>Top Category</h4>
            <p class="stat-number">${mostProductiveCategory ? mostProductiveCategory[0] : 'N/A'}</p>
            <small>${mostProductiveCategory ? mostProductiveCategory[1] : 0} products</small>
        </div>
        <div class="stat-card">
            <h4>Recent Activity</h4>
            <p class="stat-number">${recentProducts}</p>
            <small>Products in last 30 days</small>
        </div>
    `;
    }


});

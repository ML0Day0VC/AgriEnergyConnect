// Main JavaScript file for Agri-Energy Connect

document.addEventListener('DOMContentLoaded', function() {
    // API base URL - change this to match your API
    const API_URL = '/api';

    // Auth state
    let authToken = localStorage.getItem('token');
    let userRole = localStorage.getItem('userRole');
    let farmerId = localStorage.getItem('farmerId');
    let username = localStorage.getItem('username');

    // Check if user is already logged in
    if (authToken && userRole) {
        showDashboard(userRole);
    }

    // DOM elements - Login
    const loginBtn = document.getElementById('login-btn');
    const loginMessage = document.getElementById('login-message');

    // DOM elements - Farmer
    const addProductBtn = document.getElementById('add-product-btn');
    const loadProductsFarmerBtn = document.getElementById('load-products-farmer-btn');
    const logoutBtnFarmer = document.getElementById('logout-btn-farmer');
    const farmerInfo = document.getElementById('farmer-info');

    // DOM elements - Employee
    const addFarmerBtn = document.getElementById('add-farmer-btn');
    const loadProductsEmployeeBtn = document.getElementById('load-products-employee-btn');
    const logoutBtnEmployee = document.getElementById('logout-btn-employee');
    const employeeInfo = document.getElementById('employee-info');
    const farmerSelect = document.getElementById('farmer-select');

    // Set user info if logged in
    if (username) {
        if (userRole === 'Farmer') {
            farmerInfo.textContent = `Logged in as: ${username}`;
        } else if (userRole === 'Employee') {
            employeeInfo.textContent = `Logged in as: ${username}`;
        }
    }

    // Event listeners - Login
    loginBtn.addEventListener('click', login);

    // Event listeners - Farmer
    addProductBtn.addEventListener('click', addProduct);
    loadProductsFarmerBtn.addEventListener('click', loadFarmerProducts);
    logoutBtnFarmer.addEventListener('click', logout);

    // Event listeners - Employee
    addFarmerBtn.addEventListener('click', addFarmer);
    loadProductsEmployeeBtn.addEventListener('click', loadProductsByFarmer);
    logoutBtnEmployee.addEventListener('click', logout);

    // If employee is logged in, load farmers for dropdown
    if (userRole === 'Employee') {
        loadFarmers();
    }

    // Login function
    async function login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            displayMessage(loginMessage, 'Please enter both username and password.', 'error');
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
            
            // Set user info
            if (data.role === 'Farmer') {
                farmerInfo.textContent = `Logged in as: ${username}`;
            } else if (data.role === 'Employee') {
                employeeInfo.textContent = `Logged in as: ${username}`;
                loadFarmers();
            }
            
        } catch (error) {
            displayMessage(loginMessage, error.message, 'error');
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
        
        // Show login section
        document.getElementById('login-section').classList.remove('hidden');
        document.getElementById('farmer-section').classList.add('hidden');
        document.getElementById('employee-section').classList.add('hidden');
        
        // Clear form fields
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        loginMessage.textContent = '';
    }

    // Show appropriate dashboard based on role
    function showDashboard(role) {
        document.getElementById('login-section').classList.add('hidden');
        
        if (role === 'Farmer') {
            document.getElementById('farmer-section').classList.remove('hidden');
            document.getElementById('employee-section').classList.add('hidden');
        } else if (role === 'Employee') {
            document.getElementById('employee-section').classList.remove('hidden');
            document.getElementById('farmer-section').classList.add('hidden');
        }
    }

    // Load farmers for dropdown (Employee only)
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
        }
    }

    // Add product (Farmer only)
    async function addProduct() {
        const productName = document.getElementById('product-name').value;
        const productCategory = document.getElementById('product-category').value;
        const productionDate = document.getElementById('production-date').value;
        const message = document.getElementById('add-product-message');

        if (!productName || !productCategory || !productionDate) {
            displayMessage(message, 'Please fill in all product details.', 'error');
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
                    name: productName,
                    category: productCategory,
                    productionDate: productionDate
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add product');
            }

            // Clear form
            document.getElementById('product-name').value = '';
            document.getElementById('product-category').value = '';
            document.getElementById('production-date').value = '';
            
            displayMessage(message, 'Product added successfully!', 'success');
            
            // Reload products
            loadFarmerProducts();
            
        } catch (error) {
            displayMessage(message, error.message, 'error');
        }
    }

    // Load products for farmer
    async function loadFarmerProducts() {
        const startDate = document.getElementById('start-date-farmer').value;
        const endDate = document.getElementById('end-date-farmer').value;
        const category = document.getElementById('category-filter-farmer').value;
        const productsList = document.getElementById('products-list-farmer');

        // Build query parameters
        let queryParams = new URLSearchParams();
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        if (category) queryParams.append('category', category);

        try {
            const response = await fetch(`${API_URL}/products/farmer/${farmerId}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load products');
            }

            const products = await response.json();
            
            // Display products
            displayProducts(productsList, products);
            
        } catch (error) {
            console.error('Error loading products:', error);
            productsList.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    }

    // Add farmer (Employee only)
    async function addFarmer() {
        const farmerUsername = document.getElementById('farmer-username').value;
        const farmerPassword = document.getElementById('farmer-password').value;
        const farmerName = document.getElementById('farmer-name').value;
        const farmerLocation = document.getElementById('farmer-location').value;
        const farmerContact = document.getElementById('farmer-contact').value;
        const message = document.getElementById('add-farmer-message');

        if (!farmerUsername || !farmerPassword || !farmerName || !farmerLocation || !farmerContact) {
            displayMessage(message, 'Please fill in all farmer details.', 'error');
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
                    username: farmerUsername,
                    password: farmerPassword,
                    name: farmerName,
                    location: farmerLocation,
                    contactInfo: farmerContact
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add farmer');
            }

            // Clear form
            document.getElementById('farmer-username').value = '';
            document.getElementById('farmer-password').value = '';
            document.getElementById('farmer-name').value = '';
            document.getElementById('farmer-location').value = '';
            document.getElementById('farmer-contact').value = '';
            
            displayMessage(message, 'Farmer added successfully!', 'success');
            
            // Reload farmers dropdown
            loadFarmers();
            
        } catch (error) {
            displayMessage(message, error.message, 'error');
        }
    }

    // Load products by farmer (Employee only)
    async function loadProductsByFarmer() {
        const selectedFarmerId = farmerSelect.value;
        const startDate = document.getElementById('start-date-employee').value;
        const endDate = document.getElementById('end-date-employee').value;
        const category = document.getElementById('category-filter-employee').value;
        const productsList = document.getElementById('products-list-employee');

        if (!selectedFarmerId) {
            productsList.innerHTML = '<p class="error">Please select a farmer first.</p>';
            return;
        }

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
            displayProducts(productsList, products);
            
        } catch (error) {
            console.error('Error loading products:', error);
            productsList.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    }

    // Display products in a list
    function displayProducts(container, products) {
        if (products.length === 0) {
            container.innerHTML = '<p>No products found.</p>';
            return;
        }

        let html = '';
        
        products.forEach(product => {
            const date = new Date(product.productionDate).toLocaleDateString();
            
            html += `
                <div class="result-item">
                    <h4>${product.name}</h4>
                    <p>Category: ${product.category}</p>
                    <p>Production Date: ${date}</p>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    // Display message with appropriate styling
    function displayMessage(element, message, type) {
        element.textContent = message;
        element.className = 'message';
        element.classList.add(type);
        
        // Clear message after 5 seconds
        setTimeout(() => {
            element.textContent = '';
            element.className = 'message';
        }, 5000);
    }
});
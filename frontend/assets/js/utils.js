/**
 * HealthHub Bridge - Utility Functions
 * Shared JavaScript utilities for all pages
 * Connects to Flask backend at localhost:5000
 */

// Backend API base URL
const BASE_URL = 'http://localhost:5000';

// ============================================
// AUTHENTICATION & SECURITY
// ============================================

/**
 * Protect pages from unauthorized access
 * Redirects to login if no valid token exists
 */
function authGuard() {
  if (!sessionStorage.getItem('token')) {
    window.location.href = '../auth/login.html';
  }
}

/**
 * Check if user has required role
 * @param {Array} allowedRoles - Array of allowed role names
 * @returns {boolean} True if user has permission
 */
function checkRole(allowedRoles) {
  return allowedRoles.includes(sessionStorage.getItem('role'));
}

/**
 * Apply role-based visibility to elements
 * Hides elements with data-role attribute that don't match user's role
 * Usage: <div data-role="admin,doctor">Content</div>
 */
function applyRoleVisibility() {
  const role = sessionStorage.getItem('role');
  document.querySelectorAll('[data-role]').forEach(element => {
    const roles = element.getAttribute('data-role').split(',').map(role => role.trim());
    element.style.display = roles.includes(role) ? '' : 'none';
  });
}

/**
 * Check if session has expired (1 hour timeout)
 * Shows warning and logs out if expired
 */
function checkSessionTimeout() {
  const loginTime = sessionStorage.getItem('login_time');
  if (!loginTime) return;
  
  const elapsed = (Date.now() - Number(loginTime)) / 1000;
  if (elapsed > 3600) {
    showToast('Session expired. Please log in again.', 'warning');
    setTimeout(logout, 1500);
  }
}

/**
 * Clear session and redirect to login
 */
function logout() {
  sessionStorage.clear();
  window.location.href = '../auth/login.html';
}

// ============================================
// API COMMUNICATION
// ============================================

/**
 * Fetch data from backend API with authentication
 * Handles tokens, errors, and loading states automatically
 * @param {string} endpoint - API endpoint path
 * @param {object} options - Fetch options (method, body, etc)
 * @returns {Promise} Response data or null
 */
async function apiFetch(endpoint, options = {}) {
  const token = sessionStorage.getItem('token');
  
  // Build request configuration
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  };

  showSpinner('global-spinner');

  try {
    const response = await fetch(BASE_URL + endpoint, config);
    
    // Handle expired session
    if (response.status === 401) {
      logout();
      return null;
    }
    
    const data = await response.json();
    
    // Handle API errors
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    
    return data;
    
  } catch (error) {
    // Network error - backend not running
    if (error.name === 'TypeError') {
      showToast('Cannot connect to server. Is Flask running?', 'error');
    } else {
      showToast(error.message, 'error');
    }
    throw error;
    
  } finally {
    hideSpinner('global-spinner');
  }
}

// ============================================
// UI FEEDBACK
// ============================================

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type: success, error, warning
 */
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  
  // Create container if it doesn't exist
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  // Create and show toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  // Auto-remove after 3 seconds
  setTimeout(() => toast.remove(), 3000);
}

/**
 * Show loading spinner
 * @param {string} id - Spinner element ID
 */
function showSpinner(id) {
  const element = document.getElementById(id);
  if (element) element.style.display = 'flex';
}

/**
 * Hide loading spinner
 * @param {string} id - Spinner element ID
 */
function hideSpinner(id) {
  const element = document.getElementById(id);
  if (element) element.style.display = 'none';
}

// ============================================
// DATA FORMATTING
// ============================================

/**
 * Format date string to readable format
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date (e.g., "12 Apr 1990")
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format amount as SSP currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency (e.g., "12,000 SSP")
 */
function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '0 SSP';
  return Number(amount).toLocaleString('en-US') + ' SSP';
}

/**
 * Calculate age from date of birth
 * @param {string} dob - Date of birth
 * @returns {number} Age in years
 */
function calcAge(dateOfBirth) {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// ============================================
// STATUS BADGES
// ============================================

/**
 * Get CSS class for status badge
 * @param {string} status - Status value
 * @returns {string} CSS class name
 */
function getBadgeClass(status) {
  const map = {
    'Scheduled': 'badge-scheduled',
    'Completed': 'badge-completed',
    'Cancelled': 'badge-cancelled',
    'No-show': 'badge-no-show',
    'Paid': 'badge-paid',
    'Partial': 'badge-partial',
    'Unpaid': 'badge-unpaid',
    'Active': 'badge-active',
    'Expired': 'badge-expired'
  };
  return map[status] || 'badge-cancelled';
}

/**
 * Render status badge HTML
 * @param {string} status - Status value
 * @returns {string} HTML string
 */
function renderBadge(status) {
  return `<span class="badge ${getBadgeClass(status)}">${status}</span>`;
}

/**
 * Check if prescription is active or expired
 * @param {string} endTime - Prescription end time
 * @returns {string} 'Active' or 'Expired'
 */
function getPrescriptionStatus(endTime) {
  if (!endTime) return 'Active';
  return new Date(endTime) > new Date() ? 'Active' : 'Expired';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function calls (useful for search inputs)
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds (default 300ms)
 * @returns {Function} Debounced function
 */
function debounce(func, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

/**
 * Paginate array data
 * @param {Array} data - Data to paginate
 * @param {number} page - Current page number
 * @param {number} perPage - Items per page
 * @returns {object} Paginated data with metadata
 */
function paginate(data, page, perPage = 10) {
  const total = data.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  return {
    items: data.slice(start, start + perPage),
    totalPages,
    currentPage: page,
    total,
    start: start + 1,
    end: Math.min(start + perPage, total)
  };
}

/**
 * Render pagination controls
 * @param {string} containerId - Container element ID
 * @param {number} totalPages - Total number of pages
 * @param {number} currentPage - Current page number
 * @param {Function} onPageChange - Callback function for page change
 */
function renderPagination(containerId, totalPages, currentPage, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let html = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="(${onPageChange})(${currentPage - 1})">Prev</button>`;
  
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="(${onPageChange})(${i})">${i}</button>`;
  }
  
  html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="(${onPageChange})(${currentPage + 1})">Next</button>`;
  container.innerHTML = html;
}

/**
 * Highlight active link in sidebar
 */
function setActiveLink() {
  const path = window.location.pathname;
  document.querySelectorAll('.sidebar-nav a').forEach(anchor => {
    anchor.classList.toggle('active', anchor.getAttribute('href') === path);
  });
}

// ============================================
// LAYOUT COMPONENTS
// ============================================

/**
 * Render sidebar navigation
 * @param {string} activePage - Current active page identifier
 * @returns {string} Sidebar HTML
 */
function renderSidebar(activePage) {
  return `
  <nav class="sidebar">
    <ul class="sidebar-nav">
      <li><a href="../dashboard/index.html" class="${activePage==='dashboard' ? 'active':''}">Dashboard</a></li>
      <li data-role="admin,receptionist,doctor"><a href="../patients/list.html" class="${activePage==='patients' ? 'active':''}">Patients</a></li>
      <li data-role="admin,receptionist"><a href="../patients/register.html" class="${activePage==='register' ? 'active':''}">Register Patient</a></li>
      <li data-role="admin,receptionist,doctor"><a href="../appointments/index.html" class="${activePage==='appointments' ? 'active':''}">Appointments</a></li>
      <li data-role="admin,receptionist"><a href="../billing/index.html" class="${activePage==='billing' ? 'active':''}">Billing</a></li>
      <li data-role="admin"><a href="../reports/index.html" class="${activePage==='reports' ? 'active':''}">Reports</a></li>
    </ul>
  </nav>`;
}

/**
 * Render header with user info and navigation
 * @returns {string} Header HTML
 */
function renderHeader() {
  const name = sessionStorage.getItem('name') || '';
  const role = sessionStorage.getItem('role') || '';
  
  return `
  <header class="header">
    <div class="header-logo">HealthHub Bridge</div>
    <div class="header-search">
      <input type="text" placeholder="Search patients..." id="global-search" class="form-control">
    </div>
    <div class="header-right">
      <button class="notif-bell" onclick="toggleNotifications()">Notifications <span class="notif-count" id="notif-count">0</span></button>
      <div class="header-user">
        <span>${name}</span>
        <span class="role-badge ${role}">${role}</span>
      </div>
      <button class="btn btn-outline btn-sm" onclick="logout()">Logout</button>
    </div>
  </header>`;
}

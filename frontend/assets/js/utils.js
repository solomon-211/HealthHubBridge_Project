const API_BASE_URL =
  window.location.protocol.startsWith('http') && window.location.hostname
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : 'http://localhost:5000';

function authGuard() {
  if (!sessionStorage.getItem('role')) {
    window.location.href = '/auth/login.html';
  }
}

function checkRole(allowedRoles) {
  return allowedRoles.includes(sessionStorage.getItem('role'));
}

function applyRoleVisibility() {
  const currentRole = sessionStorage.getItem('role');
  document.querySelectorAll('[data-role]').forEach(element => {
    const allowedRoles = element.getAttribute('data-role').split(',').map(r => r.trim());
    element.style.display = allowedRoles.includes(currentRole) ? '' : 'none';
  });
}

function checkSessionTimeout() {
  const loginTime = sessionStorage.getItem('login_time');
  if (!loginTime) return;

  const elapsedSeconds = (Date.now() - Number(loginTime)) / 1000;
  if (elapsedSeconds > 3600) {
    showToast('Session expired. Please log in again.', 'warning');
    setTimeout(logout, 1500);
  }
}

function logout() {
  fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
  sessionStorage.clear();
  window.location.href = '/auth/login.html';
}

async function apiFetch(endpoint, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const defaultHeaders = isFormData ? {} : { 'Content-Type': 'application/json' };

  const requestConfig = {
    ...options,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    }
  };

  showSpinner('global-spinner');

  try {
    const response = await fetch(API_BASE_URL + endpoint, requestConfig);

    if (response.status === 401) {
      sessionStorage.clear();
      window.location.href = '/auth/login.html';
      return null;
    }

    const rawText = await response.text();
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    const looksLikeJson = contentType.includes('application/json') || rawText.trim().startsWith('{') || rawText.trim().startsWith('[');

    let data = null;
    if (rawText) {
      if (looksLikeJson) {
        try {
          data = JSON.parse(rawText);
        } catch (_parseError) {
          if (!response.ok) {
            throw new Error(`Server returned an invalid JSON error response (HTTP ${response.status})`);
          }
        }
      } else if (!response.ok) {
        data = { error: rawText.trim() };
      }
    }

    if (!response.ok) {
      const serverMessage = data?.error || data?.message;
      throw new Error(serverMessage || `Request failed (HTTP ${response.status})`);
    }

    return data ?? {};

  } catch (error) {
    if (error && error.name === 'TypeError') {
      showToast('Cannot connect to server. Is Flask running?', 'error');
    } else {
      showToast((error && error.message) ? error.message : 'Unexpected error occurred', 'error');
    }
    console.error('API Error:', error);
    throw error;

  } finally {
    hideSpinner('global-spinner');
  }
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');

  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

function showSpinner(spinnerId) {
  const element = document.getElementById(spinnerId);
  if (element) element.style.display = 'flex';
}

function hideSpinner(spinnerId) {
  const element = document.getElementById(spinnerId);
  if (element) element.style.display = 'none';
}

function showModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.add('open');
}

function hideModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.remove('open');
}

function loadingState(btn, isLoading) {
  if (!btn) return;
  btn.disabled = isLoading;
  if (isLoading) {
    btn._originalText = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span> Loading...';
  } else {
    btn.textContent = btn._originalText || 'Submit';
  }
}

function validatePhone(phone) {
  return String(phone).trim().length >= 7;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d)) return '';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '0 SSP';
  const num = Number(amount);
  if (isNaN(num)) return '0 SSP';
  return num.toLocaleString('en-US') + ' SSP';
}

function calculateAge(dateOfBirth) {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getStatusBadgeClass(status) {
  const statusClassMap = {
    'Scheduled': 'badge-scheduled',
    'Completed': 'badge-completed',
    'Cancelled': 'badge-cancelled',
    'No-show':   'badge-no-show',
    'Paid':      'badge-paid',
    'Partial':   'badge-partial',
    'Unpaid':    'badge-unpaid',
    'Active':    'badge-active',
    'Expired':   'badge-expired'
  };
  return statusClassMap[status] || 'badge-cancelled';
}

function renderBadge(status) {
  return `<span class="badge ${getStatusBadgeClass(status)}">${status}</span>`;
}

function getPrescriptionStatus(endTime) {
  if (!endTime) return 'Active';
  return new Date(endTime) > new Date() ? 'Active' : 'Expired';
}

function debounce(func, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

function paginate(data, page, perPage = 10) {
  const total = data.length;
  const totalPages = Math.ceil(total / perPage);
  const startIndex = (page - 1) * perPage;
  return {
    items: data.slice(startIndex, startIndex + perPage),
    totalPages,
    currentPage: page,
    total,
    start: startIndex + 1,
    end: Math.min(startIndex + perPage, total)
  };
}

function renderPagination(containerId, totalPages, currentPage, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let html = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="(${onPageChange})(${currentPage - 1})">Prev</button>`;

  for (let page = 1; page <= totalPages; page++) {
    html += `<button class="page-btn ${page === currentPage ? 'active' : ''}" onclick="(${onPageChange})(${page})">${page}</button>`;
  }

  html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="(${onPageChange})(${currentPage + 1})">Next</button>`;
  container.innerHTML = html;
}

function renderSidebar(activePage) {
  const isActive = (page) => activePage === page ? 'active' : '';
  return `
  <nav class="sidebar">
    <ul class="sidebar-nav">
      <li>
        <a href="/dashboard/index.html" class="${isActive('dashboard')}">Dashboard</a>
      </li>
      <li data-role="admin,receptionist,doctor">
        <a href="/patients/list.html" class="${isActive('patients')}">Patients</a>
      </li>
      <li data-role="admin,receptionist">
        <a href="/patients/register.html" class="${isActive('register')}">Register Patient</a>
      </li>
      <li data-role="admin">
        <a href="/doctors/index.html" class="${isActive('doctors')}">Doctors</a>
      </li>
      <li data-role="admin,receptionist,doctor">
        <a href="/appointments/index.html" class="${isActive('appointments')}">Appointments</a>
      </li>
      <li data-role="admin,receptionist">
        <a href="/billing/index.html" class="${isActive('billing')}">Billing</a>
      </li>
      <li data-role="admin,doctor">
        <a href="/reports/index.html" class="${isActive('reports')}">Reports</a>
      </li>
    </ul>
  </nav>`;
}

function renderHeader() {
  const username = sessionStorage.getItem('name') || '';
  const role = sessionStorage.getItem('role') || '';

  return `
  <header class="header">
    <div class="logo">
      <div class="logo-icon">HB</div>
      <div class="header-logo">HealthHub Bridge</div>
    </div>
    <div class="header-right">
      <div class="header-user">
        <span style="font-size:13px;font-weight:500;">${username}</span>
        <span class="role-badge ${role}">${role}</span>
      </div>
      <button class="btn btn-outline btn-sm" onclick="logout()">Logout</button>
    </div>
  </header>`;
}

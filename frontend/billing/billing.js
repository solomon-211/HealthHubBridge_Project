authGuard();
checkRole(['receptionist', 'admin']) || (location.href = '/dashboard/index.html');
checkSessionTimeout();

document.getElementById('header-slot').outerHTML = renderHeader();
document.getElementById('sidebar-slot').outerHTML = renderSidebar('billing');
applyRoleVisibility();

let allInvoices = [];
let allServices = [];
let allPatients = [];

let pendingPrefillPatientId = sessionStorage.getItem('prefillInvoicePatientId');

async function loadInvoices() {
  try {
    const res = await apiFetch('/api/invoices');
    allInvoices = res?.invoices || [];
    applyFilters();
  } catch (e) {
    document.getElementById('invoices-list').innerHTML =
      '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--danger);">Failed to load invoices</td></tr>';
  }
}

function applyFilters() {
  const search = document.getElementById('filter-patient').value.trim().toLowerCase();
  const status = document.getElementById('filter-status').value;
  const filtered = allInvoices.filter(inv => {
    const name   = `${inv.first_name} ${inv.last_name}`.toLowerCase();
    const clinic = (inv.clinic_number || '').toLowerCase();
    if (search && !name.includes(search) && !clinic.includes(search)) return false;
    if (status && inv.payment_status !== status) return false;
    return true;
  });
  renderInvoices(filtered);
}

function renderInvoices(invoices) {
  const tbody = document.getElementById('invoices-list');
  if (!invoices.length) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-state-text">No invoices found</div></div></td></tr>';
    return;
  }
  tbody.innerHTML = invoices.map(inv => `
    <tr>
      <td><strong>INV-${String(inv.invoice_id).padStart(4,'0')}</strong></td>
      <td>${inv.first_name} ${inv.last_name}<br><small style="color:var(--text-muted);">${inv.clinic_number}</small></td>
      <td>${formatDate(inv.invoice_date)}</td>
      <td>${formatCurrency(inv.total_amount)}</td>
      <td>${formatCurrency(inv.amount_due)}</td>
      <td>${renderBadge(inv.payment_status)}</td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-outline btn-sm" onclick="location.href='/billing/invoice.html?id=${inv.invoice_id}'">View</button>
          ${inv.payment_status !== 'Paid' ? `<button class="btn btn-primary btn-sm" onclick="openPaymentModal(${inv.invoice_id})">Pay</button>` : ''}
        </div>
      </td>
    </tr>`).join('');
}

async function openCreateInvoice() {
  document.getElementById('services-tbody-new').innerHTML = '';
  document.getElementById('invoice-total-preview').textContent = '0 SSP';
  document.getElementById('invoice-patient-select').innerHTML = '<option value="">Loading patients...</option>';
  showModal('create-invoice-modal');

  try {
    const [pRes, sRes] = await Promise.all([
      allPatients.length ? Promise.resolve({ patients: allPatients }) : apiFetch('/api/patients'),
      allServices.length ? Promise.resolve({ services: allServices }) : apiFetch('/api/services')
    ]);
    allPatients = pRes?.patients || [];
    allServices = sRes?.services || [];

    const sel = document.getElementById('invoice-patient-select');
    sel.innerHTML = '<option value="">Select Patient</option>' +
      allPatients.map(p => `<option value="${p.patient_id}">${p.first_name} ${p.last_name} (${p.clinic_number})</option>`).join('');

    if (pendingPrefillPatientId) {
      sel.value = String(pendingPrefillPatientId);
      pendingPrefillPatientId = null;
      sessionStorage.removeItem('prefillInvoicePatientId');
    }
    addServiceRow();
  } catch (e) {
    showToast('Failed to load data for invoice', 'error');
  }
}

function addServiceRow() {
  const tbody = document.getElementById('services-tbody-new');
  const tr = document.createElement('tr');
  const opts = allServices.map(s =>
    `<option value="${s.service_id}" data-price="${s.unit_price}">${s.service_name} — ${formatCurrency(s.unit_price)}</option>`
  ).join('');
  tr.innerHTML = `
    <td style="padding:6px 4px;">
      <select class="form-control svc-select" style="font-size:12px;" onchange="onServicePick(this)">
        <option value="">— Select service —</option>${opts}
      </select>
    </td>
    <td style="padding:6px 4px;text-align:right;">
      <input type="number" class="form-control qty-input" value="1" min="1" style="width:54px;font-size:12px;text-align:right;" oninput="updateInvoiceTotal()">
    </td>
    <td style="padding:6px 4px;text-align:right;">
      <input type="number" class="form-control price-input" value="0" min="0" step="0.01" style="width:90px;font-size:12px;text-align:right;" readonly>
    </td>
    <td style="padding:6px 4px;text-align:center;">
      <button type="button" onclick="this.closest('tr').remove();updateInvoiceTotal();"
        style="background:none;border:none;color:var(--danger);font-size:16px;cursor:pointer;">×</button>
    </td>`;
  tbody.appendChild(tr);
}

function onServicePick(select) {
  const opt = select.options[select.selectedIndex];
  const row = select.closest('tr');
  row.querySelector('.price-input').value = opt.value ? (parseFloat(opt.dataset.price) || 0).toFixed(2) : '0';
  updateInvoiceTotal();
}

function updateInvoiceTotal() {
  let total = 0;
  document.querySelectorAll('#services-tbody-new tr').forEach(tr => {
    const qty   = parseFloat(tr.querySelector('.qty-input')?.value)   || 0;
    const price = parseFloat(tr.querySelector('.price-input')?.value) || 0;
    total += qty * price;
  });
  document.getElementById('invoice-total-preview').textContent = formatCurrency(total);
}

async function submitCreateInvoice() {
  const patientId = document.getElementById('invoice-patient-select').value;
  if (!patientId) { showToast('Please select a patient', 'error'); return; }

  const items = [];
  document.querySelectorAll('#services-tbody-new tr').forEach(tr => {
    const serviceId = tr.querySelector('.svc-select')?.value;
    const qty       = parseInt(tr.querySelector('.qty-input')?.value) || 1;
    if (serviceId) items.push({ service_id: parseInt(serviceId), quantity: qty });
  });

  if (!items.length) { showToast('Please select at least one service', 'error'); return; }

  try {
    await apiFetch('/api/invoices', {
      method: 'POST',
      body: JSON.stringify({ patient_id: parseInt(patientId), items })
    });
    hideModal('create-invoice-modal');
    showToast('Invoice created successfully', 'success');
    loadInvoices();
  } catch (e) {
    showToast(e.message || 'Failed to create invoice', 'error');
  }
}

function openPaymentModal(invoiceId) {
  document.getElementById('pay-invoice-id').value = invoiceId;
  document.getElementById('pay-amount').value = '';
  document.getElementById('pay-method').value = 'Cash';
  document.getElementById('pay-ref').value = '';
  showModal('payment-modal');
}

async function submitPayment() {
  const invoiceId = document.getElementById('pay-invoice-id').value;
  const amount    = parseFloat(document.getElementById('pay-amount').value);
  const method    = document.getElementById('pay-method').value;
  const ref       = document.getElementById('pay-ref').value.trim();

  if (!amount || amount <= 0) { showToast('Enter a valid amount', 'error'); return; }

  try {
    await apiFetch('/api/payments', {
      method: 'POST',
      body: JSON.stringify({
        invoice_id:     parseInt(invoiceId),
        amount_paid:    amount,
        payment_method: method,
        payment_date:   new Date().toISOString().split('T')[0],
        reference_no:   ref,
        received_by:    sessionStorage.getItem('name') || ''
      })
    });
    hideModal('payment-modal');
    showToast('Payment recorded successfully', 'success');
    loadInvoices();
  } catch (e) {
    showToast(e.message || 'Failed to record payment', 'error');
  }
}

document.getElementById('filter-patient').addEventListener('input', applyFilters);
document.getElementById('filter-status').addEventListener('change', applyFilters);

loadInvoices();

if (pendingPrefillPatientId) openCreateInvoice();

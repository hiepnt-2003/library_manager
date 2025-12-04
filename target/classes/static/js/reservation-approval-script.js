// ============================================
// RESERVATION APPROVAL - REFACTORED JAVASCRIPT
// ============================================

// ============================================
// 1. API CONFIGURATION
// ============================================
const API_BASE_URL = 'http://localhost:8080/api/reservations';
const LIBRARIAN_ID = 1; // ID của nhân viên đang đăng nhập

// ============================================
// 2. GLOBAL STATE
// ============================================
let currentReservation = null;
let allReservations = [];
let currentTab = 'pending';

// ============================================
// 3. API FUNCTIONS - Tách biệt các function gọi API
// ============================================

/**
 * API: Lấy danh sách phiếu mượn theo status
 */
async function apiGetReservationsByStatus(status) {
    const response = await fetch(`${API_BASE_URL}/${status.toLowerCase()}`);
    if (!response.ok) {
        throw new Error(`Không thể tải danh sách phiếu mượn ${status}`);
    }
    return await response.json();
}

/**
 * API: Lấy chi tiết phiếu mượn
 */
async function apiGetReservationDetail(reservationId) {
    const response = await fetch(`${API_BASE_URL}/detail/${reservationId}`);
    if (!response.ok) {
        throw new Error('Không thể tải thông tin phiếu mượn');
    }
    return await response.json();
}

/**
 * API: Duyệt hoặc từ chối phiếu mượn
 */
async function apiApproveReservation(reservationId, librarianId, approved, rejectReason = null) {
    const requestData = {
        reservationId: reservationId,
        librarianId: librarianId,
        approved: approved
    };

    if (!approved && rejectReason) {
        requestData.rejectReason = rejectReason;
    }

    const response = await fetch(`${API_BASE_URL}/approve`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || 'Có lỗi xảy ra');
    }

    return result;
}

// ============================================
// 4. UI FUNCTIONS - Các function hiển thị
// ============================================

/**
 * Hiển thị loading state
 */
function showLoading() {
    const tbody = document.getElementById('reservationsTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Đang tải dữ liệu...</p>
            </td>
        </tr>
    `;
}

/**
 * Hiển thị empty state
 */
function showEmptyState() {
    const tbody = document.getElementById('reservationsTableBody');
    const messages = {
        'pending': 'Không có phiếu mượn nào chờ duyệt',
        'approved': 'Không có phiếu mượn nào đã duyệt (chờ độc giả nhận)',
        'rejected': 'Không có phiếu mượn nào đã từ chối',
        'expired': 'Không có phiếu mượn nào quá hạn nhận (quá 3 ngày không nhận)'
    };

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <h5>${messages[currentTab]}</h5>
                    <p>Danh sách trống</p>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Hiển thị danh sách phiếu mượn
 */
function displayReservations(reservations) {
    const tbody = document.getElementById('reservationsTableBody');

    if (reservations.length === 0) {
        showEmptyState();
        return;
    }

    tbody.innerHTML = reservations.map(reservation => {
        const readerName = reservation.reader ? reservation.reader.fullName : 'N/A';
        const readerPhone = reservation.reader ? reservation.reader.phone : '';
        const readerCardNumber = reservation.reader ? reservation.reader.libraryCardNumber : '';
        const bookCount = reservation.reservationItems ? reservation.reservationItems.length : 0;

        let additionalInfo = '';
        if (currentTab === 'approved' && reservation.approvalDate) {
            additionalInfo = `
                <br><small class="text-success">
                    <i class="bi bi-check-circle"></i> Duyệt: ${formatDate(reservation.approvalDate)}
                </small>
            `;
        } else if (currentTab === 'rejected' && reservation.approvalDate) {
            additionalInfo = `
                <br><small class="text-danger">
                    <i class="bi bi-x-circle"></i> Từ chối: ${formatDate(reservation.approvalDate)}
                </small>
            `;
        }

        return `
        <tr onclick="viewReservationDetails(${reservation.id})" style="cursor: pointer;">
            <td data-label="ID"><strong>#${reservation.id}</strong></td>
            <td data-label="Độc giả">
                <div>
                    <i class="bi bi-person"></i> 
                    <strong>${readerName}</strong>
                    ${readerCardNumber ? `<br><small class="text-muted"><i class="bi bi-credit-card"></i> ${readerCardNumber}</small>` : ''}
                    ${readerPhone ? `<br><small class="text-muted"><i class="bi bi-telephone"></i> ${readerPhone}</small>` : ''}
                </div>
            </td>
            <td data-label="Ngày yêu cầu">
                <i class="bi bi-calendar"></i> ${formatDate(reservation.requestDate)}
                ${additionalInfo}
            </td>
            <td data-label="Số sách" class="text-center">
                <i class="bi bi-book"></i> <strong>${bookCount}</strong> cuốn
            </td>
            <td data-label="Trạng thái">
                <span class="status-badge status-${reservation.status.toLowerCase()}">
                    ${getStatusText(reservation.status)}
                </span>
            </td>
            <td data-label="Thao tác" class="text-center">
                <div class="action-buttons justify-content-center">
                    <button class="btn btn-sm btn-info" 
                            onclick="event.stopPropagation(); viewReservationDetails(${reservation.id})" 
                            title="Xem chi tiết">
                        <i class="bi bi-eye"></i>
                    </button>
                    ${currentTab === 'pending' ? `
                    <button class="btn btn-sm btn-success" 
                            onclick="event.stopPropagation(); quickApprove(${reservation.id})" 
                            title="Duyệt nhanh">
                        <i class="bi bi-check-lg"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" 
                            onclick="event.stopPropagation(); quickReject(${reservation.id})" 
                            title="Từ chối nhanh">
                        <i class="bi bi-x-lg"></i>
                    </button>
                    ` : ''}
                </div>
            </td>
        </tr>
        `;
    }).join('');
}

/**
 * Hiển thị chi tiết phiếu mượn trong modal
 */
function displayReservationDetails(reservation) {
    const reader = reservation.reader || {};
    const readerInfo = `
        <div class="reader-info">
            <h6><i class="bi bi-person-badge"></i> Thông tin độc giả:</h6>
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Họ tên:</strong> ${reader.fullName || 'N/A'}</p>
                    <p><strong>Số thẻ:</strong> ${reader.libraryCardNumber || 'N/A'}</p>
                    <p><strong>Username:</strong> ${reader.username || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Số điện thoại:</strong> ${reader.phone || 'N/A'}</p>
                    <p><strong>Ngày tham gia:</strong> ${formatDate(reader.dateJoined)}</p>
                    <p><strong>Hết hạn thẻ:</strong> ${formatDate(reader.membershipExpiryDate)}</p>
                </div>
            </div>
        </div>
    `;

    const reservationInfo = `
        <div class="card mb-3">
            <div class="card-body">
                <h6><i class="bi bi-file-text"></i> Thông tin phiếu mượn:</h6>
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>ID Phiếu:</strong> #${reservation.id}</p>
                        <p><strong>Ngày yêu cầu:</strong> ${formatDate(reservation.requestDate)}</p>
                        <p><strong>Trạng thái:</strong> 
                            <span class="status-badge status-${reservation.status.toLowerCase()}">
                                ${getStatusText(reservation.status)}
                            </span>
                        </p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Số lượng sách:</strong> ${reservation.reservationItems ? reservation.reservationItems.length : 0} cuốn</p>
                        ${reservation.approvalDate ? `<p><strong>Ngày duyệt:</strong> ${formatDate(reservation.approvalDate)}</p>` : ''}
                        ${reservation.pickupDate ? `<p><strong>Ngày lấy:</strong> ${formatDate(reservation.pickupDate)}</p>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    const books = reservation.reservationItems || [];
    const booksHtml = books.map(item => {
        const book = item.book || {};
        return `
        <div class="book-item">
            <div class="d-flex justify-content-between align-items-start">
                <div style="flex: 1;">
                    <div>
                        <i class="bi bi-book"></i> 
                        <strong>${book.title || `Sách ID: #${item.bookId}`}</strong>
                    </div>
                    ${book.publisher ? `<small class="text-muted"><i class="bi bi-building"></i> ${book.publisher}</small>` : ''}
                    ${book.bookAvailable !== undefined ? `<br><small class="text-muted"><i class="bi bi-stack"></i> Còn lại: ${book.bookAvailable} cuốn</small>` : ''}
                </div>
                <span class="status-badge status-${item.status.toLowerCase()}">
                    ${getStatusText(item.status)}
                </span>
            </div>
        </div>
        `;
    }).join('');

    document.getElementById('reservationDetails').innerHTML = readerInfo + reservationInfo;
    document.getElementById('booksList').innerHTML = booksHtml || '<p class="text-muted">Không có sách nào</p>';

    const approveBtn = document.getElementById('approveBtn');
    const rejectBtn = document.getElementById('rejectBtn');

    if (reservation.status === 'PENDING') {
        approveBtn.style.display = 'inline-block';
        rejectBtn.style.display = 'inline-block';
    } else {
        approveBtn.style.display = 'none';
        rejectBtn.style.display = 'none';
    }
}

/**
 * Cập nhật thống kê
 */
function updateStatistics() {
    const pending = allReservations.filter(r => r.status === 'PENDING').length;
    const approved = allReservations.filter(r => r.status === 'APPROVED').length;
    const rejected = allReservations.filter(r => r.status === 'REJECTED').length;
    const expired = allReservations.filter(r => r.status === 'EXPIRED').length;

    document.getElementById('totalPending').textContent = pending;
    document.getElementById('totalApproved').textContent = approved;
    document.getElementById('totalRejected').textContent = rejected;
    document.getElementById('totalExpired').textContent = expired;
}

/**
 * Hiển thị alert message
 */
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');

    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="bi bi-${getAlertIcon(type)}"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

    alertContainer.innerHTML = alertHtml;

    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            alert.classList.remove('show');
            setTimeout(() => {
                alertContainer.innerHTML = '';
            }, 300);
        }
    }, 5000);
}

// ============================================
// 5. BUSINESS LOGIC FUNCTIONS
// ============================================

/**
 * Load tất cả phiếu mượn
 */
async function loadAllReservations() {
    try {
        showLoading();

        const [pending, approved, rejected, expired] = await Promise.all([
            apiGetReservationsByStatus('PENDING'),
            apiGetReservationsByStatus('APPROVED'),
            apiGetReservationsByStatus('REJECTED'),
            apiGetReservationsByStatus('EXPIRED')
        ]);

        allReservations = [...pending, ...approved, ...rejected, ...expired];

        console.log('Loaded reservations:', {
            pending: pending.length,
            approved: approved.length,
            rejected: rejected.length,
            expired: expired.length,
            total: allReservations.length
        });

        filterAndDisplayReservations();
        updateStatistics();

    } catch (error) {
        console.error('Error loading reservations:', error);
        showAlert('Lỗi khi tải danh sách phiếu mượn: ' + error.message, 'danger');
        showEmptyState();
    }
}

/**
 * Filter và hiển thị phiếu mượn theo tab
 */
function filterAndDisplayReservations() {
    let filteredReservations = [];

    switch (currentTab) {
        case 'pending':
            filteredReservations = allReservations.filter(r => r.status === 'PENDING');
            break;
        case 'approved':
            filteredReservations = allReservations.filter(r => r.status === 'APPROVED');
            break;
        case 'rejected':
            filteredReservations = allReservations.filter(r => r.status === 'REJECTED');
            break;
        case 'expired':
            filteredReservations = allReservations.filter(r => r.status === 'EXPIRED');
            break;
    }

    displayReservations(filteredReservations);
}

/**
 * Chuyển tab
 */
function switchTab(tabName) {
    currentTab = tabName;

    document.querySelectorAll('[data-tab]').forEach(tab => {
        const isActive = tab.getAttribute('data-tab') === tabName;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive);
    });

    const panel = document.getElementById('reservations-panel');
    if (panel) {
        panel.setAttribute('aria-labelledby', `${tabName}-tab`);
    }

    filterAndDisplayReservations();
}

/**
 * Filter theo status khi click vào statistics
 */
function filterByStatus(status) {
    const tabMap = {
        'PENDING': 'pending',
        'APPROVED': 'approved',
        'REJECTED': 'rejected',
        'EXPIRED': 'expired'
    };

    const tab = tabMap[status];
    if (tab) {
        switchTab(tab);
    }
}

/**
 * Xem chi tiết phiếu mượn
 */
async function viewReservationDetails(reservationId) {
    try {
        currentReservation = await apiGetReservationDetail(reservationId);
        console.log('Current reservation:', currentReservation);

        displayReservationDetails(currentReservation);

        const modal = new bootstrap.Modal(document.getElementById('reservationModal'));
        modal.show();

    } catch (error) {
        console.error('Error viewing reservation:', error);
        showAlert('Lỗi khi xem chi tiết phiếu mượn: ' + error.message, 'danger');
    }
}

/**
 * Duyệt nhanh từ danh sách
 */
async function quickApprove(reservationId) {
    if (!confirm('Bạn có chắc chắn muốn duyệt phiếu mượn này?')) {
        return;
    }

    await processApproval(reservationId, true, null);
}

/**
 * Từ chối nhanh từ danh sách
 */
async function quickReject(reservationId) {
    const reason = prompt('Nhập lý do từ chối:');
    if (reason === null) return;

    if (!reason.trim()) {
        showAlert('Vui lòng nhập lý do từ chối', 'warning');
        return;
    }

    await processApproval(reservationId, false, reason);
}

/**
 * Duyệt phiếu mượn từ modal
 */
async function approveReservation() {
    if (!currentReservation) {
        showAlert('Không tìm thấy thông tin phiếu mượn', 'danger');
        return;
    }

    if (!confirm('Bạn có chắc chắn muốn duyệt phiếu mượn này?')) {
        return;
    }

    await processApproval(currentReservation.id, true, null);

    const modal = bootstrap.Modal.getInstance(document.getElementById('reservationModal'));
    if (modal) modal.hide();
}

/**
 * Hiển thị modal từ chối
 */
function showRejectModal() {
    const reservationModal = bootstrap.Modal.getInstance(document.getElementById('reservationModal'));
    if (reservationModal) reservationModal.hide();

    document.getElementById('rejectReason').value = '';

    const rejectModal = new bootstrap.Modal(document.getElementById('rejectModal'));
    rejectModal.show();
}

/**
 * Từ chối phiếu mượn từ modal
 */
async function rejectReservation() {
    if (!currentReservation) {
        showAlert('Không tìm thấy thông tin phiếu mượn', 'danger');
        return;
    }

    const reason = document.getElementById('rejectReason').value.trim();

    if (!reason) {
        showAlert('Vui lòng nhập lý do từ chối', 'warning');
        return;
    }

    await processApproval(currentReservation.id, false, reason);

    const modal = bootstrap.Modal.getInstance(document.getElementById('rejectModal'));
    if (modal) modal.hide();
}

/**
 * Xử lý approval/rejection
 */
async function processApproval(reservationId, approved, rejectReason) {
    try {
        const result = await apiApproveReservation(reservationId, LIBRARIAN_ID, approved, rejectReason);

        console.log('Approval result:', result);
        showAlert(result.message, 'success');
        loadAllReservations();

    } catch (error) {
        console.error('Error processing approval:', error);
        showAlert('Lỗi khi xử lý phiếu mượn: ' + error.message, 'danger');
    }
}

// ============================================
// 6. HELPER FUNCTIONS
// ============================================

/**
 * Format date to Vietnamese format
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

/**
 * Get status text in Vietnamese
 */
function getStatusText(status) {
    const statusMap = {
        'PENDING': 'Chờ duyệt',
        'APPROVED': 'Đã duyệt',
        'REJECTED': 'Đã từ chối',
        'EXPIRED': 'Hết hạn',
        'BORROWED': 'Đang mượn',
        'OVERDUE': 'Quá hạn',
        'RETURNED': 'Đã trả',
        'COMPLETED': 'Hoàn thành'
    };
    return statusMap[status] || status;
}

/**
 * Get alert icon
 */
function getAlertIcon(type) {
    const icons = {
        'success': 'check-circle-fill',
        'danger': 'exclamation-triangle-fill',
        'warning': 'exclamation-circle-fill',
        'info': 'info-circle-fill'
    };
    return icons[type] || 'info-circle-fill';
}

// ============================================
// 7. EVENT LISTENERS & INITIALIZATION
// ============================================

/**
 * Setup tab listeners
 */
function setupTabListeners() {
    const tabs = document.querySelectorAll('[data-tab]');
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            switchTab(this.getAttribute('data-tab'));
        });
    });
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            loadAllReservations();
        }

        if (e.key === '1') switchTab('pending');
        if (e.key === '2') switchTab('approved');
        if (e.key === '3') switchTab('rejected');
        if (e.key === '4') switchTab('expired');
    });
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log('Reservation Approval System Initialized');
    console.log('API Base URL:', API_BASE_URL);
    console.log('Librarian ID:', LIBRARIAN_ID);

    loadAllReservations();
    setupTabListeners();
    setupKeyboardShortcuts();
});

// ============================================
// 8. EXPORT FUNCTIONS (for HTML onclick)
// ============================================
window.loadAllReservations = loadAllReservations;
window.switchTab = switchTab;
window.filterByStatus = filterByStatus;
window.viewReservationDetails = viewReservationDetails;
window.quickApprove = quickApprove;
window.quickReject = quickReject;
window.approveReservation = approveReservation;
window.showRejectModal = showRejectModal;
window.rejectReservation = rejectReservation;
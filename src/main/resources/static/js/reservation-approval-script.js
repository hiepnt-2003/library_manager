// ============================================
// RESERVATION APPROVAL - JAVASCRIPT
// ============================================

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api/reservations';
const LIBRARIAN_ID = 1; // ID của nhân viên đang đăng nhập (thay đổi theo nhu cầu)

// Global Variables
let currentReservation = null;
let allReservations = [];

// ============================================
// INITIALIZATION
// ============================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Reservation Approval System Initialized');
    loadPendingReservations();
});

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Load pending reservations from API
 * Automatically expires reservations older than 3 days
 */
async function loadPendingReservations() {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/pending`);
        
        if (!response.ok) {
            throw new Error('Không thể tải danh sách phiếu mượn');
        }
        
        allReservations = await response.json();
        console.log('Loaded reservations:', allReservations);
        
        displayReservations(allReservations);
        updateStatistics();
        
    } catch (error) {
        console.error('Error loading reservations:', error);
        showAlert('Lỗi khi tải danh sách phiếu mượn: ' + error.message, 'danger');
        showEmptyState();
    }
}

/**
 * Display reservations in table
 */
function displayReservations(reservations) {
    const tbody = document.getElementById('reservationsTableBody');
    
    if (reservations.length === 0) {
        showEmptyState();
        return;
    }
    
    tbody.innerHTML = reservations.map(reservation => `
        <tr onclick="viewReservationDetails(${reservation.id})">
            <td data-label="ID"><strong>#${reservation.id}</strong></td>
            <td data-label="Độc giả">
                <i class="bi bi-person"></i> Độc giả #${reservation.readerId}
            </td>
            <td data-label="Ngày yêu cầu">
                <i class="bi bi-calendar"></i> ${formatDate(reservation.requestDate)}
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
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * View reservation details
 */
async function viewReservationDetails(reservationId) {
    try {
        // Get reservation details
        const resResponse = await fetch(`${API_BASE_URL}/${reservationId}`);
        if (!resResponse.ok) throw new Error('Không thể tải thông tin phiếu mượn');
        
        currentReservation = await resResponse.json();
        console.log('Current reservation:', currentReservation);
        
        // Get books in reservation
        const booksResponse = await fetch(`${API_BASE_URL}/${reservationId}/items`);
        if (!booksResponse.ok) throw new Error('Không thể tải danh sách sách');
        
        const books = await booksResponse.json();
        console.log('Books in reservation:', books);
        
        // Display details
        displayReservationDetails(currentReservation, books);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('reservationModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error viewing reservation:', error);
        showAlert('Lỗi khi xem chi tiết phiếu mượn: ' + error.message, 'danger');
    }
}

/**
 * Display reservation details in modal
 */
function displayReservationDetails(reservation, books) {
    const detailsHtml = `
        <div class="reader-info">
            <h6><i class="bi bi-person-badge"></i> Thông tin phiếu mượn:</h6>
            <div class="row">
                <div class="col-md-6">
                    <p><strong>ID Phiếu:</strong> #${reservation.id}</p>
                    <p><strong>Độc giả ID:</strong> #${reservation.readerId}</p>
                    <p><strong>Ngày yêu cầu:</strong> ${formatDate(reservation.requestDate)}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Trạng thái:</strong> 
                        <span class="status-badge status-${reservation.status.toLowerCase()}">
                            ${getStatusText(reservation.status)}
                        </span>
                    </p>
                    <p><strong>Số lượng sách:</strong> ${books.length} cuốn</p>
                    ${reservation.approvalDate ? `<p><strong>Ngày duyệt:</strong> ${formatDate(reservation.approvalDate)}</p>` : ''}
                </div>
            </div>
        </div>
    `;
    
    const booksHtml = books.map(item => `
        <div class="book-item">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <i class="bi bi-book"></i> <strong>Sách ID: #${item.bookId}</strong>
                </div>
                <span class="status-badge status-${item.status.toLowerCase()}">
                    ${getStatusText(item.status)}
                </span>
            </div>
        </div>
    `).join('');
    
    document.getElementById('reservationDetails').innerHTML = detailsHtml;
    document.getElementById('booksList').innerHTML = booksHtml || '<p class="text-muted">Không có sách nào</p>';
}

// ============================================
// APPROVAL FUNCTIONS
// ============================================

/**
 * Quick approve from list
 */
async function quickApprove(reservationId) {
    if (!confirm('Bạn có chắc chắn muốn duyệt phiếu mượn này?')) {
        return;
    }
    
    await processApproval(reservationId, true, null);
}

/**
 * Quick reject from list
 */
async function quickReject(reservationId) {
    const reason = prompt('Nhập lý do từ chối:');
    if (reason === null) return; // User cancelled
    
    if (!reason.trim()) {
        showAlert('Vui lòng nhập lý do từ chối', 'warning');
        return;
    }
    
    await processApproval(reservationId, false, reason);
}

/**
 * Approve reservation from modal
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
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('reservationModal'));
    if (modal) modal.hide();
}

/**
 * Show reject modal
 */
function showRejectModal() {
    const reservationModal = bootstrap.Modal.getInstance(document.getElementById('reservationModal'));
    if (reservationModal) reservationModal.hide();
    
    document.getElementById('rejectReason').value = '';
    
    const rejectModal = new bootstrap.Modal(document.getElementById('rejectModal'));
    rejectModal.show();
}

/**
 * Reject reservation from modal
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
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('rejectModal'));
    if (modal) modal.hide();
}

/**
 * Process approval/rejection
 */
async function processApproval(reservationId, approved, rejectReason) {
    try {
        const requestData = {
            reservationId: reservationId,
            librarianId: LIBRARIAN_ID,
            approved: approved
        };
        
        if (!approved && rejectReason) {
            requestData.rejectReason = rejectReason;
        }
        
        console.log('Processing approval:', requestData);
        
        const response = await fetch(`${API_BASE_URL}/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        console.log('Approval result:', result);
        
        if (response.ok && result.success) {
            showAlert(result.message, 'success');
            loadPendingReservations(); // Reload list
        } else {
            showAlert(result.message || 'Có lỗi xảy ra', 'danger');
        }
        
    } catch (error) {
        console.error('Error processing approval:', error);
        showAlert('Lỗi khi xử lý phiếu mượn: ' + error.message, 'danger');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Update statistics
 */
function updateStatistics() {
    document.getElementById('totalPending').textContent = allReservations.length;
    
    // Note: Trong thực tế, bạn cần gọi API riêng để lấy số liệu thống kê đầy đủ
    // Ở đây chỉ hiển thị số phiếu PENDING
    document.getElementById('totalApproved').textContent = '0';
    document.getElementById('totalRejected').textContent = '0';
}

/**
 * Show loading state
 */
function showLoading() {
    const tbody = document.getElementById('reservationsTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Đang tải dữ liệu...</p>
            </td>
        </tr>
    `;
}

/**
 * Show empty state
 */
function showEmptyState() {
    const tbody = document.getElementById('reservationsTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center">
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <h5>Không có phiếu mượn nào chờ duyệt</h5>
                    <p>Tất cả phiếu mượn đã được xử lý</p>
                </div>
            </td>
        </tr>
    `;
}

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
 * Show alert message
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
    
    // Auto dismiss after 5 seconds
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

/**
 * Get icon for alert type
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
// KEYBOARD SHORTCUTS (Optional)
// ============================================

document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + R: Refresh
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        loadPendingReservations();
    }
});

// ============================================
// CONSOLE HELPERS (Development)
// ============================================

console.log('API Base URL:', API_BASE_URL);
console.log('Librarian ID:', LIBRARIAN_ID);
console.log('Available functions:');
console.log('- loadPendingReservations()');
console.log('- viewReservationDetails(id)');
console.log('- quickApprove(id)');
console.log('- quickReject(id)');
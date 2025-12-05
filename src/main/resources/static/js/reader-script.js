// ============================================
// READER MANAGER - REFACTORED JAVASCRIPT
// ============================================

// ============================================
// 1. API CONFIGURATION
// ============================================
const API_BASE_URL = 'http://localhost:8080';
const READERS_API = `${API_BASE_URL}/api/readers`;
const USERS_API = `${API_BASE_URL}/api/users`;

// ============================================
// 2. GLOBAL STATE
// ============================================
let allReaders = [];
let currentReader = null;

// ============================================
// 3. API FUNCTIONS - Tách biệt các function gọi API
// ============================================

/**
 * API: Lấy danh sách tất cả độc giả
 */
async function apiGetAllReaders() {
    const response = await fetch(READERS_API);
    if (!response.ok) {
        throw new Error('Không thể tải danh sách độc giả');
    }
    return await response.json();
}

/**
 * API: Lấy thông tin một độc giả theo ID
 */
async function apiGetReaderById(id) {
    const response = await fetch(`${READERS_API}/${id}`);
    if (!response.ok) {
        throw new Error('Không thể tải thông tin độc giả');
    }
    return await response.json();
}

/**
 * API: Thêm độc giả mới
 */
async function apiAddReader(readerData) {
    const response = await fetch(READERS_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(readerData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể thêm độc giả');
    }
    return await response.json();
}

/**
 * API: Cập nhật thông tin độc giả
 */
async function apiUpdateReader(id, readerData) {
    const response = await fetch(`${READERS_API}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(readerData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể cập nhật độc giả');
    }
    return await response.json();
}

/**
 * API: Vô hiệu hóa user
 */
async function apiDisableUser(userId) {
    const response = await fetch(`${USERS_API}/disable/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Không thể vô hiệu hóa user');
    }
}

/**
 * API: Kiểm tra username đã tồn tại chưa
 */
async function apiCheckUsername(username) {
    const response = await fetch(`${USERS_API}/username/${encodeURIComponent(username)}`);
    if (!response.ok) {
        throw new Error('Không thể kiểm tra username');
    }
    return await response.text();
}

// ============================================
// 4. UI FUNCTIONS - Các function hiển thị
// ============================================

/**
 * Hiển thị loading state
 */
function showLoading() {
    const tbody = document.getElementById('readersTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="text-center">
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
    const tbody = document.getElementById('readersTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="8">
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <h4>Chưa có độc giả nào</h4>
                    <p>Nhấn nút "Thêm Độc giả" để bắt đầu</p>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Hiển thị danh sách độc giả
 */
function displayReaders(readers) {
    const tbody = document.getElementById('readersTableBody');

    if (readers.length === 0) {
        showEmptyState();
        return;
    }

     tbody.innerHTML = readers.map((reader, index) => {
        const nextIndex = (index + 1) % readers.length;
        const nextReaderId = readers[nextIndex].id;//${nextReaderId}
        

        return `
            <td><strong>#${reader.id}</strong></td>
            <td>
                <i class="bi bi-credit-card text-primary"></i>
                ${reader.libraryCardNumber || 'N/A'}
            </td>
            <td>${reader.fullName || 'N/A'}</td>
            <td>${reader.phone || 'N/A'}</td>
            <td>${reader.isActive === 1 ? '<span class="badge bg-success">Hoạt động</span>' : '<span class="badge bg-danger">Không hoạt động</span>'}</td>
            <td>${formatDate(reader.dateJoined)}</td>
            <td>
                ${formatDate(reader.membershipExpiryDate)}
                ${getMembershipStatus(reader.membershipExpiryDate)}
            </td>
            <td class="text-center">
                <div class="action-buttons">
                    <button class="btn btn-sm btn-info btn-action" onclick="viewReader(${reader.id})" title="Xem chi tiết">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning btn-action" onclick="editReader(${reader.id})" title="Chỉnh sửa">
                        <i class="bi bi-pencil"></i>
                    </button>
                    ${reader.isActive === 1 ? `
                    <button class="btn btn-sm btn-danger btn-action" onclick="disableReader(${reader.id})" title="Vô hiệu hóa">
                        <i class="bi bi-x-circle"></i>
                    </button>
                    ` : ''}
                </div>
            </td>
        </tr>`;
    }).join('');
}

/**
 * Cập nhật thống kê
 */
function updateStatistics(readers) {
    const total = readers.length;
    let active = 0;
    let expired = 0;

    const today = new Date();

    readers.forEach(reader => {
        if (reader.membershipExpiryDate) {
            const expiry = new Date(reader.membershipExpiryDate);
            if (expiry >= today) {
                active++;
            } else {
                expired++;
            }
        }
    });

    document.getElementById('totalReaders').textContent = total;
    document.getElementById('activeReaders').textContent = active;
    document.getElementById('expiredReaders').textContent = expired;
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

// ============================================
// 5. BUSINESS LOGIC FUNCTIONS
// ============================================

/**
 * Load danh sách độc giả
 */
async function loadReaders() {
    try {
        showLoading();
        allReaders = await apiGetAllReaders();
        displayReaders(allReaders);
        updateStatistics(allReaders);
    } catch (error) {
        console.error('Error loading readers:', error);
        showAlert('Lỗi khi tải danh sách độc giả: ' + error.message, 'danger');
        showEmptyState();
    }
}

/**
 * Mở modal thêm độc giả mới
 */
function openAddModal() {
    currentReader = null;
    document.getElementById('modalTitle').textContent = 'Thêm Độc giả mới';
    document.getElementById('readerForm').reset();
    document.getElementById('readerId').value = '';

    // Hiện lại trường username khi thêm mới
    const usernameGroup = document.getElementById('username').closest('.mb-3');
    if (usernameGroup) {
        usernameGroup.style.display = 'block';
    }
    document.getElementById('usernameCheckResult').textContent = '';

    // Set default dates
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    document.getElementById('membershipExpiryDate').value = oneYearLater.toISOString().split('T')[0];
}

/**
 * Xem chi tiết độc giả
 */
async function viewReader(id) {
    try {
        const reader = await apiGetReaderById(id);

        const detailsHtml = `
            <div class="detail-row">
                <span class="detail-label"><i class="bi bi-hash"></i> ID:</span>
                <span class="detail-value">${reader.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label"><i class="bi bi-credit-card"></i> Số thẻ:</span>
                <span class="detail-value">${reader.libraryCardNumber || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label"><i class="bi bi-person"></i> Họ tên:</span>
                <span class="detail-value">${reader.fullName || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label"><i class="bi bi-telephone"></i> Số điện thoại:</span>
                <span class="detail-value">${reader.phone || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label"><i class="bi bi-check-circle"></i> Trạng thái:</span>
                <span class="detail-value">${reader.isActive === 1 ? '<span class="badge bg-success">Hoạt động</span>' : '<span class="badge bg-danger">Không hoạt động</span>'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label"><i class="bi bi-person-circle"></i> User ID:</span>
                <span class="detail-value">${reader.userId || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label"><i class="bi bi-person-badge"></i> Username:</span>
                <span class="detail-value">${reader.username || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label"><i class="bi bi-calendar-plus"></i> Ngày tham gia:</span>
                <span class="detail-value">${formatDate(reader.dateJoined)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label"><i class="bi bi-calendar-x"></i> Ngày hết hạn:</span>
                <span class="detail-value">
                    ${formatDate(reader.membershipExpiryDate)}
                    ${getMembershipStatus(reader.membershipExpiryDate)}
                </span>
            </div>
        `;

        document.getElementById('readerDetails').innerHTML = detailsHtml;

        const viewModal = new bootstrap.Modal(document.getElementById('viewModal'));
        viewModal.show();

    } catch (error) {
        console.error('Error viewing reader:', error);
        showAlert('Lỗi khi xem thông tin độc giả: ' + error.message, 'danger');
    }
}

/**
 * Chỉnh sửa độc giả
 */
async function editReader(id) {
    try {
        currentReader = await apiGetReaderById(id);

        document.getElementById('modalTitle').textContent = 'Chỉnh sửa Độc giả';
        document.getElementById('readerId').value = currentReader.id;

        // Chỉ set các trường có thể chỉnh sửa
        document.getElementById('password').value = currentReader.password || '';
        document.getElementById('fullName').value = currentReader.fullName || '';
        document.getElementById('phone').value = currentReader.phone || '';

        if (currentReader.membershipExpiryDate) {
            document.getElementById('membershipExpiryDate').value = new Date(currentReader.membershipExpiryDate).toISOString().split('T')[0];
        }

        // Ẩn trường username khi edit
        const usernameGroup = document.getElementById('username').closest('.mb-3');
        if (usernameGroup) {
            usernameGroup.style.display = 'none';
        }
        document.getElementById('usernameCheckResult').textContent = '';

        const modal = new bootstrap.Modal(document.getElementById('readerModal'));
        modal.show();

    } catch (error) {
        console.error('Error editing reader:', error);
        showAlert('Lỗi khi tải thông tin độc giả: ' + error.message, 'danger');
    }
}

/**
 * Vô hiệu hóa độc giả
 */
async function disableReader(id) {
    if (!confirm('Bạn có chắc chắn muốn vô hiệu hóa độc giả này?')) {
        return;
    }

    try {
        const reader = await apiGetReaderById(id);
        await apiDisableUser(reader.userId);

        showAlert('Vô hiệu hóa độc giả thành công!', 'success');
        loadReaders();

    } catch (error) {
        console.error('Error disabling reader:', error);
        showAlert('Lỗi khi vô hiệu hóa độc giả: ' + error.message, 'danger');
    }
}

/**
 * Lưu độc giả (thêm mới hoặc cập nhật)
 */
async function saveReader() {
    const form = document.getElementById('readerForm');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const readerId = document.getElementById('readerId').value;
    const readerData = {
        password: document.getElementById('password').value,
        fullName: document.getElementById('fullName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        membershipExpiryDate: document.getElementById('membershipExpiryDate').value
    };

    // Nếu là thêm mới thì cần username
    if (!readerId) {
        readerData.username = document.getElementById('username').value.trim();

        if (!readerData.username) {
            showAlert('Vui lòng nhập tên đăng nhập', 'warning');
            return;
        }

        // Kiểm tra username trước khi gửi
        const usernameCheckResult = document.getElementById('usernameCheckResult');
        if (usernameCheckResult && usernameCheckResult.textContent.includes('đã tồn tại')) {
            showAlert('Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!', 'danger');
            return;
        }
    } else {
        // Nếu là update
        readerData.id = parseInt(readerId);
        readerData.userId = currentReader.userId;
        readerData.libraryCardNumber = currentReader.libraryCardNumber;
        readerData.dateJoined = currentReader.dateJoined;
        readerData.isActive = currentReader.isActive;
    }

    // Validation
    if (!readerData.password || !readerData.fullName || !readerData.phone || !readerData.membershipExpiryDate) {
        showAlert('Vui lòng điền đầy đủ thông tin bắt buộc', 'warning');
        return;
    }

    try {
        let savedReader;

        if (readerId) {
            savedReader = await apiUpdateReader(readerId, readerData);
        } else {
            savedReader = await apiAddReader(readerData);
        }

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('readerModal'));
        modal.hide();

        // Show success message
        showAlert(
            readerId ? 'Cập nhật độc giả thành công!' : 'Thêm độc giả mới thành công!',
            'success'
        );

        // Reload readers
        loadReaders();

        // Reset form
        form.reset();
        form.classList.remove('was-validated');

    } catch (error) {
        console.error('Error saving reader:', error);
        showAlert('Lỗi khi lưu thông tin độc giả: ' + error.message, 'danger');
    }
}

/**
 * Search readers
 */
function searchReaders(searchTerm) {
    const term = searchTerm.toLowerCase().trim();

    if (term === '') {
        displayReaders(allReaders);
        return;
    }

    const filteredReaders = allReaders.filter(reader => {
        return (
            (reader.libraryCardNumber && reader.libraryCardNumber.toLowerCase().includes(term)) ||
            (reader.fullName && reader.fullName.toLowerCase().includes(term)) ||
            (reader.phone && reader.phone.includes(term)) ||
            (reader.username && reader.username.toLowerCase().includes(term)) ||
            (reader.id && reader.id.toString().includes(term))
        );
    });

    displayReaders(filteredReaders);
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
 * Get membership status badge
 */
function getMembershipStatus(expiryDate) {
    if (!expiryDate) return '';

    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
        return '<span class="status-badge status-expired ms-2">Hết hạn</span>';
    } else if (daysUntilExpiry <= 30) {
        return '<span class="status-badge status-expiring-soon ms-2">Sắp hết hạn</span>';
    } else {
        return '<span class="status-badge status-active ms-2">Còn hạn</span>';
    }
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
 * Setup username check
 */
function setupUsernameCheck() {
    const usernameInput = document.getElementById('username');
    const resultDiv = document.getElementById('usernameCheckResult');
    if (!usernameInput) return;

    usernameInput.addEventListener('input', async function () {
        const username = usernameInput.value.trim();
        const saveBtn = document.querySelector('#readerModal button[type="submit"], #readerModal button#saveReader');

        if (!username) {
            resultDiv.textContent = '';
            resultDiv.classList.remove('text-danger', 'text-success');
            if (saveBtn) saveBtn.disabled = false;
            return;
        }

        try {
            const status = await apiCheckUsername(username);

            if (status === 'EXISTS') {
                resultDiv.textContent = 'Tên đăng nhập đã tồn tại!';
                resultDiv.classList.add('text-danger');
                resultDiv.classList.remove('text-success');
                if (saveBtn) saveBtn.disabled = true;
            } else {
                resultDiv.textContent = 'Tên đăng nhập hợp lệ.';
                resultDiv.classList.remove('text-danger');
                resultDiv.classList.add('text-success');
                if (saveBtn) saveBtn.disabled = false;
            }
        } catch (e) {
            resultDiv.textContent = '';
            resultDiv.classList.remove('text-danger', 'text-success');
            if (saveBtn) saveBtn.disabled = false;
        }
    });
}

/**
 * Setup search listener
 */
function setupSearchListener() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function (e) {
        searchReaders(e.target.value);
    });
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    const form = document.getElementById('readerForm');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        saveReader();
    });

    // Validate expiry date is in the future
    const expiryDate = document.getElementById('membershipExpiryDate');

    expiryDate.addEventListener('change', function () {
        if (expiryDate.value) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDate = new Date(expiryDate.value);

            if (selectedDate < today) {
                expiryDate.setCustomValidity('Ngày hết hạn phải là ngày trong tương lai');
                showAlert('Ngày hết hạn phải là ngày trong tương lai', 'warning');
            } else {
                expiryDate.setCustomValidity('');
            }
        }
    });
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log('Reader Manager initialized');
    loadReaders();
    setupSearchListener();
    setupFormValidation();
    setupUsernameCheck();
});

// ============================================
// 8. EXPORT FUNCTIONS (for HTML onclick)
// ============================================
window.loadReaders = loadReaders;
window.openAddModal = openAddModal;
window.viewReader = viewReader;
window.editReader = editReader;
window.saveReader = saveReader;
window.disableReader = disableReader;
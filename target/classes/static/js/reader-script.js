// API Configuration
const API_BASE_URL = 'http://localhost:8080';
const READERS_API = `${API_BASE_URL}/readers`;

// Global Variables
let allReaders = [];
let currentReader = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadReaders();
    setupSearchListener();
    setupFormValidation();
    setupUsernameCheck();
});

// Kiểm tra username tồn tại
function setupUsernameCheck() {
    const usernameInput = document.getElementById('username');
    const resultDiv = document.getElementById('usernameCheckResult');
    if (!usernameInput) return;
    usernameInput.addEventListener('input', async function() {
        const username = usernameInput.value.trim();
        const saveBtn = document.querySelector('#readerModal button[type="submit"], #readerModal button#saveReader');
        if (!username) {
            resultDiv.textContent = '';
            resultDiv.classList.remove('text-danger', 'text-success');
            if (saveBtn) saveBtn.disabled = false;
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/users/username/${encodeURIComponent(username)}`);
            if (response.ok) {
                const status = await response.text();
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
            } else {
                resultDiv.textContent = '';
                resultDiv.classList.remove('text-danger', 'text-success');
                if (saveBtn) saveBtn.disabled = false;
            }
        } catch (e) {
            resultDiv.textContent = '';
            resultDiv.classList.remove('text-danger', 'text-success');
            if (saveBtn) saveBtn.disabled = false;
        }
    });
}

// Load all readers from API
async function loadReaders() {
    try {
        showLoading();
        const response = await fetch(READERS_API);
        
        if (!response.ok) {
            throw new Error('Không thể tải danh sách độc giả');
        }
        
        allReaders = await response.json();
        displayReaders(allReaders);
        updateStatistics(allReaders);
        
    } catch (error) {
        console.error('Error loading readers:', error);
        showAlert('Lỗi khi tải danh sách độc giả: ' + error.message, 'danger');
        showEmptyState();
    }
}

// Display readers in table
function displayReaders(readers) {
    const tbody = document.getElementById('readersTableBody');
    
    if (readers.length === 0) {
        showEmptyState();
        return;
    }
    
    tbody.innerHTML = readers.map(reader => `
        <tr>
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
        </tr>
    `).join('');
}

// Show loading state
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

// Show empty state
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

// Format date to Vietnamese format
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

// Get membership status badge
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

// Update statistics cards
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

// Open modal for adding new reader
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

// View reader details
async function viewReader(id) {
    try {
        const response = await fetch(`${READERS_API}/${id}`);
        
        if (!response.ok) {
            throw new Error('Không thể tải thông tin độc giả');
        }
        
        const reader = await response.json();
        
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

// Edit reader
async function editReader(id) {
    try {
        const response = await fetch(`${READERS_API}/${id}`);
        
        if (!response.ok) {
            throw new Error('Không thể tải thông tin độc giả');
        }
        
        currentReader = await response.json();
        
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

// Disable reader
async function disableReader(id) {
    if (!confirm('Bạn có chắc chắn muốn vô hiệu hóa độc giả này?')) {
        return;
    }
    
    try {
        const response = await fetch(`${READERS_API}/${id}`);
        if (!response.ok) {
            throw new Error('Không thể tải thông tin độc giả');
        }
        
        const reader = await response.json();
        reader.isActive = 0;
        
        const disableResponse = await fetch(`${API_BASE_URL}/users/disable/${reader.userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!disableResponse.ok) {
            throw new Error('Không thể vô hiệu hóa độc giả');
        }
        
        showAlert('Vô hiệu hóa độc giả thành công!', 'success');
        loadReaders();
        
    } catch (error) {
        console.error('Error disabling reader:', error);
        showAlert('Lỗi khi vô hiệu hóa độc giả: ' + error.message, 'danger');
    }
}

// Save reader (add or update)
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
        // Nếu là update, cần lấy thêm các thông tin từ currentReader
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
        let response;
        
        if (readerId) {
            // Update existing reader
            response = await fetch(`${READERS_API}/${readerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(readerData)
            });
        } else {
            // Add new reader
            response = await fetch(READERS_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(readerData)
            });
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Không thể lưu thông tin độc giả');
        }
        
        const savedReader = await response.json();
        
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

// Setup search listener
function setupSearchListener() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            displayReaders(allReaders);
            return;
        }
        
        const filteredReaders = allReaders.filter(reader => {
            return (
                (reader.libraryCardNumber && reader.libraryCardNumber.toLowerCase().includes(searchTerm)) ||
                (reader.fullName && reader.fullName.toLowerCase().includes(searchTerm)) ||
                (reader.phone && reader.phone.includes(searchTerm)) ||
                (reader.username && reader.username.toLowerCase().includes(searchTerm)) ||
                (reader.id && reader.id.toString().includes(searchTerm))
            );
        });
        
        displayReaders(filteredReaders);
    });
}

// Setup form validation
function setupFormValidation() {
    const form = document.getElementById('readerForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveReader();
    });
    
    // Validate expiry date is in the future
    const expiryDate = document.getElementById('membershipExpiryDate');
    
    expiryDate.addEventListener('change', function() {
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

// Show alert message
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

// Get icon for alert type
function getAlertIcon(type) {
    const icons = {
        'success': 'check-circle-fill',
        'danger': 'exclamation-triangle-fill',
        'warning': 'exclamation-circle-fill',
        'info': 'info-circle-fill'
    };
    return icons[type] || 'info-circle-fill';
}

// Export functions for use in HTML
window.loadReaders = loadReaders;
window.openAddModal = openAddModal;
window.viewReader = viewReader;
window.editReader = editReader;
window.saveReader = saveReader;
window.disableReader = disableReader;
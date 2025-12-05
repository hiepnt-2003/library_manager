-- ============================================
-- Library Manager - Initial Data (CLEAN VERSION)
-- Tên bảng: không có tbl_ prefix
-- Tên cột: camelCase giống như trong Java models
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data (optional)
-- TRUNCATE TABLE ReservationItem;
-- TRUNCATE TABLE LibrarianReturn;
-- TRUNCATE TABLE LibrarianGive;
-- TRUNCATE TABLE LibrarianApprove;
-- TRUNCATE TABLE Reservation;
-- TRUNCATE TABLE Reader;
-- TRUNCATE TABLE Librarian;
-- TRUNCATE TABLE Book;
-- TRUNCATE TABLE Author;
-- TRUNCATE TABLE Topic;
-- TRUNCATE TABLE Category;
-- TRUNCATE TABLE User;

-- ============================================
-- 1. INSERT USERS
-- ============================================
INSERT INTO User (username, password, fullName, phone, isActive, userType) VALUES
('admin', 'admin123', 'Nguyễn Văn Admin', '0901234567', 1, 'LIBRARIAN'),
('librarian1', 'lib123', 'Trần Thị Thủy', '0902345678', 1, 'LIBRARIAN'),
('librarian2', 'lib123', 'Lê Văn Tùng', '0903456789', 1, 'LIBRARIAN'),
('reader1', 'reader123', 'Phạm Minh Anh', '0904567890', 1, 'READER'),
('reader2', 'reader123', 'Hoàng Thị Bích', '0905678901', 1, 'READER'),
('reader3', 'reader123', 'Đỗ Văn Cường', '0906789012', 1, 'READER'),
('reader4', 'reader123', 'Vũ Thị Diệu', '0907890123', 1, 'READER'),
('reader5', 'reader123', 'Bùi Văn Em', '0908901234', 1, 'READER'),
('reader6', 'reader123', 'Ngô Thị Phương', '0909012345', 1, 'READER'),
('reader7', 'reader123', 'Đinh Văn Giang', '0900123456', 1, 'READER'),
('reader8', 'reader123', 'Mai Thị Hoa', '0911234567', 1, 'READER'),
('reader9', 'reader123', 'Lý Văn Hùng', '0912345678', 1, 'READER'),
('reader10', 'reader123', 'Trương Thị Lan', '0913456789', 1, 'READER');

-- ============================================
-- 2. INSERT LIBRARIANS
-- ============================================
INSERT INTO Librarian (employeeId, userId, role, hireDate, department) VALUES
(1001, 1, 'Manager', '2020-01-15', 'Administration'),
(1002, 2, 'Senior Librarian', '2020-03-20', 'Circulation'),
(1003, 3, 'Librarian', '2021-06-10', 'Reference');

-- ============================================
-- 3. INSERT READERS
-- ============================================
INSERT INTO Reader (libraryCardNumber, userId, dateJoined, membershipExpiryDate) VALUES
('LIB1', 4, '2024-01-15', '2026-01-15'),
('LIB2', 5, '2024-02-20', '2026-02-20'),
('LIB3', 6, '2024-03-10', '2025-03-10'),
('LIB4', 7, '2024-04-05', '2026-04-05'),
('LIB5', 8, '2024-05-12', '2025-05-12'),
('LIB6', 9, '2024-06-18', '2026-06-18'),
('LIB7', 10, '2024-07-22', '2026-07-22'),
('LIB8', 11, '2024-08-30', '2025-08-30'),
('LIB9', 12, '2024-09-15', '2026-09-15'),
('LIB10', 13, '2024-10-01', '2026-10-01');
-- ============================================
-- 4. INSERT CATEGORIES
-- ============================================
INSERT INTO Category (categoryName, description, createdAt) VALUES
('Văn học', 'Sách văn học trong nước và quốc tế', NOW()),
('Khoa học', 'Sách khoa học tự nhiên và công nghệ', NOW()),
('Kinh tế', 'Sách về kinh tế, quản lý và kinh doanh', NOW()),
('Lịch sử', 'Sách về lịch sử Việt Nam và thế giới', NOW()),
('Triết học', 'Sách triết học phương Đông và phương Tây', NOW()),
('Giáo dục', 'Sách giáo khoa và tài liệu học tập', NOW()),
('Nghệ thuật', 'Sách về nghệ thuật, âm nhạc, hội họa', NOW()),
('Công nghệ thông tin', 'Sách về lập trình, máy tính, AI', NOW()),
('Y học', 'Sách về y học, sức khỏe', NOW()),
('Tâm lý học', 'Sách về tâm lý và phát triển bản thân', NOW());

-- ============================================
-- 5. INSERT TOPICS
-- ============================================
INSERT INTO Topic (categoryName, description, createdAt) VALUES
('Tiểu thuyết', 'Truyện tiểu thuyết dài', NOW()),
('Truyện ngắn', 'Tập truyện ngắn', NOW()),
('Thơ ca', 'Tập thơ và ca dao', NOW()),
('Vật lý', 'Sách về vật lý học', NOW()),
('Hóa học', 'Sách về hóa học', NOW()),
('Sinh học', 'Sách về sinh học và đa dạng sinh học', NOW()),
('Toán học', 'Sách về toán học các cấp', NOW()),
('Kinh doanh', 'Sách về kinh doanh và khởi nghiệp', NOW()),
('Marketing', 'Sách về marketing và quảng cáo', NOW()),
('Quản trị', 'Sách về quản trị và lãnh đạo', NOW());

-- ============================================
-- 6. INSERT AUTHORS
-- ============================================
INSERT INTO Author (authorName, biography, birthYear, nationality, createdAt) VALUES
('Nguyễn Nhật Ánh', 'Nhà văn nổi tiếng với các tác phẩm thiếu nhi', 1955, 'Việt Nam', NOW()),
('Tô Hoài', 'Nhà văn với tác phẩm Dế Mèn phiêu lưu ký', 1920, 'Việt Nam', NOW()),
('Nam Cao', 'Nhà văn hiện thực Việt Nam', 1915, 'Việt Nam', NOW()),
('Ngô Tất Tố', 'Tác giả Tắt đèn', 1894, 'Việt Nam', NOW()),
('Haruki Murakami', 'Nhà văn Nhật Bản đương đại', 1949, 'Nhật Bản', NOW()),
('J.K. Rowling', 'Tác giả Harry Potter', 1965, 'Anh', NOW()),
('Dan Brown', 'Tác giả The Da Vinci Code', 1964, 'Mỹ', NOW()),
('Paulo Coelho', 'Tác giả Nhà giả kim', 1947, 'Brazil', NOW()),
('Stephen Hawking', 'Nhà vật lý lý thuyết', 1942, 'Anh', NOW()),
('Yuval Noah Harari', 'Tác giả Sapiens', 1976, 'Israel', NOW()),
('Dale Carnegie', 'Tác giả Đắc nhân tâm', 1888, 'Mỹ', NOW()),
('Robert Kiyosaki', 'Tác giả Dạy con làm giàu', 1947, 'Mỹ', NOW()),
('Malcolm Gladwell', 'Nhà báo và tác giả', 1963, 'Canada', NOW()),
('Thích Nhất Hạnh', 'Thiền sư Việt Nam', 1926, 'Việt Nam', NOW()),
('Tony Buzan', 'Tác giả Mind Map', 1942, 'Anh', NOW());

-- ============================================
-- 7. INSERT BOOKS
-- ============================================
INSERT INTO Book (categoryId, topicId, authorId, title, publisher, bookAvailable) VALUES
-- Văn học Việt Nam
(1, 1, 1, 'Mắt biếc', 'NXB Trẻ', 5),
(1, 1, 1, 'Tôi thấy hoa vàng trên cỏ xanh', 'NXB Trẻ', 3),
(1, 1, 1, 'Cho tôi xin một vé đi tuổi thơ', 'NXB Trẻ', 4),
(1, 1, 2, 'Dế Mèn phiêu lưu ký', 'NXB Kim Đồng', 6),
(1, 2, 3, 'Chí Phèo', 'NXB Văn học', 7),
(1, 2, 3, 'Lão Hạc', 'NXB Văn học', 5),
(1, 1, 4, 'Tắt đèn', 'NXB Văn học', 4),

-- Văn học nước ngoài
(1, 1, 5, 'Rừng Na Uy', 'NXB Hội Nhà Văn', 3),
(1, 1, 5, 'Kafka bên bờ biển', 'NXB Hội Nhà Văn', 2),
(1, 1, 6, 'Harry Potter và Hòn đá Phù thủy', 'NXB Trẻ', 8),
(1, 1, 6, 'Harry Potter và Phòng chứa Bí mật', 'NXB Trẻ', 7),
(1, 1, 7, 'Mật mã Da Vinci', 'NXB Văn hóa Sài Gòn', 5),
(1, 1, 8, 'Nhà giả kim', 'NXB Hội Nhà Văn', 10),

-- Khoa học
(2, 4, 9, 'Lược sử thời gian', 'NXB Trẻ', 4),
(2, 4, 9, 'Vũ trụ trong vỏ hạt dẻ', 'NXB Trẻ', 3),
(2, 5, 10, 'Sapiens: Lược sử loài người', 'NXB Thế giới', 6),
(2, 5, 10, 'Homo Deus: Lược sử tương lai', 'NXB Thế giới', 5),
(2, 7, 15, 'Sức mạnh của tư duy tích cực', 'NXB Tổng hợp TPHCM', 4),

-- Kinh tế - Kinh doanh
(3, 8, 11, 'Đắc nhân tâm', 'NXB Tổng hợp TPHCM', 15),
(3, 8, 12, 'Dạy con làm giàu', 'NXB Lao động', 8),
(3, 8, 12, 'Cha giàu cha nghèo', 'NXB Lao động', 10),
(3, 8, 13, 'Outliers - Những người ngoại hạng', 'NXB Trẻ', 5),
(3, 9, 13, 'Blink - Chớp mắt', 'NXB Trẻ', 4),

-- Tâm lý - Tự phát triển
(10, 10, 11, 'Cách nghĩ để thành công', 'NXB Tổng hợp TPHCM', 6),
(10, 10, 14, 'Chánh niệm phép lạ của sự tỉnh thức', 'NXB Tôn giáo', 7),
(10, 10, 14, 'Làm sao để yêu', 'NXB Tôn giáo', 5),
(10, 10, 8, 'Veronika quyết định chết', 'NXB Hội Nhà Văn', 4),

-- Công nghệ
(8, 10, 10, '21 bài học cho thế kỷ 21', 'NXB Thế giới', 6),
(8, 10, 15, 'Mindmap - Công cụ tư duy', 'NXB Trẻ', 5);

-- ============================================
-- 8. INSERT RESERVATIONS
-- ============================================
INSERT INTO Reservation (readerId, librarianApprovedId, librarianGiveId, librarianReturnId, requestDate, pickupDate, dueDate, approvalDate, status) VALUES
-- Đã hoàn thành
(1, 1, 1, 1, '2024-10-01', '2024-10-02', '2024-10-16', '2024-10-01', 'COMPLETED'),
(2, 1, 2, 2, '2024-10-05', '2024-10-06', '2024-10-20', '2024-10-05', 'COMPLETED'),
(3, 2, 2, 1, '2024-10-10', '2024-10-11', '2024-10-25', '2024-10-10', 'COMPLETED'),

-- Đang mượn
(4, 1, 1, NULL, '2024-11-20', '2024-11-21', '2024-12-05', '2024-11-20', 'BORROWED'),
(5, 2, 2, NULL, '2024-11-25', '2024-11-26', '2024-12-10', '2024-11-25', 'BORROWED'),
(6, 1, 1, NULL, '2024-11-28', '2024-11-29', '2024-12-13', '2024-11-28', 'BORROWED'),

-- Quá hạn
(7, 2, 2, NULL, '2024-10-15', '2024-10-16', '2024-10-30', '2024-10-15', 'OVERDUE'),
(8, 1, 1, NULL, '2024-10-20', '2024-10-21', '2024-11-04', '2024-10-20', 'OVERDUE'),

-- Đang chờ duyệt (requestDate trong 2 ngày gần đây để không bị tự động EXPIRED)
(9, NULL, NULL, NULL, CURDATE(), NULL, NULL, NULL, 'PENDING'),
(10, NULL, NULL, NULL, CURDATE(), NULL, NULL, NULL, 'PENDING'),

-- Đã duyệt, chờ lấy sách (approvalDate trong vòng 3 ngày, chưa có pickupDate, chưa có dueDate)
(11, 1, NULL, NULL, '2024-12-02', NULL, NULL, '2024-12-02', 'APPROVED'),
(12, 2, NULL, NULL, '2024-12-03', NULL, NULL, '2024-12-03', 'APPROVED');

-- ============================================
-- 9. INSERT RESERVATION ITEMS
-- ============================================
INSERT INTO ReservationItem (reservationId, bookId, returnDate, overDueDay, isPayFine, status) VALUES
-- Reservation 1 (Completed)
(1, 1, '2024-10-15', 0, 'NOINFORMATION', 'RETURNED'),
(1, 2, '2024-10-15', 0, 'NOINFORMATION', 'RETURNED'),

-- Reservation 2 (Completed)
(2, 3, '2024-10-19', 0, 'NOINFORMATION', 'RETURNED'),
(2, 10, '2024-10-19', 0, 'NOINFORMATION', 'RETURNED'),

-- Reservation 3 (Completed)
(3, 13, '2024-10-24', 0, 'NOINFORMATION', 'RETURNED'),

-- Reservation 4 (Borrowed)
(4, 4, NULL, 0, 'NOINFORMATION', 'BORROWED'),
(4, 5, NULL, 0, 'NOINFORMATION', 'BORROWED'),

-- Reservation 5 (Borrowed)
(5, 6, NULL, 0, 'NOINFORMATION', 'BORROWED'),
(5, 7, NULL, 0, 'NOINFORMATION', 'BORROWED'),
(5, 8, NULL, 0, 'NOINFORMATION', 'BORROWED'),

-- Reservation 6 (Borrowed)
(6, 11, NULL, 0, 'NOINFORMATION', 'BORROWED'),

-- Reservation 7 (Overdue)
(7, 12, NULL, 26, 'NOTPAID', 'EXPIRED'),
(7, 14, NULL, 26, 'NOTPAID', 'EXPIRED'),

-- Reservation 8 (Overdue)
(8, 15, NULL, 21, 'NOTPAID', 'EXPIRED'),

-- Reservation 9 (Pending)
(9, 16, NULL, 0, 'NOINFORMATION', 'PENDING'),
(9, 17, NULL, 0, 'NOINFORMATION', 'PENDING'),

-- Reservation 10 (Pending)
(10, 20, NULL, 0, 'NOINFORMATION', 'PENDING'),

-- Reservation 11 (Approved)
(11, 21, NULL, 0, 'NOINFORMATION', 'PENDING'),
(11, 22, NULL, 0, 'NOINFORMATION', 'PENDING'),

-- Reservation 12 (Approved)
(12, 23, NULL, 0, 'NOINFORMATION', 'PENDING');

-- ============================================
-- 10. INSERT LIBRARIAN APPROVE
-- ============================================
INSERT INTO LibrarianApprove (librarianId, reservationId) VALUES
(1, 1), (1, 2), (2, 3), (1, 4), (2, 5), (1, 6), (2, 7), (1, 8), (1, 11), (2, 12);

-- ============================================
-- 11. INSERT LIBRARIAN GIVE
-- ============================================
INSERT INTO LibrarianGive (librarianId, reservationId) VALUES
(1, 1), (2, 2), (2, 3), (1, 4), (2, 5), (1, 6), (2, 7), (1, 8);

-- ============================================
-- 12. INSERT LIBRARIAN RETURN
-- ============================================
INSERT INTO LibrarianReturn (librarianId, reservationId) VALUES
(1, 1), (2, 2), (1, 3);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- SELECT COUNT(*) as total_users FROM User;
-- SELECT COUNT(*) as total_readers FROM Reader;
-- SELECT COUNT(*) as total_books FROM Book;
-- SELECT * FROM Reader LIMIT 5;
-- SELECT * FROM Book LIMIT 5;
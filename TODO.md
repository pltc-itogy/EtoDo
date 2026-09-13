# Danh Sách Công Việc (To-Do List)

Tài liệu này theo dõi tiến độ thực tế của dự án.
*Chú thích: `[ ]` Chưa làm, `[/]` Đang làm, `[x]` Đã xong.*

## Giai đoạn 1: Khởi tạo & Thiết lập cơ bản (Foundation)
- [x] Khởi tạo dự án React Native với Expo (Sử dụng Expo Router).
- [x] Cài đặt & cấu hình NativeWind (Tailwind CSS).
- [x] Cài đặt Zustand (Quản lý State).
- [x] Thiết lập kết nối Supabase Client (Authentication & Database API).
- [x] Cấu hình expo-sqlite và cài đặt lược đồ dữ liệu (Local Schema) khớp với `database.sql`.
- [x] Xây dựng khung Navigation cơ bản (Bottom Tabs: Dashboard, Habits, Journal, English).

## Giai đoạn 2: Phát triển Core Features (CRUD)
- [x] **Auth:** Xây dựng màn hình Đăng nhập / Đăng ký (Email/Password qua Supabase).
- [x] **Activities:**
  - [x] Xây dựng Form thêm Task/Event (chọn Ngày, Giờ, Priority, Category Chips, Location, Notes).
  - [x] Quản lý Danh mục động (Thêm/Xóa/Chọn nhanh bằng Chips).
  - [x] Xây dựng 4 giao diện Dashboard: Hôm nay (Gallery), Tuần tới (Board), Lịch trình (Calendar), Tất cả (List).
  - [x] Logic sắp xếp công việc tự động theo Thời gian (Giờ/Phút).
  - [x] Logic tích hoàn thành Task thủ công.
  - [x] Đồng bộ Activities & Categories với Supabase.
- [x] **Journals:**
  - [x] UI viết nhật ký (hỗ trợ chọn Cảm xúc, Ngày bù).
  - [x] Xử lý Upload và nén ảnh (expo-image-manipulator).
  - [x] Đồng bộ Journals với Supabase (Database & Storage bucket).

## Giai đoạn 3: Tính năng nâng cao & Tự động hóa (Đang thực hiện)
- [ ] **Habits & Tasks:**
  - [ ] UI Danh sách thói quen & Nút Check-in.
  - [ ] Logic tính toán chuỗi (Streak) độc lập.
  - [ ] Thêm "Bảng Công Việc" (Tasks ưu tiên) bên dưới danh sách thói quen.
  - [ ] Tự động seed danh mục "Công việc" mặc định.
- [ ] **English Notes:**
  - [ ] Giao diện Thêm từ vựng/Tips.
  - [ ] Giao diện học Flashcard.
  - [ ] Code thuật toán Spaced Repetition tính ngày ôn tiếp theo.
- [ ] **Tự động hóa (Automation Utils):**
  - [ ] Logic kiểm tra qua ngày mới khi mở App.
  - [ ] Hàm tự động complete Event đã qua ngày.
  - [ ] Hàm tạo Habit_logs mặc định cho ngày mới.

## Giai đoạn 4: Trải nghiệm & Tối ưu (UX & Polish)
- [ ] Xử lý luồng Offline-Sync: Lưu local trước, tự động push Supabase ngầm khi có mạng.
- [ ] Kịch bản dọn dẹp Local DB: Tự động xóa ảnh nội bộ sau khi sync để giải phóng RAM/ROM.
- [ ] Tích hợp Local Notifications (Nhắc nhở học tiếng Anh, làm Task).
- [ ] Thêm Interactive Widget trên màn hình chính Android.
- [ ] Kiểm thử tổng thể & Tinh chỉnh UI/UX.
- [ ] Viết tài liệu README.md chuẩn chỉnh hướng dẫn người khác cài đặt (Open-Source setup).

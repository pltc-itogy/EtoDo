# Danh Sách Công Việc (To-Do List)

Tài liệu này theo dõi tiến độ thực tế của dự án.
*Chú thích: `[ ]` Chưa làm, `[/]` Đang làm, `[x]` Đã xong.*

## Giai đoạn 1: Khởi tạo & Thiết lập cơ bản (Foundation)
- [ ] Khởi tạo dự án React Native với Expo (Sử dụng Expo Router).
- [ ] Cài đặt & cấu hình NativeWind (Tailwind CSS).
- [ ] Cài đặt Zustand (Quản lý State).
- [ ] Thiết lập kết nối Supabase Client (Authentication & Database API).
- [ ] Cấu hình WatermelonDB và cài đặt lược đồ dữ liệu (Local Schema) khớp với `database.sql`.
- [ ] Xây dựng khung Navigation cơ bản (Bottom Tabs: Dashboard, Habits, Journal, English).

## Giai đoạn 2: Phát triển Core Features (CRUD)
- [ ] **Auth:** Xây dựng màn hình Đăng nhập / Đăng ký (Email/Password qua Supabase).
- [ ] **Activities:**
  - [ ] UI Danh sách & Thêm mới Task/Event.
  - [ ] Logic tích hoàn thành Task thủ công.
  - [ ] Đồng bộ Activities với Supabase.
- [ ] **Journals:**
  - [ ] UI viết nhật ký (hỗ trợ nhập text cơ bản).
  - [ ] Xử lý Upload và nén ảnh (Expo Image Manipulator).
  - [ ] Đồng bộ Journals với Supabase.

## Giai đoạn 3: Tính năng nâng cao & Tự động hóa
- [ ] **Habits:**
  - [ ] UI Danh sách thói quen & Nút Check-in.
  - [ ] Logic tính toán chuỗi (Streak).
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

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
- [x] **Habits & Tasks:**
  - [x] UI Danh sách thói quen & Nút Check-in.
  - [x] Logic tính toán chuỗi (Streak) độc lập.
  - [x] Thêm "Bảng Công Việc" (Tasks ưu tiên) bên dưới danh sách thói quen.
  - [x] Tự động seed danh mục "Công việc" mặc định.
- [x] **English Notes (Tiếng Anh):**
  - [x] Giao diện Thêm từ vựng/Tips.
  - [x] Giao diện học Flashcard.
  - [x] Code thuật toán Spaced Repetition tính ngày ôn tiếp theo.
- [x] **Tự động hóa (Automation Utils):**
  - [x] Logic kiểm tra qua ngày mới khi mở App.
  - [x] Hàm tự động complete Event đã qua ngày.
  - [x] Hàm tạo Habit_logs mặc định cho ngày mới.

## Giai đoạn 4: Trải nghiệm & Tối ưu (UX & Polish)
- [x] Xử lý luồng Offline-Sync: Lưu local trước, tự động push Supabase ngầm khi có mạng.
- [x] Kịch bản dọn dẹp Local DB: Tự động xóa ảnh nội bộ sau khi sync để giải phóng RAM/ROM.
- [~] Tích hợp Local Notifications (Nhắc nhở học tiếng Anh, làm Task) - (Tạm gác lại).
- [~] Thêm Interactive Widget trên màn hình chính Android - (Tạm gác lại do hạn chế Expo Go).
- [x] Kiểm thử tổng thể & Tinh chỉnh UI/UX.
- [x] Viết tài liệu README.md chuẩn chỉnh hướng dẫn người khác cài đặt (Open-Source setup).

## Giai đoạn 5: Hoàn thiện Sync & Release (v1.0)
*Ưu tiên cao — Cần hoàn thành trước khi phát hành phiên bản đầu tiên.*

### 🔴 Ưu tiên cao (Bắt buộc trước release)
- [ ] **Delete Sync (Xóa đồng bộ 2 chiều):** Khi xóa 1 bản ghi ở bất kỳ thiết bị nào, thiết bị còn lại cũng tự xóa theo.
  - [ ] Tạo bảng `deleted_records` trên Supabase (lưu `table_name`, `record_id`, `deleted_at`, `user_id`).
  - [ ] Cập nhật hàm `deleteJournal`, `deleteHabit`, `deleteActivity`... ghi vào `deleted_records` thay vì xóa trực tiếp.
  - [ ] Cập nhật hàm `sync()` để kiểm tra và xóa các bản ghi đã bị đánh dấu xóa ở cloud.
- [ ] **Nén ảnh trước khi upload:** Tích hợp `expo-image-manipulator` để giảm dung lượng ảnh từ ~3MB xuống ~300KB trước khi đẩy lên Supabase Storage.
- [ ] **Xử lý xung đột Sync (Conflict Resolution):** Khi cùng 1 bản ghi bị sửa ở 2 thiết bị → ưu tiên giữ bản ghi có `updated_at` mới hơn.
  - [ ] Thêm cột `updated_at` vào các bảng còn thiếu (journals, habits...).
  - [ ] Cập nhật logic `upsertLocal` so sánh `updated_at` trước khi ghi đè.
- [ ] **Sync tự động khi có mạng (Background Sync):** Thay vì chỉ sync khi bấm nút, tự động sync khi app được mở lại sau thời gian offline.
  - [ ] Lưu `last_synced_at` vào AsyncStorage.
  - [ ] Khi mở app, nếu `last_synced_at` > 5 phút thì tự gọi `sync()` ngầm.

### 🟡 Ưu tiên trung bình (Nên có ở v1.0)
- [ ] **Hiển thị trạng thái Sync:** Thêm icon/badge trên trang Cài đặt cho biết "Đã đồng bộ lúc HH:MM" hoặc "Đang đồng bộ..." hoặc "Có lỗi đồng bộ".
- [ ] **Nén ảnh khi chọn ảnh từ thư viện** (trong Journal editor, không chỉ khi Import).
- [ ] **Thêm cột `updated_at` vào database.sql** và cập nhật các hàm `upsert` tương ứng để hỗ trợ Conflict Resolution.
- [ ] **Kiểm thử Sync đa thiết bị** (Mobile ↔ Desktop) đảm bảo dữ liệu nhất quán 2 chiều.

### 🟢 Ưu tiên thấp (Có thể để v1.1)
- [ ] **Sync realtime (Supabase Realtime):** Lắng nghe sự kiện thay đổi từ Supabase và cập nhật UI tức thì mà không cần bấm nút.
- [ ] **Markdown Editor cho Journal:** Hỗ trợ in đậm `**bold**`, in nghiêng `*italic*`, danh sách `- item` khi viết nhật ký.
- [ ] **Xuất dữ liệu dạng ZIP (Backup toàn bộ):** Đóng gói toàn bộ dữ liệu + ảnh thành file ZIP để backup thủ công.


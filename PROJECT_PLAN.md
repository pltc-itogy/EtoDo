# Kế Hoạch Dự Án: Ứng Dụng Quản Lý Cá Nhân (EtoDo)
*Dự án thay thế Notion - Cá nhân hóa, Tối ưu & Hoàn toàn miễn phí.*

## 1. Mục Tiêu & Tiêu Chí Dự Án
- **Mục tiêu:** Tạo một ứng dụng quản lý cá nhân (Mobile & PC), hoạt động độc lập, có khả năng đồng bộ thời gian thực.
- **Chi phí:** 0đ (Sử dụng công nghệ mã nguồn mở và Free Tier).
- **Trải nghiệm:** Tốc độ cao, hỗ trợ offline-first, thiết kế tối giản.

## 2. Lựa Chọn Công Nghệ (Tech Stack)
Dựa trên nền tảng kỹ năng của bạn (JS, HTML, CSS, React, Tailwind), dưới đây là kiến trúc hệ thống phù hợp nhất:

- **Frontend (UI/Logic):** **React Native (với Expo)** kết hợp **NativeWind** (Tailwind CSS cho React Native).
  - *Lý do:* Bạn đã có nền tảng React và Tailwind, nên việc tiếp cận Expo sẽ cực kỳ nhanh chóng và tự nhiên. Expo giúp build app cho cả iOS, Android và Web (PC) từ một nguồn code duy nhất mà không cần can thiệp sâu vào Native.
- **Backend/Database:** **Supabase** (hoặc **Firebase**). 
  - *Lý do:* Đây là kiến trúc **Serverless (BaaS - Backend as a Service)**. Nghĩa là bạn **không cần viết code backend bằng Python hay Node.js**. Supabase tự động tạo sẵn các API dựa trên Database, bạn chỉ cần gọi API từ frontend React Native là xong. Gói Free cung cấp đủ Database (PostgreSQL), Authentication (Đăng nhập) và Storage (Lưu ảnh).
- **Local Database (Offline-first):** **WatermelonDB** hoặc **MMKV / AsyncStorage**.
  - *Lý do:* Dữ liệu được lưu trực tiếp trên bộ nhớ thiết bị giúp app load ngay lập tức kể cả khi mất mạng. **Về cơ chế dọn dẹp:** Bạn có quyền quyết định. Thường ta sẽ giữ lại trên máy để xem offline cho nhanh, nhưng bạn hoàn toàn có thể viết code tự động xóa các dữ liệu cũ (vd: nhật ký của tháng trước) khỏi máy sau khi đã đồng bộ an toàn lên Cloud để tiết kiệm bộ nhớ.

## 3. Hoàn Thiện Các Module Tính Năng
### 3.1. Kế thừa từ Notion
- **Lịch trình (Events) & Công việc (Tasks):** Sử dụng **chung một Database (Bảng Activities)** để lưu tất cả hoạt động. 
  - *Lịch trình (Events):* Là các hoạt động có gắn ngày giờ cụ thể.
  - *Công việc (Tasks):* Là các hoạt động không gắn ngày, được quản lý riêng và tích hoàn thành thủ công.
  - Hỗ trợ nhiều góc nhìn: List view, Calendar view và Kanban board.
- **Thói quen (Daily Habits):** Bổ sung bộ đếm chuỗi (Streak) để tạo động lực.
- **Nhật ký (Journal):** Hỗ trợ trình soạn thảo Markdown (In đậm, nghiêng, bullet, list) và lưu trữ hình ảnh.
- **Tip Tiếng Anh (Notes/IELTS):** Hỗ trợ linh hoạt 2 chế độ hiển thị: Dạng danh sách thông thường (để lưu tips/ngữ pháp) và dạng Flashcard (để học từ vựng).

### 3.2. Tính Năng "Độc Quyền" (Vượt trội)
- **Tự động hóa (Automation):** Logic xử lý chạy ngầm trên app. 
  - *Hoạt động có ngày (Events):* Tự động đánh dấu hoàn thành nếu qua ngày mới.
  - *Công việc (Tasks - không ngày):* Giữ nguyên trạng thái để người dùng tích thủ công theo tiến độ.
  - *Thói quen (Habits):* Tự động tick bỏ trống khi qua ngày mới.
- **Spaced Repetition (Lặp lại ngắt quãng):** Áp dụng thuật toán cho module Tiếng Anh. App sẽ tự tính toán xem khi nào bạn cần ôn lại một từ vựng và tự động lên lịch nhắc nhở.
- **Interactive Widget:** Tạo Widget tương tác ngay ở màn hình chính điện thoại.
- **Local Notifications:** Lên lịch nhắc nhở offline hoàn toàn bằng thiết bị (thông qua `expo-notifications`), không tốn phí gọi server.
- **Tối ưu hình ảnh:** Nén ảnh trực tiếp trên điện thoại bằng `expo-image-manipulator` (giảm từ 3MB xuống vài trăm KB) trước khi tải lên Storage để tối ưu dung lượng gói Free.

## 4. Lộ Trình Phát Triển (Roadmap)
### Giai đoạn 1: MVP (Sản phẩm cốt lõi)
- Khởi tạo dự án React Native với Expo và NativeWind.
- Thiết lập Supabase, tạo bảng `Activities` (gom chung Tasks và Events).
- Hoàn thiện tính năng Thêm/Sửa/Xóa/Xem cho Activities và Nhật ký.

### Giai đoạn 2: Tự Động Hóa, Thuật Toán & Local DB
- Tích hợp WatermelonDB/MMKV cho tính năng Offline.
- Xây dựng module **Thói quen (Daily Habits)** và thiết lập logic tự động.
- Phát triển module **Tiếng Anh (Notes + Flashcard)** và thuật toán Spaced Repetition.

### Giai đoạn 3: Trải nghiệm Nâng cao & Đa nền tảng
- Cài đặt nhắc nhở (Local Notifications).
- Phát triển Interactive Widget cho màn hình chính.
- Tối ưu hóa tính năng đồng bộ (Sync) và dọn dẹp Local DB để tiết kiệm bộ nhớ.
- Triển khai bản Web/Desktop (qua Expo Web).

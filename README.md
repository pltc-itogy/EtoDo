# EtoDo - Super App Cá Nhân Hóa Toàn Diện 🚀

EtoDo (Everything to Do) là một ứng dụng di động được xây dựng bằng **React Native (Expo)** và **Supabase**, tập hợp tất cả các tiện ích cần thiết cho cuộc sống hàng ngày vào trong một màn hình duy nhất, với triết lý thiết kế tối giản, tinh tế lấy cảm hứng từ Notion.

## ✨ Tính năng nổi bật

### 1. 📅 Quản lý Lịch Trình (Activities)
- Lên lịch các sự kiện, công việc với `start_date` và `deadline`.
- Hệ thống danh mục (Category) và màu sắc giúp bạn dễ dàng phân loại.
- Chế độ tự động hóa: Tự động đánh dấu hoàn thành các sự kiện đã qua khi sang ngày mới để giữ màn hình luôn sạch sẽ.

### 2. 📖 Nhật ký Hình ảnh (Journals)
- Nơi bạn ghi lại cảm xúc và những khoảnh khắc đẹp.
- Hỗ trợ chèn nhiều ảnh vào nhật ký với khả năng xem ảnh chi tiết dạng thư viện.
- Upload ảnh lên Cloud (Supabase Storage) và tự động xóa ảnh lưu cục bộ để giải phóng dung lượng.

### 3. 🌱 Theo dõi Thói quen (Habit Tracker)
- Xây dựng thói quen tốt với chuỗi liên tiếp (Streak).
- Theo dõi các thói quen dưới dạng lưới lịch, tạo động lực hoàn thành mỗi ngày.

### 4. 🧠 Sổ tay Tiếng Anh & Flashcard (Spaced Repetition)
- Lưu trữ ngữ pháp, mẹo vặt và từ vựng mới.
- Tính năng Ôn tập Flashcard lật mặt thẻ áp dụng thuật toán **SuperMemo-2 (SM-2)** giúp bạn chỉ học những từ dễ quên, tự động tính toán thời gian lặp lại ngắt quãng tối ưu.

### 5. ⚡ Đồng bộ Ngoại tuyến (Offline-First)
- Sử dụng SQLite để lưu trữ dữ liệu tại máy.
- Hệ thống tự động lắng nghe kết nối mạng (NetInfo) và đồng bộ ngầm (Sync) lên Supabase khi mạng khôi phục, giúp bạn có thể sử dụng app 100% không cần internet.

---

## 🛠 Công nghệ sử dụng

- **Frontend:** React Native, Expo, Expo Router
- **Styling:** NativeWind (TailwindCSS v3), các font chữ JetBrains Mono.
- **Backend & Database:** SQLite (Local) & Supabase (Cloud Postgres, Auth, Storage)
- **State Management:** Zustand
- **Khác:** Expo Image Picker, NetInfo, FileSystem.

---

## 🚀 Hướng dẫn Cài đặt & Chạy dự án

### Yêu cầu hệ thống
- Đã cài đặt Node.js.
- Đã cài đặt ứng dụng Expo Go trên điện thoại.

### Bước 1: Clone dự án
```bash
git clone https://github.com/your-username/EtoDo.git
cd EtoDo
```

### Bước 2: Cài đặt thư viện
```bash
npm install
```

### Bước 3: Cấu hình biến môi trường
Tạo file `.env` ở thư mục gốc của dự án và điền thông tin Supabase của bạn:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Bước 4: Khởi chạy
```bash
npx expo start
```
Dùng điện thoại mở ứng dụng Expo Go và quét mã QR hiển thị trên Terminal để trải nghiệm ứng dụng.

---

## 📜 Cấu trúc Database (Supabase SQL)
Bạn cần chạy file `database.sql` đính kèm trong dự án trên giao diện SQL Editor của Supabase để khởi tạo bảng và các luật bảo mật (RLS) trước khi sử dụng tính năng đồng bộ (Sync).

---
*Developed with ❤️*

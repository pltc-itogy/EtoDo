# Yêu Cầu Dự Án (Project Requirements)

Tài liệu này quy định các tiêu chuẩn và yêu cầu bắt buộc trong suốt quá trình phát triển dự án EtoDo. Mọi đoạn code và kiến trúc đều phải tuân thủ các nguyên tắc dưới đây.

## 1. Tiêu chuẩn Mã nguồn mở (Open Source & BYOB)
Dự án được định hướng là mã nguồn mở (Open Source) theo mô hình **Bring Your Own Backend (BYOB)** để bất kỳ ai cũng có thể clone về, tự cài đặt và sử dụng miễn phí cho cá nhân:
- **Không Hardcode thông tin nhạy cảm:** Tuyệt đối không lưu trực tiếp các API Keys, URL của Supabase hay bất kỳ dịch vụ bên thứ ba nào vào thẳng mã nguồn.
- **Sử dụng Biến môi trường:** Mọi cấu hình kết nối phải được đọc từ file `.env` (được hướng dẫn trong `.env.example`).
- **Database Script:** Cấu trúc cơ sở dữ liệu và các quy tắc bảo mật (RLS) luôn được cập nhật trong file `database.sql` để người dùng mới có thể copy-paste cấu hình Database với 1 click.
- **Dễ dàng tự Setup:** Tài liệu hướng dẫn (README) phải rõ ràng, giải thích cách tạo project Supabase, điền `.env` và chạy app.

## 2. Tiêu chuẩn Viết Code (Coding Standards)
Dự án này được viết ra với mục đích sử dụng cá nhân và học tập, vì vậy code cần phải cực kỳ dễ đọc và dễ hiểu:
- **Comment giải thích chi tiết:** Bất cứ đoạn logic, function, hay flow xử lý nào hơi phức tạp đều **phải có comment giải thích rõ ràng** bên trên bằng tiếng Việt. Việc này giúp chủ dự án (người chưa quen với React Native/Expo) có thể đọc hiểu code đang làm gì.
- **Tuân thủ Kiến trúc:** Viết code bám sát cấu trúc thư mục (Feature-based) và công nghệ đã thống nhất trong `ARCHITECTURE.md` (WatermelonDB, Expo Router, NativeWind).
- **Phân tách Component:** Tránh viết các file quá dài. Tách nhỏ UI thành các component tái sử dụng được.

## 3. Quản lý Tiến độ linh hoạt
Tiến độ dự án được quản lý trong file `TODO.md`. File này không cố định mà **được phép sửa đổi, cập nhật liên tục** dựa trên tình hình thực tế, khó khăn phát sinh hoặc ý tưởng mới thêm vào trong quá trình code.

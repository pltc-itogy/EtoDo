import { Stack } from "expo-router";
// Nhúng file global.css để kích hoạt TailwindCSS trên toàn bộ ứng dụng
import "../global.css";

// Layout gốc (Root Layout) bao bọc toàn bộ ứng dụng
export default function Layout() {
  // Cấu trúc Stack giúp xếp chồng các màn hình lên nhau
  // headerShown: false dùng để ẩn thanh tiêu đề mặc định của hệ điều hành
  return <Stack screenOptions={{ headerShown: false }} />;
}

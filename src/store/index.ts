import { create } from 'zustand';

// Định nghĩa kiểu dữ liệu cho UserState
interface UserState {
  user: any | null; // Tạm thời dùng any, sau này sẽ thay bằng model User của Supabase
  setUser: (user: any | null) => void;
}

// Khởi tạo Global Store quản lý trạng thái người dùng (Zustand)
export const useUserStore = create<UserState>((set) => ({
  user: null, // Mặc định chưa đăng nhập
  // Hàm cập nhật thông tin user vào store
  setUser: (user) => set({ user }),
}));

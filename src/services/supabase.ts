import 'react-native-url-polyfill/auto'; // Bắt buộc cho môi trường React Native khi gọi API
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Đọc URL và Key từ biến môi trường. Tạm thời để URL mặc định nếu chưa có file .env
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Khởi tạo Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Sử dụng AsyncStorage để lưu phiên đăng nhập ngay trên thiết bị
    storage: AsyncStorage,
    // Tự động làm mới token đăng nhập
    autoRefreshToken: true,
    // Duy trì phiên làm việc cho dù tắt app
    persistSession: true,
    detectSessionInUrl: false,
  },
});

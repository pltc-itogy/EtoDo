import { Stack, useRouter, useSegments } from "expo-router";
import { useFonts, JetBrainsMono_400Regular, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { supabase } from '../src/services/supabase';
import { useUserStore } from '../src/store';
import { initDatabase, seedDefaultCategory } from '../src/database';

// Nhúng file global.css để kích hoạt TailwindCSS trên toàn bộ ứng dụng
// @ts-ignore
import "../global.css";

// Ngăn chặn splash screen tự động biến mất khi font chưa load xong
SplashScreen.preventAutoHideAsync();

// Khởi tạo Database cục bộ
try {
  initDatabase();
} catch (e) {
  console.error("Lỗi khởi tạo DB:", e);
}

// Layout gốc (Root Layout) bao bọc toàn bộ ứng dụng
export default function Layout() {
  const [fontsLoaded] = useFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  const { user, setUser } = useUserStore();
  const router = useRouter();
  const segments = useSegments();
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  useEffect(() => {
    // Lấy thông tin session hiện tại khi mở app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthInitialized(true);
    });

    // Lắng nghe sự kiện thay đổi đăng nhập/đăng xuất
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Xử lý ẩn màn hình chờ
  useEffect(() => {
    if (fontsLoaded && isAuthInitialized) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isAuthInitialized]);

  // Logic tự động điều hướng (Route Protection)
  useEffect(() => {
    if (!isAuthInitialized) return;

    const inAuthGroup = segments[0] === 'login';

    if (!user && !inAuthGroup) {
      // Chưa đăng nhập -> Trục xuất ra trang Login
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Đã đăng nhập -> Tạo danh mục mặc định (nếu chưa có) và Đẩy vào trang chính
      seedDefaultCategory();
      router.replace('/(tabs)');
    }
  }, [user, isAuthInitialized, segments]);

  if (!fontsLoaded || !isAuthInitialized) {
    return null; // Đợi hệ thống sẵn sàng
  }

  // Cấu trúc Stack giúp xếp chồng các màn hình lên nhau
  return (
    <View className="flex-1 bg-notion-bg">
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#191919' }
      }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="add-activity" options={{ presentation: 'modal' }} />
        <Stack.Screen 
          name="activity/[id]" 
          options={{ 
            presentation: 'transparentModal', 
            animation: 'fade', 
            contentStyle: { backgroundColor: 'transparent' } 
          }} 
        />
        
        {/* ENGLISH ROUTES */}
        <Stack.Screen name="add-english" options={{ presentation: 'modal' }} />
        <Stack.Screen name="review-english" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="all-flashcards" options={{ presentation: 'modal' }} />
        <Stack.Screen 
          name="english/[id]" 
          options={{ 
            presentation: 'transparentModal', 
            animation: 'fade', 
            contentStyle: { backgroundColor: 'transparent' } 
          }} 
        />
      </Stack>
    </View>
  );
}

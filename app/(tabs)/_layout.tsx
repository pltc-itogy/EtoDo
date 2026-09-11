import { Tabs } from "expo-router";

// Layout dành riêng cho thanh điều hướng dưới cùng (Bottom Tabs Navigation)
export default function TabsLayout() {
  return (
    // Cấu hình thanh TabBar sang màu đen Notion
    <Tabs screenOptions={{ 
      headerShown: true, 
      tabBarActiveTintColor: '#EBEBEB', // Chữ/Icon trắng mờ khi đang chọn
      tabBarInactiveTintColor: '#9B9B9B', // Chữ/Icon xám khi chưa chọn
      tabBarStyle: { backgroundColor: '#202020', borderTopColor: '#2E2E2E' }, // Nền TabBar
      headerStyle: { backgroundColor: '#202020', shadowColor: 'transparent', elevation: 0 }, // Nền thanh tiêu đề
      headerTintColor: '#EBEBEB',
      headerTitleStyle: { fontFamily: 'JetBrainsMono_700Bold' } // Phông chữ tiêu đề
    }}>
      {/* Khai báo các màn hình nằm trong Tab, name tương ứng với tên file trong thư mục (tabs) */}
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="habits" options={{ title: 'Habits' }} />
      <Tabs.Screen name="journal" options={{ title: 'Journal' }} />
      <Tabs.Screen name="english" options={{ title: 'English' }} />
    </Tabs>
  );
}

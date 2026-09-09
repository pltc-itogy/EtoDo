import { Tabs } from "expo-router";

// Layout dành riêng cho thanh điều hướng dưới cùng (Bottom Tabs Navigation)
export default function TabsLayout() {
  return (
    // tabBarActiveTintColor: Đặt màu xanh cho tab đang được chọn
    <Tabs screenOptions={{ headerShown: true, tabBarActiveTintColor: 'blue' }}>
      {/* Khai báo các màn hình nằm trong Tab, name tương ứng với tên file trong thư mục (tabs) */}
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="habits" options={{ title: 'Habits' }} />
      <Tabs.Screen name="journal" options={{ title: 'Journal' }} />
      <Tabs.Screen name="english" options={{ title: 'English' }} />
    </Tabs>
  );
}

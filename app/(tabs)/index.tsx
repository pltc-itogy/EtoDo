import { View, Text } from 'react-native';

// Màn hình Dashboard (Hiển thị Lịch trình & Công việc)
export default function Dashboard() {
  return (
    // Sử dụng Tailwind class: 
    // - flex-1: Chiếm toàn bộ chiều cao màn hình
    // - items-center, justify-center: Căn giữa nội dung
    // - bg-white: Nền trắng
    <View className="flex-1 items-center justify-center bg-white">
      {/* text-xl: Chữ to, font-bold: In đậm, text-blue-600: Màu xanh */}
      <Text className="text-xl font-bold text-blue-600">Dashboard / Activities</Text>
    </View>
  );
}

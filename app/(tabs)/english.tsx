import { View, Text } from 'react-native';

// Màn hình English (Lưu ghi chú Tiếng Anh và học từ vựng dạng Flashcard)
export default function English() {
  return (
    <View className="flex-1 items-center justify-center bg-notion-bg">
      <Text className="text-xl font-mono-bold text-notion-text">English Notes</Text>
    </View>
  );
}

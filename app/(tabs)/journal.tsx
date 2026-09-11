import { View, Text } from 'react-native';

// Màn hình Journal (Viết nhật ký cá nhân)
export default function Journal() {
  return (
    <View className="flex-1 items-center justify-center bg-notion-bg">
      <Text className="text-xl font-mono-bold text-notion-text">Journal</Text>
    </View>
  );
}

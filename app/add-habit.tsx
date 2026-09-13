import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useUserStore } from '../src/store';
import { addHabit } from '../src/database/habits';

const ICONS = ['💧', '📖', '🏃‍♂️', '🧘‍♀️', '🥗', '💊', '💪', '✍️', '💸', '🧹', '🛌', '🎸'];
const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

export default function AddHabit() {
  const router = useRouter();
  const { user } = useUserStore();
  
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💧');
  const [color, setColor] = useState('#3B82F6');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên thói quen');
      return;
    }
    if (!user) {
      Alert.alert('Lỗi', 'Bạn chưa đăng nhập');
      return;
    }

    try {
      addHabit({
        userId: user.id,
        name: name.trim(),
        icon,
        color
      });
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Không thể tạo thói quen');
    }
  };

  return (
    <ScrollView className="flex-1 bg-notion-bg p-4 pt-10">
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-xl font-mono-bold text-notion-text">Thêm Thói Quen Mới</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-notion-muted font-mono">Hủy</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-notion-text font-mono-bold mb-2">Tên thói quen</Text>
      <TextInput
        className="bg-notion-card text-notion-text font-mono border border-notion-border rounded-md px-4 py-3 mb-6"
        placeholder="Ví dụ: Uống 2 lít nước..."
        placeholderTextColor="#9B9B9B"
        value={name}
        onChangeText={setName}
      />

      <Text className="text-notion-text font-mono-bold mb-2">Biểu tượng (Icon)</Text>
      <View className="flex-row flex-wrap gap-3 mb-6">
        {ICONS.map(i => (
          <TouchableOpacity 
            key={i} 
            onPress={() => setIcon(i)}
            className={`w-12 h-12 rounded-full items-center justify-center ${icon === i ? 'bg-notion-text' : 'bg-notion-card border border-notion-border'}`}
          >
            <Text className="text-2xl">{i}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-notion-text font-mono-bold mb-2">Màu sắc</Text>
      <View className="flex-row flex-wrap gap-4 mb-10">
        {COLORS.map(c => (
          <TouchableOpacity 
            key={c} 
            onPress={() => setColor(c)}
            style={{ backgroundColor: c }}
            className={`w-10 h-10 rounded-full items-center justify-center ${color === c ? 'border-2 border-white' : ''}`}
          >
            {color === c && <Text className="text-white text-xs font-mono-bold">✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        onPress={handleSave}
        className="bg-notion-text py-4 rounded-md items-center"
      >
        <Text className="text-notion-bg font-mono-bold text-base">Lưu Thói Quen</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useUserStore } from '../src/store';
import { addActivity, AddActivityData } from '../src/database/activities';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddActivity() {
  const router = useRouter();
  const { user } = useUserStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('trung bình');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);

  // Hàm Lưu vào SQLite
  const handleSave = () => {
    if (!title.trim()) return Alert.alert('Lỗi', 'Vui lòng nhập tên công việc');
    if (!user) return Alert.alert('Lỗi', 'Bạn chưa đăng nhập');

    const data: AddActivityData = {
      userId: user.id,
      title: title.trim(),
      category: category.trim() || undefined,
      priority,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      startDate: startDate ? startDate.toISOString() : undefined,
      deadline: deadline ? deadline.toISOString() : undefined,
    };

    try {
      addActivity(data);
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Không thể lưu công việc');
    }
  };

  const priorities = [
    { label: 'Thấp', value: 'thấp', color: 'bg-green-600' },
    { label: 'Trung bình', value: 'trung bình', color: 'bg-[#ff9500]' },
    { label: 'Cao', value: 'cao', color: 'bg-red-600' }
  ];

  const formatDate = (date: Date | null) => date ? date.toLocaleDateString('vi-VN') : 'Chưa chọn';

  return (
    <ScrollView className="flex-1 bg-notion-bg p-4 pt-10">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-xl font-mono-bold text-notion-text">Thêm Chi Tiết</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-notion-muted font-mono">Hủy</Text>
        </TouchableOpacity>
      </View>

      {/* Tên công việc */}
      <Text className="text-notion-text font-mono mb-2">Tên công việc (*)</Text>
      <TextInput
        className="bg-notion-card text-notion-text font-mono border border-notion-border rounded-md px-4 py-3 mb-4"
        placeholder="Ví dụ: Đọc sách, họp hành..."
        placeholderTextColor="#9B9B9B"
        autoFocus
        value={title}
        onChangeText={setTitle}
      />

      {/* Danh mục */}
      <Text className="text-notion-text font-mono mb-2">Danh mục</Text>
      <TextInput
        className="bg-notion-card text-notion-text font-mono border border-notion-border rounded-md px-4 py-3 mb-4"
        placeholder="Công việc, Học tập, Cá nhân..."
        placeholderTextColor="#9B9B9B"
        value={category}
        onChangeText={setCategory}
      />

      {/* Mức độ ưu tiên */}
      <Text className="text-notion-text font-mono mb-2">Mức độ ưu tiên</Text>
      <View className="flex-row mb-4">
        {priorities.map((p) => (
          <TouchableOpacity 
            key={p.value}
            onPress={() => setPriority(p.value)}
            className={`flex-1 items-center py-2 border border-notion-border ${priority === p.value ? p.color : 'bg-notion-card'} ${p.value === 'thấp' ? 'rounded-l-md' : ''} ${p.value === 'cao' ? 'rounded-r-md' : ''}`}
          >
            <Text className={`font-mono-bold ${priority === p.value ? 'text-white' : 'text-notion-muted'}`}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Thời gian */}
      <View className="flex-row justify-between mb-4">
        <View className="flex-1 mr-2">
          <Text className="text-notion-text font-mono mb-2">Ngày bắt đầu</Text>
          <TouchableOpacity onPress={() => setShowStartPicker(true)} className="bg-notion-card border border-notion-border p-3 rounded-md">
            <Text className="text-notion-text font-mono text-center">{formatDate(startDate)}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartPicker(false);
                if (selectedDate) setStartDate(selectedDate);
              }}
            />
          )}
        </View>

        <View className="flex-1 ml-2">
          <Text className="text-notion-text font-mono mb-2">Hạn chót</Text>
          <TouchableOpacity onPress={() => setShowDeadlinePicker(true)} className="bg-notion-card border border-notion-border p-3 rounded-md">
            <Text className="text-notion-text font-mono text-center">{formatDate(deadline)}</Text>
          </TouchableOpacity>
          {showDeadlinePicker && (
            <DateTimePicker
              value={deadline || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDeadlinePicker(false);
                if (selectedDate) setDeadline(selectedDate);
              }}
            />
          )}
        </View>
      </View>

      {/* Địa điểm */}
      <Text className="text-notion-text font-mono mb-2">Địa điểm</Text>
      <TextInput
        className="bg-notion-card text-notion-text font-mono border border-notion-border rounded-md px-4 py-3 mb-4"
        placeholder="Phòng họp A, Quán cafe..."
        placeholderTextColor="#9B9B9B"
        value={location}
        onChangeText={setLocation}
      />

      {/* Ghi chú */}
      <Text className="text-notion-text font-mono mb-2">Ghi chú chi tiết</Text>
      <TextInput
        className="bg-notion-card text-notion-text font-mono border border-notion-border rounded-md px-4 py-3 mb-8"
        placeholder="Mô tả công việc cụ thể..."
        placeholderTextColor="#9B9B9B"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        value={notes}
        onChangeText={setNotes}
      />

      {/* Nút lưu */}
      <TouchableOpacity 
        onPress={handleSave}
        className="bg-notion-text py-4 rounded-md items-center mb-10"
      >
        <Text className="text-notion-bg font-mono-bold text-base">
          Lưu công việc
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

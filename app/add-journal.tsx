import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useUserStore } from '../src/store';
import { addJournal, updateJournal, getJournalById } from '../src/database/journals';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import DateTimePicker from '@react-native-community/datetimepicker';

const MOODS = ['😃', '😎', '😐', '😢', '😡', '😴', '🤯'];

export default function AddJournal() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useUserStore();

  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [daySequence, setDaySequence] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('😃');
  const [imageUri, setImageUri] = useState<string | null>(null);
  // State quản lý việc đang xử lý ảnh (hiển thị loading)
  const [isCompressing, setIsCompressing] = useState(false);

  // Hiệu ứng chạy khi màn hình được load (hoặc khi id thay đổi)
  // Nếu có id (Chế độ Sửa), nạp dữ liệu cũ vào các state để hiển thị lên form
  useEffect(() => {
    if (typeof id === 'string') {
      const existing = getJournalById(id);
      if (existing) {
        setEntryDate(new Date(existing.entry_date));
        setDaySequence(existing.day_sequence || '');
        setContent(existing.content || '');
        setMood(existing.mood || '😃');
        const imagesArr = JSON.parse(existing.images || '[]');
        if (imagesArr.length > 0) setImageUri(imagesArr[0]); // Chỉ lấy ảnh đầu tiên làm cover
      }
    }
  }, [id]);

  // Hàm xử lý việc chọn ảnh từ thư viện thiết bị
  const handlePickImage = async () => {
    try {
      // 1. Yêu cầu mở thư viện ảnh
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Chỉ chọn ảnh, không chọn video
        allowsEditing: true,    // Cho phép cắt ảnh trước khi chọn
        quality: 1,             // Chọn chất lượng cao nhất ban đầu
      });

      // 2. Nếu người dùng chọn ảnh thành công
      if (!result.canceled && result.assets[0]) {
        setIsCompressing(true); // Bật trạng thái loading
        
        // 3. Nén ảnh bằng expo-image-manipulator để giảm dung lượng file
        const manipResult = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 1000 } }], // Thu nhỏ chiều ngang tối đa 1000px, chiều cao tự động co dãn theo
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Giảm chất lượng (quality) xuống 70% và ép kiểu JPEG
        );
        
        // Lưu đường dẫn ảnh đã nén vào state
        setImageUri(manipResult.uri);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    } finally {
      setIsCompressing(false); // Tắt loading
    }
  };

  // Hàm lưu (Thêm mới hoặc Cập nhật) nhật ký
  const handleSave = () => {
    if (!user) return Alert.alert('Lỗi', 'Bạn chưa đăng nhập');

    try {
      // Chuẩn bị dữ liệu
      const data = {
        userId: user.id,
        entryDate: entryDate.toISOString(), // Lưu ngày dưới dạng ISO chuẩn (vd: 2026-09-12T10:30:00Z)
        daySequence: daySequence.trim() || undefined,
        content: content.trim() || undefined,
        mood,
        images: imageUri ? [imageUri] : [], // Chỉ lưu 1 ảnh
      };

      if (id && typeof id === 'string') {
        // Chế độ CẬP NHẬT (Update)
        updateJournal(id, data);
      } else {
        // Chế độ THÊM MỚI (Insert)
        addJournal(data);
      }
      router.back(); // Trở về màn hình trước
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Không thể lưu nhật ký');
    }
  };

  const formatDate = (date: Date) => date.toLocaleDateString('vi-VN');

  return (
    // Bọc toàn màn hình bằng KeyboardAvoidingView để xử lý khi bàn phím ảo xuất hiện
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      {/* ScrollView giúp cuộn màn hình. Thêm paddingBottom 100 để đẩy nội dung lên khi có bàn phím */}
      <ScrollView 
        className="flex-1 bg-notion-bg p-4 pt-10" 
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-xl font-mono-bold text-notion-text">
            {id ? 'Sửa Nhật Ký' : 'Viết Nhật Ký'}
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-notion-muted font-mono">Hủy</Text>
          </TouchableOpacity>
        </View>

      {/* Ngày diễn ra & Ngày số */}
      <View className="flex-row justify-between mb-4 gap-2">
        <View className="flex-1">
          <Text className="text-notion-text font-mono mb-2">Ngày diễn ra</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} className="bg-notion-card border border-notion-border p-3 rounded-md">
            <Text className="text-notion-text font-mono text-center text-sm">{formatDate(entryDate)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={entryDate}
              mode="date"
              display="default"
              onValueChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setEntryDate(selectedDate);
              }}
              onDismiss={() => setShowDatePicker(false)}
            />
          )}
        </View>

        <View className="flex-1">
          <Text className="text-notion-text font-mono mb-2">Đánh dấu ngày</Text>
          <TextInput
            className="bg-notion-card text-notion-text font-mono border border-notion-border rounded-md px-4 py-3 text-sm"
            placeholder="VD: Ngày 110"
            placeholderTextColor="#9B9B9B"
            value={daySequence}
            onChangeText={setDaySequence}
          />
        </View>
      </View>

      {/* Mood */}
      <Text className="text-notion-text font-mono mb-2">Cảm xúc</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
        {MOODS.map(m => (
          <TouchableOpacity 
            key={m} 
            onPress={() => setMood(m)}
            className={`w-12 h-12 rounded-full items-center justify-center mr-2 ${mood === m ? 'bg-notion-text' : 'bg-notion-card border border-notion-border'}`}
          >
            <Text className="text-2xl">{m}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Hình ảnh */}
      <Text className="text-notion-text font-mono mb-2">Hình ảnh</Text>
      {imageUri ? (
        <View className="mb-4 relative">
          <Image source={{ uri: imageUri }} className="w-full h-48 rounded-md" resizeMode="cover" />
          <TouchableOpacity 
            className="absolute top-2 right-2 bg-black/50 p-2 rounded-full"
            onPress={() => setImageUri(null)}
          >
            <Text className="text-white font-mono-bold text-xs">Xóa ảnh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          onPress={handlePickImage}
          disabled={isCompressing}
          className="bg-notion-card border-2 border-dashed border-notion-border rounded-md p-6 items-center justify-center mb-4"
        >
          <Text className="text-notion-muted font-mono">{isCompressing ? 'Đang nén ảnh...' : '+ Chọn ảnh'}</Text>
        </TouchableOpacity>
      )}

      {/* Nội dung */}
      <Text className="text-notion-text font-mono mb-2">Nội dung</Text>
      <TextInput
        className="bg-notion-card text-notion-text font-mono border border-notion-border rounded-md px-4 py-3 mb-8"
        placeholder="Hôm nay có gì vui..."
        placeholderTextColor="#9B9B9B"
        multiline
        numberOfLines={10}
        textAlignVertical="top"
        style={{ minHeight: 200 }}
        value={content}
        onChangeText={setContent}
      />

        {/* Nút lưu */}
        <TouchableOpacity 
          onPress={handleSave}
          className="bg-notion-text py-4 rounded-md items-center mb-10"
        >
          <Text className="text-notion-bg font-mono-bold text-base">
            {id ? 'Cập nhật' : 'Lưu Nhật Ký'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

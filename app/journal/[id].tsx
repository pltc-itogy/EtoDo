import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getJournalById, deleteJournal, Journal } from '../../src/database/journals';

export default function JournalDetail() {
  const { id } = useLocalSearchParams(); // Lấy ID của trang nhật ký từ thanh URL
  const router = useRouter();
  const [journal, setJournal] = useState<Journal | null>(null);

  // Khi màn hình được mở (hoặc ID thay đổi), hàm này sẽ chạy để kéo dữ liệu từ SQLite
  useEffect(() => {
    if (typeof id === 'string') {
      const data = getJournalById(id);
      setJournal(data);
    }
  }, [id]);

  if (!journal) {
    return (
      <View className="flex-1 bg-notion-bg items-center justify-center p-4">
        <Text className="text-notion-text font-mono">Đang tải hoặc không tìm thấy nhật ký...</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-notion-card px-4 py-2 rounded">
          <Text className="text-notion-text font-mono">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Xử lý Xóa nhật ký có cảnh báo
  const handleDelete = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa trang nhật ký này?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Xóa', 
        style: 'destructive',
        onPress: () => {
          deleteJournal(journal.id); // Gọi hàm xóa trong CSDL SQLite
          router.back();             // Về màn hình trước đó
        }
      }
    ]);
  };

  // Vì hình ảnh được lưu trong CSDL dưới dạng chuỗi JSON: '["url1", "url2"]'
  // Nên ta cần parse chuỗi đó ra thành mảng Array để sử dụng
  const imagesArr = JSON.parse(journal.images || '[]');
  const coverImage = imagesArr.length > 0 ? imagesArr[0] : null;

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <View className="flex-1 bg-notion-bg">
      <View className="flex-row justify-between items-center p-4 pt-10 border-b border-notion-border bg-notion-bg z-10">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-notion-text font-mono">← Quay lại</Text>
        </TouchableOpacity>
        <View className="flex-row gap-6">
          <TouchableOpacity onPress={() => router.push(`/add-journal?id=${journal.id}`)}>
            <Text className="text-blue-500 font-mono-bold">Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text className="text-red-500 font-mono-bold">Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        {coverImage && (
          <Image 
            source={{ uri: coverImage }} 
            className="w-full h-64"
            resizeMode="cover"
          />
        )}
        
        <View className="p-4">
          <View className="flex-row justify-between items-center border-b border-notion-border pb-4 mb-4">
            <View>
              {journal.day_sequence && (
                <Text className="font-mono-bold text-notion-text text-2xl mb-1">
                  {journal.day_sequence}
                </Text>
              )}
              <Text className="text-notion-muted font-mono text-sm">
                Ngày viết: {formatDate(journal.entry_date)}
              </Text>
            </View>
            <Text className="text-4xl">{journal.mood || '😃'}</Text>
          </View>

          <Text className="text-notion-text font-mono text-base leading-7">
            {journal.content || '*Không có nội dung*'}
          </Text>
        </View>
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}

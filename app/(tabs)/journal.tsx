import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { getJournals, Journal } from '../../src/database/journals';

export default function JournalTab() {
  const router = useRouter();
  const [journals, setJournals] = useState<Journal[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadJournals();
    }, [])
  );

  const loadJournals = () => {
    const data = getJournals();
    setJournals(data);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <View className="flex-1 bg-notion-bg">
      <View className="flex-row justify-between items-center p-4 pt-10 border-b border-notion-border">
        <Text className="text-xl font-mono-bold text-notion-text">Nhật Ký</Text>
        <TouchableOpacity onPress={() => router.push('/add-journal')}>
          <Text className="text-notion-text font-mono-bold">+ Viết</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {journals.length === 0 ? (
          <Text className="text-notion-muted font-mono italic text-center mt-10">
            Chưa có trang nhật ký nào. Hãy viết trang đầu tiên nhé!
          </Text>
        ) : (
          journals.map((j) => {
            const imagesArr = JSON.parse(j.images || '[]');
            const coverImage = imagesArr.length > 0 ? imagesArr[0] : null;

            return (
              <TouchableOpacity 
                key={j.id} 
                onPress={() => router.push(`/journal/${j.id}`)}
                className="bg-notion-card border border-notion-border rounded-lg mb-4 overflow-hidden"
              >
                {/* Ảnh đính kèm (nếu có) hiển thị tràn viền nửa trên */}
                {coverImage && (
                  <Image 
                    source={{ uri: coverImage }} 
                    className="w-full h-48"
                    resizeMode="cover"
                  />
                )}
                
                {/* Thông tin ngày tháng bên dưới ảnh */}
                <View className="p-4 flex-row justify-between items-center">
                  <View>
                    {j.day_sequence && (
                      <Text className="font-mono-bold text-notion-text text-lg mb-1">
                        {j.day_sequence}
                      </Text>
                    )}
                    <Text className="text-notion-muted font-mono text-xs">
                      {formatDate(j.entry_date)}
                    </Text>
                  </View>
                  <Text className="text-3xl">{j.mood || '😃'}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}

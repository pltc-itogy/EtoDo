import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { EnglishNote, getAllFlashcards, deleteEnglishNote } from '../src/database/english';

export default function AllFlashcards() {
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<EnglishNote[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = () => {
    setFlashcards(getAllFlashcards());
  };

  const handleDelete = (id: string) => {
    Alert.alert('Xóa từ vựng', 'Bạn có chắc chắn muốn xóa?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => {
          deleteEnglishNote(id);
          loadData();
      }}
    ]);
  };

  return (
    <View className="flex-1 bg-notion-bg p-4 pt-10">
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-notion-muted font-mono text-lg">← Trở về</Text>
        </TouchableOpacity>
        <Text className="text-xl font-mono-bold text-notion-text">Toàn bộ Từ vựng</Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-notion-muted font-mono mb-4 text-sm">
          Tổng cộng: {flashcards.length} từ
        </Text>
        
        {flashcards.length === 0 ? (
          <Text className="text-notion-muted font-mono italic text-center mt-10">
            Chưa có từ vựng nào được thêm.
          </Text>
        ) : (
          flashcards.map(card => (
            <View key={card.id} className="bg-notion-card border border-notion-border rounded-lg p-4 mb-3 flex-row items-start justify-between">
              <View className="flex-1 mr-3">
                <Text className="font-mono-bold text-notion-text text-lg mb-1">{card.title_or_word}</Text>
                {!!card.content_or_meaning && (
                  <Text className="text-notion-muted font-mono text-sm mb-2">{card.content_or_meaning}</Text>
                )}
                {!!card.example_sentence && (
                  <Text className="text-notion-muted font-mono italic text-xs">Ex: "{card.example_sentence}"</Text>
                )}
              </View>
              <View className="flex-row gap-3">
                <TouchableOpacity onPress={() => router.push(`/add-english?id=${card.id}`)}>
                  <Text className="text-blue-500 font-mono text-xs mt-1">Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(card.id)}>
                  <Text className="text-red-500 font-mono text-xs mt-1">Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}

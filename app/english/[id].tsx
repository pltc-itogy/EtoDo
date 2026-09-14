import { View, Text, TouchableOpacity, ScrollView, Alert, TouchableWithoutFeedback } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { EnglishNote, getEnglishNoteById, deleteEnglishNote } from '../../src/database/english';

export default function TipDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [note, setNote] = useState<EnglishNote | null>(null);

  const loadData = useCallback(() => {
    if (id) {
      const data = getEnglishNoteById(id);
      setNote(data);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (!note) return null;

  const handleDelete = () => {
    Alert.alert('Xóa ghi chú', 'Bạn có chắc chắn muốn xóa?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => {
          deleteEnglishNote(note.id);
          router.back();
      }}
    ]);
  };

  return (
    <TouchableOpacity 
      activeOpacity={1} 
      onPress={() => router.back()} 
      className="flex-1 bg-black/70 justify-center items-center p-4"
    >
      <TouchableWithoutFeedback>
        <View className="w-full max-h-[80%] bg-notion-bg rounded-xl border border-notion-border overflow-hidden shadow-lg shadow-black">
          
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-notion-border bg-notion-card">
            <Text className="text-notion-text font-mono-bold text-lg">Tip / Ngữ Pháp</Text>
            <View className="flex-row gap-4">
              <TouchableOpacity onPress={() => { router.back(); router.push(`/add-english?id=${note.id}`); }}>
                <Text className="text-blue-500 font-mono-bold">Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <Text className="text-red-500 font-mono-bold">Xóa</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-notion-muted font-mono-bold ml-2">X</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Nội dung */}
          <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
            <Text className="text-2xl font-mono-bold text-notion-text mb-6">
              {note.title_or_word}
            </Text>
            
            <View className="bg-[#1e1e1e] rounded-lg p-4 mb-4">
              {note.content_or_meaning ? (
                <Text className="text-notion-text font-mono text-base leading-relaxed">
                  {note.content_or_meaning}
                </Text>
              ) : (
                <Text className="text-notion-muted font-mono italic text-sm">Không có nội dung chi tiết.</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </TouchableOpacity>
  );
}

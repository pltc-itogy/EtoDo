import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { getDueFlashcardsCount, getEnglishTips, EnglishNote } from '../../src/database/english';
import { useUserStore } from '../../src/store';

export default function EnglishTab() {
  const router = useRouter();
  const { user } = useUserStore();
  
  const [dueCount, setDueCount] = useState(0);
  const [tips, setTips] = useState<EnglishNote[]>([]);
  const [reviewLimit, setReviewLimit] = useState<number>(25);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = () => {
    setDueCount(getDueFlashcardsCount());
    setTips(getEnglishTips());
  };

  const handleStartReview = () => {
    if (dueCount === 0) return;
    router.push(`/review-english?limit=${reviewLimit}`);
  };

  return (
    <View className="flex-1 bg-notion-bg">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        
        {/* FLASHCARD SECTION */}
        <View className="mb-8 mt-2 bg-notion-card border border-notion-border rounded-xl p-5">
          <Text className="text-xl font-mono-bold text-notion-text mb-2">Học Flashcard</Text>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-notion-muted font-mono text-sm">
              Đến hạn hôm nay: <Text className="text-orange-400 font-mono-bold">{dueCount}</Text> từ
            </Text>
            <TouchableOpacity onPress={() => router.push('/all-flashcards')}>
              <Text className="text-notion-muted font-mono text-xs underline">Xem toàn bộ</Text>
            </TouchableOpacity>
          </View>
          
          <Text className="text-notion-text font-mono-bold mb-2">Số lượng ôn tập:</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {[10, 25, 50, 999].map(num => (
              <TouchableOpacity
                key={num}
                onPress={() => setReviewLimit(num)}
                className={`px-3 py-1.5 rounded-md border ${reviewLimit === num ? 'border-notion-text bg-notion-text' : 'border-notion-border bg-notion-card'}`}
              >
                <Text className={`font-mono text-sm ${reviewLimit === num ? 'text-notion-bg' : 'text-notion-muted'}`}>
                  {num === 999 ? 'Tất cả' : `${num} từ`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleStartReview}
            disabled={dueCount === 0}
            className={`py-3 rounded-lg items-center ${dueCount === 0 ? 'bg-notion-border opacity-50' : 'bg-green-600'}`}
          >
            <Text className="text-white font-mono-bold">BẮT ĐẦU ÔN TẬP</Text>
          </TouchableOpacity>
        </View>

        {/* TIPS & NGỮ PHÁP SECTION */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-mono-bold text-notion-text">Sổ tay Tips & Ngữ Pháp</Text>
          <TouchableOpacity onPress={() => router.push('/add-english?type=tip')}>
            <Text className="text-notion-text font-mono-bold">+ Thêm Tip</Text>
          </TouchableOpacity>
        </View>
        
        {/* Nút thêm flashcard nhanh */}
        <TouchableOpacity 
          onPress={() => router.push('/add-english?type=flashcard')}
          className="mb-4 bg-notion-card border border-notion-border border-dashed py-2 rounded-lg items-center"
        >
          <Text className="text-notion-text font-mono">+ Thêm Flashcard mới</Text>
        </TouchableOpacity>

        {tips.length === 0 ? (
          <Text className="text-notion-muted font-mono italic text-center mt-4">
            Chưa có ghi chú nào.
          </Text>
        ) : (
          tips.map(tip => (
            <TouchableOpacity
              key={tip.id}
              onPress={() => router.push(`/english/${tip.id}`)}
              className="bg-notion-card border border-notion-border rounded-lg p-4 mb-3 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Text className="text-xl mr-3">💡</Text>
                <Text className="font-mono-bold text-notion-text text-base flex-1" numberOfLines={2}>
                  {tip.title_or_word}
                </Text>
              </View>
              <Text className="text-notion-muted">→</Text>
            </TouchableOpacity>
          ))
        )}

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}

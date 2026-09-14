import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { getDueFlashcards, reviewFlashcard, EnglishNote } from '../src/database/english';

export default function ReviewEnglish() {
  const router = useRouter();
  const { limit } = useLocalSearchParams<{ limit: string }>();
  
  const [cards, setCards] = useState<EnglishNote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Animation cho việc lật thẻ (nếu muốn làm mượt hơn sau này)
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Lấy số lượng thẻ dựa vào cấu hình truyền sang (hoặc mặc định 25)
    const count = parseInt(limit || '25', 10);
    const dueCards = getDueFlashcards(count);
    setCards(dueCards);
  }, [limit]);

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleScore = (score: number) => {
    const currentCard = cards[currentIndex];
    
    // Lưu vào database
    reviewFlashcard(currentCard.id, score);
    
    // Chuyển sang thẻ tiếp theo
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex + 1);
    } else {
      // Đã ôn xong
      setCurrentIndex(cards.length);
    }
  };

  if (cards.length === 0) {
    return (
      <View className="flex-1 bg-notion-bg items-center justify-center p-4">
        <Text className="text-2xl mb-4">🎉</Text>
        <Text className="text-notion-text font-mono-bold text-lg text-center mb-6">
          Tuyệt vời! Bạn không còn thẻ nào cần ôn tập lúc này.
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-notion-text px-6 py-3 rounded-lg"
        >
          <Text className="text-notion-bg font-mono-bold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Màn hình khi đã ôn xong toàn bộ session
  if (currentIndex >= cards.length) {
    return (
      <View className="flex-1 bg-notion-bg items-center justify-center p-4">
        <Text className="text-4xl mb-4">🏆</Text>
        <Text className="text-notion-text font-mono-bold text-xl text-center mb-2">
          Đã hoàn thành phiên ôn tập!
        </Text>
        <Text className="text-notion-muted font-mono text-center mb-8">
          Bạn vừa ôn xong {cards.length} thẻ. Hãy giữ vững phong độ nhé!
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-notion-text px-6 py-3 rounded-lg"
        >
          <Text className="text-notion-bg font-mono-bold">Hoàn tất</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const card = cards[currentIndex];

  return (
    <View className="flex-1 bg-notion-bg p-4 pt-12">
      {/* Header Process */}
      <View className="flex-row justify-between items-center mb-8">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-notion-muted font-mono">Dừng lại</Text>
        </TouchableOpacity>
        <Text className="text-notion-muted font-mono-bold">
          {currentIndex + 1} / {cards.length}
        </Text>
      </View>

      {/* Vùng Thẻ (Flashcard) */}
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={!isFlipped ? handleFlip : undefined}
        className="flex-1 bg-notion-card border border-notion-border rounded-2xl items-center justify-center p-6 mb-8 shadow-md shadow-black"
      >
        <Text className="text-notion-muted font-mono text-xs absolute top-4 left-4 uppercase">
          {isFlipped ? 'Mặt sau (Ý nghĩa)' : 'Mặt trước (Từ vựng)'}
        </Text>

        <Text className="text-4xl font-mono-bold text-notion-text text-center mb-6">
          {card.title_or_word}
        </Text>

        {isFlipped ? (
          <View className="items-center w-full">
            <View className="h-[1px] bg-notion-border w-full mb-6" />
            <Text className="text-lg font-mono text-notion-text text-center mb-4 leading-relaxed">
              {card.content_or_meaning || 'Không có giải nghĩa'}
            </Text>
            
            {!!card.example_sentence && (
              <View className="bg-notion-bg p-4 rounded-lg border border-notion-border w-full mt-2">
                <Text className="text-notion-muted font-mono text-xs mb-1">Ví dụ:</Text>
                <Text className="text-notion-text font-mono italic">
                  "{card.example_sentence}"
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Text className="text-notion-muted font-mono italic mt-8 animate-pulse">
            Chạm để lật thẻ
          </Text>
        )}
      </TouchableOpacity>

      {/* Khu vực nút bấm */}
      <View className="h-24">
        {isFlipped ? (
          <View className="flex-row justify-between gap-3">
            <TouchableOpacity 
              onPress={() => handleScore(0)}
              className="flex-1 bg-red-900/40 border border-red-500/50 py-4 rounded-xl items-center"
            >
              <Text className="text-red-400 font-mono-bold mb-1">Lại</Text>
              <Text className="text-red-400/50 text-[10px] font-mono">&lt; 1 ngày</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => handleScore(3)}
              className="flex-1 bg-yellow-900/40 border border-yellow-500/50 py-4 rounded-xl items-center"
            >
              <Text className="text-yellow-400 font-mono-bold mb-1">Khó</Text>
              <Text className="text-yellow-400/50 text-[10px] font-mono">Vài ngày</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => handleScore(5)}
              className="flex-1 bg-green-900/40 border border-green-500/50 py-4 rounded-xl items-center"
            >
              <Text className="text-green-400 font-mono-bold mb-1">Dễ</Text>
              <Text className="text-green-400/50 text-[10px] font-mono">Dài hạn</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="items-center justify-center flex-1">
            <Text className="text-notion-muted font-mono text-xs">Hãy cố nhớ nghĩa trước khi lật nhé!</Text>
          </View>
        )}
      </View>
    </View>
  );
}

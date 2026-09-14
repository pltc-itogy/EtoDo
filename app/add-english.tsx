import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useUserStore } from '../src/store';
import { addEnglishNote, getEnglishNoteById, updateEnglishNote } from '../src/database/english';

export default function AddEnglish() {
  const router = useRouter();
  const { id, type: initialType } = useLocalSearchParams<{ id?: string, type?: 'tip' | 'flashcard' }>();
  const isEditing = !!id;
  const { user } = useUserStore();

  const [type, setType] = useState<'tip' | 'flashcard'>(initialType || 'flashcard');
  const [titleOrWord, setTitleOrWord] = useState('');
  const [contentOrMeaning, setContentOrMeaning] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      const note = getEnglishNoteById(id);
      if (note) {
        setType(note.type as 'tip' | 'flashcard');
        setTitleOrWord(note.title_or_word);
        setContentOrMeaning(note.content_or_meaning || '');
        setExampleSentence(note.example_sentence || '');
      }
    }
  }, [id, isEditing]);

  const handleSave = () => {
    if (!titleOrWord.trim() || !user) {
      Alert.alert('Lỗi', 'Vui lòng nhập Từ vựng / Tiêu đề');
      return;
    }

    const data = {
      userId: user.id,
      type,
      titleOrWord: titleOrWord.trim(),
      contentOrMeaning: contentOrMeaning.trim(),
      exampleSentence: exampleSentence.trim()
    };

    try {
      if (isEditing && id) {
        updateEnglishNote(id, data);
      } else {
        addEnglishNote(data);
      }
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Không thể lưu ghi chú');
    }
  };

  return (
    <ScrollView className="flex-1 bg-notion-bg p-4 pt-10">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-xl font-mono-bold text-notion-text">{isEditing ? 'Sửa Ghi Chú' : 'Thêm Ghi Chú'}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-notion-muted font-mono">Hủy</Text>
        </TouchableOpacity>
      </View>

      {!isEditing && (
        <View className="flex-row mb-6 bg-notion-card rounded-lg p-1 border border-notion-border">
          <TouchableOpacity 
            onPress={() => setType('flashcard')}
            className={`flex-1 items-center py-2 rounded-md ${type === 'flashcard' ? 'bg-notion-text' : ''}`}
          >
            <Text className={`font-mono-bold ${type === 'flashcard' ? 'text-notion-bg' : 'text-notion-muted'}`}>Flashcard</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setType('tip')}
            className={`flex-1 items-center py-2 rounded-md ${type === 'tip' ? 'bg-notion-text' : ''}`}
          >
            <Text className={`font-mono-bold ${type === 'tip' ? 'text-notion-bg' : 'text-notion-muted'}`}>Mẹo / Ngữ pháp</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input Fields */}
      <Text className="text-notion-text font-mono mb-2">{type === 'flashcard' ? 'Từ vựng (Word)' : 'Tiêu đề (Title)'} *</Text>
      <TextInput
        value={titleOrWord}
        onChangeText={setTitleOrWord}
        className="bg-notion-card text-notion-text border border-notion-border p-3 rounded-lg font-mono mb-4"
        placeholder={type === 'flashcard' ? 'Ex: Serendipity' : 'Ex: Cách dùng Although'}
        placeholderTextColor="#555"
      />

      <Text className="text-notion-text font-mono mb-2">{type === 'flashcard' ? 'Ý nghĩa (Meaning)' : 'Nội dung (Content)'}</Text>
      <TextInput
        value={contentOrMeaning}
        onChangeText={setContentOrMeaning}
        multiline
        numberOfLines={4}
        className="bg-notion-card text-notion-text border border-notion-border p-3 rounded-lg font-mono mb-4 min-h-[100px]"
        textAlignVertical="top"
        placeholder={type === 'flashcard' ? 'Ex: Sự tình cờ may mắn' : 'Ex: Although + Mệnh đề...'}
        placeholderTextColor="#555"
      />

      {type === 'flashcard' && (
        <>
          <Text className="text-notion-text font-mono mb-2">Câu ví dụ (Example sentence)</Text>
          <TextInput
            value={exampleSentence}
            onChangeText={setExampleSentence}
            multiline
            numberOfLines={3}
            className="bg-notion-card text-notion-text border border-notion-border p-3 rounded-lg font-mono mb-6 min-h-[80px]"
            textAlignVertical="top"
            placeholder="Ex: Finding that old photo was a pure serendipity."
            placeholderTextColor="#555"
          />
        </>
      )}

      <TouchableOpacity 
        onPress={handleSave}
        className="bg-notion-text p-4 rounded-lg items-center mt-4 mb-20"
      >
        <Text className="text-notion-bg font-mono-bold">Lưu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

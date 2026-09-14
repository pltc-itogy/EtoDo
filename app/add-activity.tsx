import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Modal } from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { useUserStore } from '../src/store';
import { addActivity, AddActivityData, getActivityById, updateActivity } from '../src/database/activities';
import { Category, getCategories, addCategory, deleteCategory } from '../src/database/categories';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddActivity() {
  const router = useRouter();
  const { id, initialCategory } = useLocalSearchParams<{ id: string, initialCategory?: string }>();
  const isEditing = !!id;
  const { user } = useUserStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(initialCategory || '');
  const [priority, setPriority] = useState('trung bình');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  
  // States cho Time Picker
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showDeadlineTimePicker, setShowDeadlineTimePicker] = useState(false);

  // States cho Categories Modal
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (user) {
        setCategories(getCategories(user.id));
      }
    }, [user])
  );

  // Load chi tiết nếu đang edit
  useEffect(() => {
    if (isEditing && id) {
      const activity = getActivityById(id);
      if (activity) {
        setTitle(activity.title);
        setCategory(activity.category || '');
        setPriority(activity.priority);
        setLocation(activity.location || '');
        setNotes(activity.notes || '');
        if (activity.start_date) setStartDate(new Date(activity.start_date));
        if (activity.deadline) setDeadline(new Date(activity.deadline));
      }
    }
  }, [id, isEditing]);

  const handleAddCategory = () => {
    if (!newCatName.trim() || !user) return;
    try {
      const newCat = addCategory({ userId: user.id, name: newCatName.trim() });
      setCategories([...categories, newCat]);
      setCategory(newCat.name); // Auto select
      setNewCatName('');
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Không thể tạo danh mục');
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    Alert.alert('Xóa', `Xóa danh mục "${name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => {
          deleteCategory(id);
          setCategories(categories.filter(c => c.id !== id));
          if (category === name) setCategory(''); // clear selected
      }}
    ]);
  };

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
      if (isEditing && id) {
        updateActivity(id, data);
      } else {
        addActivity(data);
      }
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

  const formatDate = (date: Date | null) => date ? date.toLocaleDateString('vi-VN') : 'Chọn ngày';
  const formatTime = (date: Date | null) => {
    if (!date) return 'Chọn giờ';
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <ScrollView className="flex-1 bg-notion-bg p-4 pt-10">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-xl font-mono-bold text-notion-text">{isEditing ? 'Chi Tiết Công Việc' : 'Thêm Công Việc Mới'}</Text>
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
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-notion-text font-mono">Danh mục</Text>
        <TouchableOpacity onPress={() => setShowCatModal(true)}>
          <Text className="text-notion-muted font-mono text-xs underline">Quản lý nhãn</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        className="bg-notion-card text-notion-text font-mono border border-notion-border rounded-md px-4 py-3 mb-3"
        placeholder="Nhập trực tiếp hoặc chọn bên dưới..."
        placeholderTextColor="#9B9B9B"
        value={category}
        onChangeText={setCategory}
      />
      {/* Category Chips ngang */}
      {categories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
          {categories.map(c => (
            <TouchableOpacity 
              key={c.id} 
              onPress={() => setCategory(c.name)}
              className={`mr-2 px-3 py-1.5 border border-notion-border rounded-full ${category === c.name ? 'bg-notion-text' : 'bg-notion-card'}`}
            >
              <Text className={`font-mono text-xs ${category === c.name ? 'text-notion-bg' : 'text-notion-muted'}`}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

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
          <Text className="text-notion-text font-mono mb-2">Bắt đầu</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity onPress={() => setShowStartPicker(true)} className="flex-1 bg-notion-card border border-notion-border p-3 rounded-md">
              <Text className="text-notion-text font-mono text-center text-xs">{formatDate(startDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowStartTimePicker(true)} className="flex-1 bg-notion-card border border-notion-border p-3 rounded-md">
              <Text className="text-notion-text font-mono text-center text-xs">{formatTime(startDate)}</Text>
            </TouchableOpacity>
          </View>
          
          {showStartPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              onValueChange={(event, selectedDate) => {
                setShowStartPicker(false);
                if (selectedDate) {
                  const newD = startDate || new Date();
                  newD.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                  setStartDate(new Date(newD));
                }
              }}
              onDismiss={() => setShowStartPicker(false)}
            />
          )}
          {showStartTimePicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="time"
              display="default"
              onValueChange={(event, selectedDate) => {
                setShowStartTimePicker(false);
                if (selectedDate) {
                  const newD = startDate || new Date();
                  newD.setHours(selectedDate.getHours(), selectedDate.getMinutes());
                  setStartDate(new Date(newD));
                }
              }}
              onDismiss={() => setShowStartTimePicker(false)}
            />
          )}
        </View>

        <View className="flex-1 ml-2">
          <Text className="text-notion-text font-mono mb-2">Hạn chót</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity onPress={() => setShowDeadlinePicker(true)} className="flex-1 bg-notion-card border border-notion-border p-3 rounded-md">
              <Text className="text-notion-text font-mono text-center text-xs">{formatDate(deadline)}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowDeadlineTimePicker(true)} className="flex-1 bg-notion-card border border-notion-border p-3 rounded-md">
              <Text className="text-notion-text font-mono text-center text-xs">{formatTime(deadline)}</Text>
            </TouchableOpacity>
          </View>

          {showDeadlinePicker && (
            <DateTimePicker
              value={deadline || new Date()}
              mode="date"
              display="default"
              onValueChange={(event, selectedDate) => {
                setShowDeadlinePicker(false);
                if (selectedDate) {
                  const newD = deadline || new Date();
                  newD.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                  setDeadline(new Date(newD));
                }
              }}
              onDismiss={() => setShowDeadlinePicker(false)}
            />
          )}
          {showDeadlineTimePicker && (
            <DateTimePicker
              value={deadline || new Date()}
              mode="time"
              display="default"
              onValueChange={(event, selectedDate) => {
                setShowDeadlineTimePicker(false);
                if (selectedDate) {
                  const newD = deadline || new Date();
                  newD.setHours(selectedDate.getHours(), selectedDate.getMinutes());
                  setDeadline(new Date(newD));
                }
              }}
              onDismiss={() => setShowDeadlineTimePicker(false)}
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

      {/* Modal Categories */}
      <Modal visible={showCatModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-notion-bg w-full h-[60%] rounded-t-2xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-mono-bold text-notion-text text-lg">Quản lý Danh mục</Text>
              <TouchableOpacity onPress={() => setShowCatModal(false)}>
                <Text className="font-mono text-notion-text">Đóng</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row mb-6">
              <TextInput 
                className="flex-1 bg-notion-card border border-notion-border rounded-md px-4 py-3 text-notion-text font-mono mr-2"
                placeholder="Nhập tên danh mục mới..."
                placeholderTextColor="#9B9B9B"
                value={newCatName}
                onChangeText={setNewCatName}
              />
              <TouchableOpacity onPress={handleAddCategory} className="bg-notion-text px-4 py-3 rounded-md items-center justify-center">
                <Text className="text-notion-bg font-mono-bold">Thêm</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {categories.length === 0 ? (
                <Text className="text-notion-muted font-mono italic text-center">Chưa có danh mục nào.</Text>
              ) : (
                categories.map(c => (
                  <View key={c.id} className="flex-row justify-between items-center bg-notion-card border border-notion-border p-4 rounded-md mb-2">
                    <Text className="font-mono text-notion-text">{c.name}</Text>
                    <TouchableOpacity onPress={() => handleDeleteCategory(c.id, c.name)} className="px-2 py-1">
                      <Text className="text-red-500 font-mono text-xs">Xóa</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

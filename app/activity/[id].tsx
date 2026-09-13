import { View, Text, TouchableOpacity, ScrollView, Alert, TouchableWithoutFeedback } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { Activity, getActivityById, deleteActivity, toggleActivityStatus } from '../../src/database/activities';

export default function ActivityDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);

  const loadData = useCallback(() => {
    if (id) {
      const data = getActivityById(id);
      setActivity(data);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (!activity) {
    return (
      <View className="flex-1 bg-black/60 items-center justify-center">
        <View className="bg-notion-card p-6 rounded-xl border border-notion-border">
          <Text className="text-notion-muted font-mono">Đang tải...</Text>
        </View>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('Xóa công việc', 'Bạn có chắc chắn muốn xóa?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => {
          deleteActivity(activity.id);
          router.back();
      }}
    ]);
  };

  const handleToggle = () => {
    toggleActivityStatus(activity.id, activity.status);
    loadData(); // Load lại status
  };

  const isCompleted = activity.status === 'hoàn thành';

  return (
    // Nền tối mờ, bấm vào ngoài hộp để đóng
    <TouchableOpacity 
      activeOpacity={1} 
      onPress={() => router.back()} 
      className="flex-1 bg-black/70 justify-center items-center p-4"
    >
      <TouchableWithoutFeedback>
        {/* Hộp thoại Modal hình chữ nhật lơ lửng */}
        <View className="w-full max-h-[80%] bg-notion-bg rounded-xl border border-notion-border overflow-hidden shadow-lg shadow-black">
          
          {/* Header của Modal */}
          <View className="flex-row justify-between items-center p-4 border-b border-notion-border bg-notion-card">
            <Text className="text-notion-text font-mono-bold text-lg">Chi Tiết</Text>
            <View className="flex-row gap-4">
              <TouchableOpacity onPress={() => { router.back(); router.push(`/add-activity?id=${activity.id}`); }}>
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

          {/* Nội dung chính cuộn được */}
          <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
            {/* Tiêu đề & Trạng thái */}
            <View className="flex-row items-start mb-6">
              <TouchableOpacity 
                onPress={handleToggle}
                className={`w-7 h-7 rounded border items-center justify-center mr-3 mt-1 ${isCompleted ? 'bg-notion-text border-notion-text' : 'border-notion-muted'}`}
              >
                {isCompleted && <Text className="text-notion-bg text-sm">✓</Text>}
              </TouchableOpacity>
              
              <View className="flex-1">
                <Text className={`text-xl font-mono-bold ${isCompleted ? 'text-notion-muted line-through' : 'text-notion-text'}`}>
                  {activity.title}
                </Text>
                
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {activity.category && (
                    <View className="bg-notion-card border border-notion-border px-2 py-0.5 rounded-md">
                      <Text className="text-notion-muted font-mono text-xs">{activity.category}</Text>
                    </View>
                  )}
                  <View className={`px-2 py-0.5 rounded-md border ${activity.priority === 'cao' ? 'border-red-500 bg-red-900/30' : activity.priority === 'trung bình' ? 'border-yellow-500 bg-yellow-900/30' : 'border-green-500 bg-green-900/30'}`}>
                    <Text className={`font-mono text-[10px] uppercase ${activity.priority === 'cao' ? 'text-red-400' : activity.priority === 'trung bình' ? 'text-yellow-400' : 'text-green-400'}`}>
                      {activity.priority}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Thông tin chi tiết */}
            <View className="bg-[#1e1e1e] rounded-lg p-4 mb-4">
              {/* Thời gian */}
              {(activity.start_date || activity.deadline) && (
                <View className="mb-4">
                  <Text className="text-notion-muted font-mono text-[10px] mb-1">THỜI GIAN</Text>
                  <Text className="text-notion-text font-mono text-sm">
                    {activity.start_date ? new Date(activity.start_date).toLocaleString('vi-VN', {hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit'}) : '--'}
                    {' -> '}
                    {activity.deadline ? new Date(activity.deadline).toLocaleString('vi-VN', {hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit'}) : '--'}
                  </Text>
                </View>
              )}

              {/* Địa điểm */}
              {activity.location && (
                <View className="mb-4">
                  <Text className="text-notion-muted font-mono text-[10px] mb-1">ĐỊA ĐIỂM</Text>
                  <Text className="text-notion-text font-mono text-sm">{activity.location}</Text>
                </View>
              )}

              {/* Ghi chú */}
              {activity.notes && (
                <View>
                  <Text className="text-notion-muted font-mono text-[10px] mb-1">GHI CHÚ</Text>
                  <Text className="text-notion-text font-mono text-sm leading-relaxed">{activity.notes}</Text>
                </View>
              )}
              
              {(!activity.start_date && !activity.deadline && !activity.location && !activity.notes) && (
                <Text className="text-notion-muted font-mono italic text-xs">Không có thông tin chi tiết.</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </TouchableOpacity>
  );
}

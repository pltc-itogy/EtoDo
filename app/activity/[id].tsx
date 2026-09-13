import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
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
      <View className="flex-1 bg-notion-bg items-center justify-center">
        <Text className="text-notion-muted font-mono">Đang tải...</Text>
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
    <ScrollView className="flex-1 bg-notion-bg p-4 pt-10">
      <View className="flex-row justify-between items-center mb-8">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-notion-muted font-mono text-lg">← Trở về</Text>
        </TouchableOpacity>
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={() => router.push(`/add-activity?id=${activity.id}`)}>
            <Text className="text-blue-500 font-mono-bold text-base">Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text className="text-red-500 font-mono-bold text-base">Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row items-start mb-6">
        <TouchableOpacity 
          onPress={handleToggle}
          className={`w-8 h-8 rounded border items-center justify-center mr-4 mt-1 ${isCompleted ? 'bg-notion-text border-notion-text' : 'border-notion-muted'}`}
        >
          {isCompleted && <Text className="text-notion-bg text-base">✓</Text>}
        </TouchableOpacity>
        
        <View className="flex-1">
          <Text className={`text-2xl font-mono-bold ${isCompleted ? 'text-notion-muted line-through' : 'text-notion-text'}`}>
            {activity.title}
          </Text>
          
          <View className="flex-row flex-wrap gap-2 mt-4">
            {activity.category && (
              <View className="bg-notion-card border border-notion-border px-3 py-1 rounded-md">
                <Text className="text-notion-muted font-mono text-xs">{activity.category}</Text>
              </View>
            )}
            <View className={`px-3 py-1 rounded-md border ${activity.priority === 'cao' ? 'border-red-500 bg-red-900/30' : activity.priority === 'trung bình' ? 'border-yellow-500 bg-yellow-900/30' : 'border-green-500 bg-green-900/30'}`}>
              <Text className={`font-mono text-xs ${activity.priority === 'cao' ? 'text-red-400' : activity.priority === 'trung bình' ? 'text-yellow-400' : 'text-green-400'}`}>
                {activity.priority.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="bg-notion-card border border-notion-border rounded-lg p-4 space-y-4">
        {/* Thời gian */}
        {(activity.start_date || activity.deadline) && (
          <View className="mb-4">
            <Text className="text-notion-muted font-mono text-xs mb-1">THỜI GIAN</Text>
            <Text className="text-notion-text font-mono">
              {activity.start_date ? new Date(activity.start_date).toLocaleString('vi-VN', {hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit', year: 'numeric'}) : '--'}
              {' -> '}
              {activity.deadline ? new Date(activity.deadline).toLocaleString('vi-VN', {hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit', year: 'numeric'}) : '--'}
            </Text>
          </View>
        )}

        {/* Địa điểm */}
        {activity.location && (
          <View className="mb-4">
            <Text className="text-notion-muted font-mono text-xs mb-1">ĐỊA ĐIỂM</Text>
            <Text className="text-notion-text font-mono">{activity.location}</Text>
          </View>
        )}

        {/* Ghi chú */}
        {activity.notes && (
          <View>
            <Text className="text-notion-muted font-mono text-xs mb-1">GHI CHÚ</Text>
            <Text className="text-notion-text font-mono leading-relaxed">{activity.notes}</Text>
          </View>
        )}
        
        {(!activity.start_date && !activity.deadline && !activity.location && !activity.notes) && (
          <Text className="text-notion-muted font-mono italic text-sm">Không có thông tin chi tiết.</Text>
        )}
      </View>

    </ScrollView>
  );
}

import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Activity, toggleActivityStatus, deleteActivity } from '../database/activities';
import { Alert } from 'react-native';

interface Props {
  activities: Activity[];
  onRefresh: () => void;
}

export default function TodayGallery({ activities, onRefresh }: Props) {
  // Lấy ngày hôm nay theo format cục bộ
  const today = new Date().toLocaleDateString('vi-VN');
  
  // Lọc các task của ngày hôm nay (hoặc chưa làm mà ko có ngày)
  const todayActivities = activities.filter(a => {
    const isStartDateToday = a.start_date && new Date(a.start_date).toLocaleDateString('vi-VN') === today;
    const isDeadlineToday = a.deadline && new Date(a.deadline).toLocaleDateString('vi-VN') === today;
    const noDateButPending = !a.start_date && !a.deadline && a.status !== 'hoàn thành';
    return isStartDateToday || isDeadlineToday || noDateButPending;
  });

  const confirmDelete = (id: string) => {
    Alert.alert('Xóa công việc', 'Bạn có chắc muốn xóa không?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => { deleteActivity(id); onRefresh(); } }
    ]);
  };

  const prioColors: Record<string, string> = {
    'cao': 'bg-red-900/30 border-red-500 text-red-400',
    'trung bình': 'bg-yellow-900/30 border-yellow-500 text-yellow-400',
    'thấp': 'bg-green-900/30 border-green-500 text-green-400'
  };

  if (todayActivities.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-notion-muted font-mono text-center">Hôm nay trống! Quá tuyệt vời 🎉</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4">
      <View className="flex-row flex-wrap justify-between">
        {todayActivities.map(activity => {
          const isCompleted = activity.status === 'hoàn thành';
          const pColor = prioColors[activity.priority] || prioColors['trung bình'];

          return (
            <TouchableOpacity 
              key={activity.id}
              onPress={() => { toggleActivityStatus(activity.id, activity.status); onRefresh(); }}
              className={`w-[48%] bg-notion-card border border-notion-border rounded-lg p-4 mb-4 ${isCompleted ? 'opacity-50' : ''}`}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className={`w-5 h-5 border rounded-sm items-center justify-center ${isCompleted ? 'bg-notion-text border-notion-text' : 'border-notion-muted'}`}>
                  {isCompleted && <Text className="text-notion-bg text-xs">✓</Text>}
                </View>
                <TouchableOpacity onPress={() => confirmDelete(activity.id)}>
                  <Text className="text-red-500 font-mono-bold">X</Text>
                </TouchableOpacity>
              </View>

              <Text className={`font-mono-bold text-base mb-2 ${isCompleted ? 'text-notion-muted line-through' : 'text-notion-text'}`}>
                {activity.title}
              </Text>

              <View className="flex-row flex-wrap gap-1">
                <View className={`px-2 py-0.5 rounded border ${pColor}`}>
                  <Text className="text-[10px] font-mono">{activity.priority.toUpperCase()}</Text>
                </View>
                {activity.category && (
                  <View className="px-2 py-0.5 rounded border border-notion-border bg-notion-bg">
                    <Text className="text-[10px] font-mono text-notion-muted">{activity.category}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

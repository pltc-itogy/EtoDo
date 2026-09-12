import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Activity, toggleActivityStatus, deleteActivity } from '../database/activities';

interface Props {
  activities: Activity[];
  onRefresh: () => void;
}

export default function AllList({ activities, onRefresh }: Props) {
  const confirmDelete = (id: string) => {
    Alert.alert('Xóa', 'Bạn có chắc muốn xóa?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => { deleteActivity(id); onRefresh(); } }
    ]);
  };

  const prioTextColors: Record<string, string> = {
    'cao': 'text-red-400 border-red-500 bg-red-900/30',
    'trung bình': 'text-yellow-400 border-yellow-500 bg-yellow-900/30',
    'thấp': 'text-green-400 border-green-500 bg-green-900/30'
  };

  return (
    <ScrollView className="flex-1 p-4">
      {activities.length === 0 ? (
        <Text className="text-notion-muted font-mono italic text-center mt-4">Chưa có công việc nào.</Text>
      ) : (
        activities.map(activity => {
          const isCompleted = activity.status === 'hoàn thành';
          const prioClass = prioTextColors[activity.priority] || prioTextColors['trung bình'];

          return (
            <TouchableOpacity 
              key={activity.id}
              onPress={() => { toggleActivityStatus(activity.id, activity.status); onRefresh(); }}
              className={`bg-notion-card border border-notion-border rounded-lg p-4 mb-3 flex-row items-center ${isCompleted ? 'opacity-50' : ''}`}
            >
              <View className={`w-5 h-5 border rounded-sm mr-4 items-center justify-center ${isCompleted ? 'bg-notion-text border-notion-text' : 'border-notion-muted'}`}>
                {isCompleted && <Text className="text-notion-bg text-xs">✓</Text>}
              </View>
              
              <View className="flex-1">
                <Text className={`font-mono-bold text-base ${isCompleted ? 'text-notion-muted line-through' : 'text-notion-text'}`}>
                  {activity.title}
                </Text>
                <View className="flex-row flex-wrap mt-2 gap-2 items-center">
                  <View className={`px-2 py-0.5 rounded border ${prioClass}`}>
                    <Text className="text-[10px] font-mono">{activity.priority.toUpperCase()}</Text>
                  </View>
                  {activity.category && (
                    <View className="px-2 py-0.5 rounded border border-notion-border bg-notion-bg">
                      <Text className="text-[10px] font-mono text-notion-muted">{activity.category}</Text>
                    </View>
                  )}
                  {activity.start_date && (
                    <Text className="text-[10px] font-mono text-notion-muted ml-1">
                      Bắt đầu: {new Date(activity.start_date).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - {new Date(activity.start_date).toLocaleDateString('vi-VN')}
                    </Text>
                  )}
                  {activity.deadline && (
                    <Text className="text-[10px] font-mono text-notion-muted ml-1">
                      Hạn: {new Date(activity.deadline).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - {new Date(activity.deadline).toLocaleDateString('vi-VN')}
                    </Text>
                  )}
                </View>
              </View>

              <TouchableOpacity onPress={() => confirmDelete(activity.id)} className="p-2 ml-2">
                <Text className="text-red-500 font-mono-bold">X</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

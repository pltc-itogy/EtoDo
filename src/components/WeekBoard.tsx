import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Activity, toggleActivityStatus, deleteActivity } from '../database/activities';

interface Props {
  activities: Activity[];
  onRefresh: () => void;
}

export default function WeekBoard({ activities, onRefresh }: Props) {
  // Sinh ra 7 ngày tới (bắt đầu từ ngày mai)
  const next7Days: Date[] = [];
  const todayDate = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() + i);
    next7Days.push(d);
  }

  // Gom nhóm task theo từng ngày
  const grouped: Record<string, Activity[]> = {};
  next7Days.forEach(d => {
    grouped[d.toLocaleDateString('vi-VN')] = [];
  });

  activities.forEach(a => {
    const dStr = a.deadline ? new Date(a.deadline).toLocaleDateString('vi-VN') 
             : a.start_date ? new Date(a.start_date).toLocaleDateString('vi-VN') : null;
    if (dStr && grouped[dStr]) {
      grouped[dStr].push(a);
    }
  });

  // Sắp xếp từng ngày theo thời gian
  Object.keys(grouped).forEach(k => {
    grouped[k].sort((a, b) => {
      const timeA = a.start_date || a.deadline || '9999';
      const timeB = b.start_date || b.deadline || '9999';
      return timeA.localeCompare(timeB);
    });
  });

  const confirmDelete = (id: string) => {
    Alert.alert('Xóa công việc', 'Bạn có chắc muốn xóa không?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => { deleteActivity(id); onRefresh(); } }
    ]);
  };

  const getDayName = (d: Date) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[d.getDay()];
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 p-4">
      {next7Days.map((d, index) => {
        const dStr = d.toLocaleDateString('vi-VN');
        const dayActivities = grouped[dStr];

        return (
          <View key={index} className="w-64 mr-4 bg-notion-card border border-notion-border rounded-lg p-3">
            <View className="mb-4 pb-2 border-b border-notion-border flex-row justify-between items-end">
              <Text className="font-mono-bold text-notion-text text-base">
                {getDayName(d)}, {d.getDate()}/{d.getMonth() + 1}
              </Text>
              <Text className="font-mono text-notion-muted text-xs">{dayActivities.length} task</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {dayActivities.length === 0 ? (
                <Text className="text-notion-muted font-mono text-xs italic text-center mt-4">Trống</Text>
              ) : (
                dayActivities.map(activity => {
                  const isCompleted = activity.status === 'hoàn thành';
                  return (
                    <TouchableOpacity 
                      key={activity.id}
                      onPress={() => { toggleActivityStatus(activity.id, activity.status); onRefresh(); }}
                      className={`bg-notion-bg border border-notion-border rounded p-3 mb-3 ${isCompleted ? 'opacity-50' : ''}`}
                    >
                      <View className="flex-row justify-between items-start mb-1">
                        <View className="flex-1">
                          <Text className={`font-mono-bold text-sm ${isCompleted ? 'text-notion-muted line-through' : 'text-notion-text'}`}>
                            {activity.title}
                          </Text>
                          {(activity.start_date || activity.deadline) && (
                            <Text className="text-[10px] font-mono text-notion-muted mt-1">
                              ⏰ {activity.start_date ? new Date(activity.start_date).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : ''}
                              {activity.start_date && activity.deadline ? ' - ' : ''}
                              {activity.deadline ? new Date(activity.deadline).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : ''}
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity onPress={() => confirmDelete(activity.id)}>
                          <Text className="text-red-500 font-mono text-xs ml-2">X</Text>
                        </TouchableOpacity>
                      </View>
                      {activity.category && (
                        <Text className="font-mono text-[10px] text-notion-muted">{activity.category}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        );
      })}
    </ScrollView>
  );
}

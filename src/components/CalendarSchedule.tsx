import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Activity, toggleActivityStatus, deleteActivity } from '../database/activities';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useState } from 'react';

// Cấu hình ngôn ngữ Tiếng Việt cho Lịch
LocaleConfig.locales['vi'] = {
  monthNames: ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'],
  monthNamesShort: ['Th.1','Th.2','Th.3','Th.4','Th.5','Th.6','Th.7','Th.8','Th.9','Th.10','Th.11','Th.12'],
  dayNames: ['Chủ Nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'],
  dayNamesShort: ['CN','T2','T3','T4','T5','T6','T7'],
  today: 'Hôm nay'
};
LocaleConfig.defaultLocale = 'vi';

interface Props {
  activities: Activity[];
  onRefresh: () => void;
}

export default function CalendarSchedule({ activities, onRefresh }: Props) {
  // Mặc định chọn ngày hôm nay
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  // Vẽ các chấm báo hiệu ngày có task
  const markedDates: Record<string, any> = {};
  activities.forEach(a => {
    const dStr = a.deadline || a.start_date;
    if (dStr) {
      const dateKey = dStr.split('T')[0]; // Lấy phần YYYY-MM-DD
      if (!markedDates[dateKey]) {
        markedDates[dateKey] = { marked: true, dotColor: '#E6E6E6' };
      }
    }
  });

  // Highlight ngày đang được chọn
  markedDates[selectedDate] = { 
    ...markedDates[selectedDate], 
    selected: true, 
    selectedColor: '#FFFFFF',
    selectedTextColor: '#191919'
  };

  // Lọc task tương ứng với ngày đang chọn và sắp xếp theo giờ
  const selectedActivities = activities.filter(a => {
    const dStr = a.deadline || a.start_date;
    return dStr && dStr.startsWith(selectedDate);
  }).sort((a, b) => {
    const timeA = a.start_date || a.deadline || '9999';
    const timeB = b.start_date || b.deadline || '9999';
    return timeA.localeCompare(timeB);
  });

  const confirmDelete = (id: string) => {
    Alert.alert('Xóa', 'Bạn có chắc muốn xóa?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => { deleteActivity(id); onRefresh(); } }
    ]);
  };

  return (
    <View className="flex-1 bg-notion-bg">
      <Calendar
        current={selectedDate}
        onDayPress={(day: any) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          backgroundColor: '#191919',
          calendarBackground: '#191919',
          textSectionTitleColor: '#9B9B9B',
          selectedDayBackgroundColor: '#FFFFFF',
          selectedDayTextColor: '#191919',
          todayTextColor: '#FFFFFF',
          dayTextColor: '#E6E6E6',
          textDisabledColor: '#333333',
          dotColor: '#9B9B9B',
          selectedDotColor: '#191919',
          arrowColor: '#FFFFFF',
          monthTextColor: '#FFFFFF',
          textDayFontFamily: 'JetBrainsMono_400Regular',
          textMonthFontFamily: 'JetBrainsMono_700Bold',
          textDayHeaderFontFamily: 'JetBrainsMono_400Regular',
        }}
      />

      <ScrollView className="flex-1 p-4 border-t border-notion-border mt-2 pt-4">
        <Text className="font-mono-bold text-notion-text mb-4">
          Hoạt động ngày {selectedDate.split('-').reverse().join('/')}:
        </Text>
        
        {selectedActivities.length === 0 ? (
          <Text className="font-mono text-notion-muted italic">Trống</Text>
        ) : (
          selectedActivities.map(activity => {
            const isCompleted = activity.status === 'hoàn thành';
            return (
              <TouchableOpacity 
                key={activity.id}
                onPress={() => { toggleActivityStatus(activity.id, activity.status); onRefresh(); }}
                className={`bg-notion-card border border-notion-border rounded p-4 mb-3 flex-row items-center ${isCompleted ? 'opacity-50' : ''}`}
              >
                <View className={`w-5 h-5 border rounded-sm mr-3 items-center justify-center ${isCompleted ? 'bg-notion-text border-notion-text' : 'border-notion-muted'}`}>
                  {isCompleted && <Text className="text-notion-bg text-xs">✓</Text>}
                </View>
                <View className="flex-1">
                  <Text className={`font-mono-bold text-base ${isCompleted ? 'text-notion-muted line-through' : 'text-notion-text'}`}>
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
                  <Text className="text-red-500 font-mono ml-3">X</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Activity, getActivities } from '../../src/database/activities';

import TodayGallery from '../../src/components/TodayGallery';
import WeekBoard from '../../src/components/WeekBoard';
import CalendarSchedule from '../../src/components/CalendarSchedule';
import AllList from '../../src/components/AllList';

export default function Dashboard() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentView, setCurrentView] = useState<'today' | 'week' | 'calendar' | 'all'>('today');

  const loadData = useCallback(() => {
    const data = getActivities();
    setActivities(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const views = [
    { id: 'today', label: 'Hôm nay' },
    { id: 'week', label: '7 Ngày tới' },
    { id: 'calendar', label: 'Lịch trình 📅' },
    { id: 'all', label: 'Tất cả 📋' },
  ];

  return (
    <View className="flex-1 bg-notion-bg">
      {/* Header */}
      <View className="flex-row justify-between items-center p-4">
        <Text className="text-2xl font-mono-bold text-notion-text">Activities</Text>
        <TouchableOpacity 
          onPress={() => router.push('/add-activity')}
          className="bg-notion-text px-3 py-1 rounded"
        >
          <Text className="text-notion-bg font-mono-bold text-lg">+</Text>
        </TouchableOpacity>
      </View>

      {/* View Selector (Tabs) chuẩn Notion */}
      <View className="border-b border-notion-border pb-2 px-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {views.map((v) => (
            <TouchableOpacity 
              key={v.id}
              onPress={() => setCurrentView(v.id as any)}
              className={`mr-3 px-3 py-1.5 rounded ${currentView === v.id ? 'bg-notion-card border border-notion-border' : ''}`}
            >
              <Text className={`font-mono text-sm ${currentView === v.id ? 'text-notion-text font-mono-bold' : 'text-notion-muted'}`}>
                {v.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Vùng hiển thị Layout tương ứng */}
      <View className="flex-1">
        {currentView === 'today' && <TodayGallery activities={activities} onRefresh={loadData} />}
        {currentView === 'week' && <WeekBoard activities={activities} onRefresh={loadData} />}
        {currentView === 'calendar' && <CalendarSchedule activities={activities} onRefresh={loadData} />}
        {currentView === 'all' && <AllList activities={activities} onRefresh={loadData} />}
      </View>
    </View>
  );
}

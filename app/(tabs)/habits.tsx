import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { getHabitsWithTodayLog, toggleHabitLog, HabitWithStreak } from '../../src/database/habits';
import { getActivities, toggleActivityStatus, Activity } from '../../src/database/activities';

export default function HabitsTab() {
  const router = useRouter();
  const [habits, setHabits] = useState<HabitWithStreak[]>([]);
  const [tasks, setTasks] = useState<Activity[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = () => {
    // 1. Load Habits
    const todayStr = new Date().toISOString().split('T')[0];
    const habitsData = getHabitsWithTodayLog(todayStr);
    setHabits(habitsData);

    // 2. Load Priority Tasks (Category 'Công việc' and not completed)
    const allActivities = getActivities();
    let priorityTasks = allActivities.filter(
      a => a.category?.toLowerCase() === 'công việc' && a.status !== 'hoàn thành'
    );

    // Sort by priority (Cao -> Trung bình -> Thấp)
    const priorityWeight: Record<string, number> = { 'cao': 3, 'trung bình': 2, 'thấp': 1 };
    priorityTasks.sort((a, b) => {
      const wA = priorityWeight[a.priority?.toLowerCase()] || 0;
      const wB = priorityWeight[b.priority?.toLowerCase()] || 0;
      return wB - wA;
    });

    setTasks(priorityTasks);
  };

  const handleToggleHabit = (habitId: string, currentStatus: boolean) => {
    const todayStr = new Date().toISOString().split('T')[0];
    toggleHabitLog(habitId, todayStr, !currentStatus);
    loadData(); // Reload UI
  };

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    toggleActivityStatus(taskId, currentStatus);
    loadData(); // Reload UI
  };

  // Hàm render màu viền/nền theo priority
  const getPriorityColor = (priority?: string) => {
    const p = priority?.toLowerCase();
    if (p === 'cao') return 'border-red-500';
    if (p === 'trung bình') return 'border-yellow-500';
    if (p === 'thấp') return 'border-green-500';
    return 'border-notion-border';
  };

  return (
    <View className="flex-1 bg-notion-bg">
      <ScrollView className="flex-1 p-4 pt-10" showsVerticalScrollIndicator={false}>
        
        {/* --- PHẦN 1: THÓI QUEN --- */}
        <View className="flex-row justify-between items-center mb-6 mt-2">
          <Text className="text-xl font-mono-bold text-notion-text">Daily Habits</Text>
          <TouchableOpacity onPress={() => router.push('/add-habit')}>
            <Text className="text-notion-text font-mono-bold">+ Thêm</Text>
          </TouchableOpacity>
        </View>

        {habits.length === 0 ? (
          <Text className="text-notion-muted font-mono italic text-center mb-6">
            Bạn chưa có thói quen nào.
          </Text>
        ) : (
          <View className="flex-row flex-wrap justify-between mb-8">
            {habits.map(h => (
              <TouchableOpacity 
                key={h.id} 
                onPress={() => handleToggleHabit(h.id, h.is_completed_today)}
                className="bg-notion-card border border-notion-border rounded-lg p-4 w-[48%] mb-4 items-center"
              >
                <Text className="text-3xl mb-2">{h.icon || '🎯'}</Text>
                <Text className="text-notion-text font-mono-bold text-center mb-2" numberOfLines={1}>
                  {h.name}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs text-orange-400 font-mono-bold">🔥 {h.streak}</Text>
                  <View className={`w-5 h-5 rounded-sm border ${h.is_completed_today ? 'bg-notion-text border-notion-text' : 'border-notion-muted'} items-center justify-center`}>
                    {h.is_completed_today && <Text className="text-notion-bg text-xs">✓</Text>}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}


        <View className="flex-row justify-between items-center mb-4 mt-4">
          <Text className="text-xl font-mono-bold text-notion-text">Priority Tasks</Text>
          <TouchableOpacity onPress={() => router.push('/add-activity?initialCategory=Công việc')}>
            <Text className="text-notion-text font-mono-bold">+ Task</Text>
          </TouchableOpacity>
        </View>

        {tasks.length === 0 ? (
          <Text className="text-notion-muted font-mono italic text-center mt-4">
            Không có công việc ưu tiên nào cần làm.
          </Text>
        ) : (
          ['cao', 'trung bình', 'thấp'].map(level => {
            const levelTasks = tasks.filter(t => t.priority === level);
            if (levelTasks.length === 0) return null;
            
            return (
              <View key={level} className="mb-2">
                <Text className="text-notion-muted font-mono-bold text-xs uppercase mb-2">MỨC ĐỘ: {level}</Text>
                {levelTasks.map(t => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => router.push(`/activity/${t.id}`)}
                    className={`bg-notion-card border-l-4 ${getPriorityColor(t.priority)} border-y border-r border-y-notion-border border-r-notion-border rounded-md p-4 mb-3 flex-row items-center justify-between`}
                  >
                    <View className="flex-1 mr-3">
                      <Text className="font-mono-bold text-notion-text text-base" numberOfLines={2}>
                        {t.title}
                      </Text>
                    </View>
                    
                    <TouchableOpacity 
                      onPress={() => handleToggleTask(t.id, t.status)}
                      className="w-6 h-6 rounded-sm border border-notion-muted items-center justify-center"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            );
          })
        )}

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}

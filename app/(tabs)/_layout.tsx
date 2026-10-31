import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

// Khai báo component TabIcon tuỳ chỉnh để tạo hiệu ứng bong bóng
const TabIcon = ({ name, focused }: { name: any, focused: boolean }) => {
  const iconColor = focused ? '#EBEBEB' : '#9B9B9B';
  
  return (
    <View 
      className="items-center justify-center rounded-full mt-1"
      style={[
        { width: 50, height: 32 },
        focused ? { backgroundColor: '#333333', borderColor: '#444444', borderWidth: 1 } : undefined
      ]}
    >
      <Ionicons name={name} size={20} color={iconColor} />
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: true, 
      tabBarActiveTintColor: '#EBEBEB',
      tabBarInactiveTintColor: '#9B9B9B',
      tabBarStyle: { 
        backgroundColor: '#1E1E1E', 
        borderTopColor: '#2E2E2E',
        height: 65,
        paddingBottom: 8,
      },
      headerStyle: { backgroundColor: '#1E1E1E', elevation: 0 },
      headerTintColor: '#EBEBEB',
      headerTitleStyle: { fontFamily: 'JetBrainsMono_700Bold' },
      tabBarShowLabel: true,
      tabBarLabelStyle: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, marginTop: 4 }
    }}>
      <Tabs.Screen 
        name="activities" 
        options={{ 
          title: 'Hoạt động',
          tabBarIcon: ({ focused }) => <TabIcon name="calendar-outline" focused={focused} />
        }} 
      />
      <Tabs.Screen 
        name="journal" 
        options={{ 
          title: 'Nhật ký',
          tabBarIcon: ({ focused }) => <TabIcon name="book-outline" focused={focused} />
        }} 
      />
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home-outline" focused={focused} />
        }} 
      />
      <Tabs.Screen 
        name="english" 
        options={{ 
          title: 'Notes',
          tabBarIcon: ({ focused }) => <TabIcon name="document-text-outline" focused={focused} />
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Cài đặt',
          tabBarIcon: ({ focused }) => <TabIcon name="settings-outline" focused={focused} />
        }} 
      />
    </Tabs>
  );
}

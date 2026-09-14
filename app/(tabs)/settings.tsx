import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../src/services/supabase';
import { useUserStore } from '../../src/store';
import { sync } from '../../src/services/sync';

export default function SettingsTab() {
  const { user } = useUserStore();

  const handleLogout = async () => {
    Alert.alert(
      "Đăng xuất", 
      "Bạn có chắc chắn muốn đăng xuất không? Dữ liệu chưa đồng bộ có thể bị mất.",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Đồng ý", 
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
          }
        }
      ]
    );
  };

  const handleSync = () => {
    sync(false);
  };

  return (
    <View className="flex-1 bg-notion-bg p-4 pt-4">
      
      <View className="bg-notion-card border border-notion-border rounded-lg p-4 mb-6">
        <Text className="text-notion-muted font-mono mb-2">Tài khoản hiện tại:</Text>
        <Text className="text-notion-text font-mono-bold text-base mb-1">{user?.email}</Text>
      </View>

      <TouchableOpacity 
        onPress={handleSync}
        className="bg-notion-text rounded-md p-4 items-center mb-4"
      >
        <Text className="text-notion-bg font-mono-bold text-base">Đồng bộ dữ liệu (Sync)</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={handleLogout}
        className="bg-notion-bg border border-red-500 rounded-md p-4 items-center"
      >
        <Text className="text-red-500 font-mono-bold text-base">Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

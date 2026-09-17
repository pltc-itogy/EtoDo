import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { supabase } from '../../src/services/supabase';
import { useUserStore } from '../../src/store';
import { sync } from '../../src/services/sync';
import { clearAllData } from '../../src/database/connection';
import { useState } from 'react';
import { pickAndParseFile, FileData } from '../../src/services/importExport';
import ImportMappingModal from '../../src/components/ImportMappingModal';

export default function SettingsTab() {
  const { user } = useUserStore();
  const [isImporting, setIsImporting] = useState(false);
  const [fileData, setFileData] = useState<FileData | null>(null);

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Bạn có chắc chắn muốn đăng xuất không? Dữ liệu chưa đồng bộ có thể bị mất.");
      if (confirmed) {
        clearAllData();
        try { await supabase.auth.signOut(); } catch(e) {}
        useUserStore.getState().setUser(null);
      }
      return;
    }

    Alert.alert(
      "Đăng xuất", 
      "Bạn có chắc chắn muốn đăng xuất không? Dữ liệu chưa đồng bộ có thể bị mất.",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Đồng ý", 
          style: "destructive",
          onPress: async () => {
            // Xóa sạch toàn bộ dữ liệu trước (để đảm bảo không bị lỗi khóa nếu Supabase treo)
            clearAllData();
            
            try {
              await supabase.auth.signOut();
            } catch (e) {
              console.log('Lỗi signOut supabase:', e);
            }
            
            // Ép xóa state đăng nhập để chuyển trang ngay lập tức
            useUserStore.getState().setUser(null);
          }
        }
      ]
    );
  };

  const handleSync = () => {
    sync(false);
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);
      const data = await pickAndParseFile();
      if (data) {
        setFileData(data);
      }
    } catch (e: any) {
      Alert.alert("Lỗi", e.message);
    } finally {
      setIsImporting(false);
    }
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
        className="bg-notion-bg border border-red-500 rounded-md p-4 items-center mb-6"
      >
        <Text className="text-red-500 font-mono-bold text-base">Đăng xuất</Text>
      </TouchableOpacity>

      <View className="mb-6">
        <Text className="text-notion-muted font-mono mb-2">Quản lý dữ liệu</Text>
        
        <TouchableOpacity 
          onPress={handleImport}
          disabled={isImporting}
          className={`border border-notion-border rounded-md p-4 items-center mb-4 ${isImporting ? 'opacity-50' : ''}`}
        >
          <Text className="text-notion-text font-mono-bold text-base">
            {isImporting ? 'Đang đọc file...' : '📥 Nhập dữ liệu (CSV/Excel/Notion ZIP)'}
          </Text>
        </TouchableOpacity>

        {/* Nút Xuất dữ liệu sẽ được triển khai sau nếu cần */}
      </View>

      <ImportMappingModal 
        visible={!!fileData}
        fileData={fileData}
        onClose={() => setFileData(null)}
        onSuccess={() => { setFileData(null); handleSync(); }}
      />
    </View>
  );
}

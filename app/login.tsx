import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { supabase } from '../src/services/supabase';
import { useRouter } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Hàm xử lý Đăng nhập
  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    
    if (error) {
      Alert.alert('Lỗi đăng nhập', error.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  // Hàm xử lý Đăng ký
  const handleSignUp = async () => {
    if (!email || !password) return Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    
    if (error) {
      Alert.alert('Lỗi đăng ký', error.message);
    } else {
      Alert.alert('Thành công', 'Vui lòng kiểm tra email để xác nhận tài khoản!');
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-notion-bg">
      <Text className="text-4xl font-mono-bold text-notion-text mb-8 text-center">
        EtoDo.
      </Text>

      <View className="bg-notion-card p-6 rounded-xl border border-notion-border shadow-sm">
        <Text className="text-notion-text font-mono mb-2">Email</Text>
        <TextInput
          className="bg-notion-bg text-notion-text font-mono border border-notion-border rounded-md px-4 py-3 mb-4"
          placeholder="your@email.com"
          placeholderTextColor="#9B9B9B"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text className="text-notion-text font-mono mb-2">Mật khẩu</Text>
        <TextInput
          className="bg-notion-bg text-notion-text font-mono border border-notion-border rounded-md px-4 py-3 mb-6"
          placeholder="********"
          placeholderTextColor="#9B9B9B"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity 
          onPress={handleLogin}
          disabled={loading}
          className="bg-notion-text py-3 rounded-md items-center mb-3"
        >
          <Text className="text-notion-bg font-mono-bold text-base">
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleSignUp}
          disabled={loading}
          className="py-3 rounded-md items-center border border-notion-border"
        >
          <Text className="text-notion-text font-mono-bold text-base">
            Tạo tài khoản mới
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
